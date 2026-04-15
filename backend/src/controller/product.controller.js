import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "../config/cloudinary.js";
import { redis } from "../config/redis.js";
import Product from "../model/product.model.js";
import { ENV } from "../config/env.js";


const useAI = Boolean(ENV.GEMINI_API_KEY)
const genAI = useAI ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY) : null
const model = useAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null

const clearProductCaches = async () => {
    const keys = await redis.keys('products:*')
    if (keys.length > 0) {
        await redis.del(...keys)
    }
}

const isAdminUser = (user) => {
    if (!user) return false
    return user.role === 'admin' || user.owner === true || user.email === ENV.ADMIN_EMAIL
}

const isApprovedSeller = (user) => {
    return user?.role === 'seller' && Boolean(user?.isApproved)
}

export const createProduct = async (req, res) => {
    try {
        const viewer = req.user
        if (!viewer) {
            return res.status(401).json({ message: 'Please login first' })
        }

        if (!isAdminUser(viewer) && !isApprovedSeller(viewer)) {
            return res.status(403).json({ message: 'Only approved sellers or admins can create products' })
        }

        const name = req.body.name || req.body.title || req.body.productName || req.body.description;
        const description = req.body.description || req.body.details || req.body.productDescription || req.body.name;
        const price = req.body.price;
        const category = req.body.category;

        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (price === undefined || price === null || price === '') missingFields.push('price');
        if (!category) missingFields.push('category');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Please provide the following details: ${missingFields.join(', ')}`,
                received: req.body
            });
        }

        let imageUrl = "";

        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "Product"
            });

            imageUrl = uploadRes.secure_url;
        } else {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const product = await Product.create({
            name,
            category,
            price,
            description,
            imageUrl,
            owner: viewer._id,
            approvalStatus: isAdminUser(viewer) ? 'approved' : 'pending',
            approvedBy: isAdminUser(viewer) ? viewer._id : null
        });

        await clearProductCaches()

        return res.status(201).json({
            ...product.toObject(),
            message: isAdminUser(viewer)
                ? 'Product created and approved'
                : 'Product created and submitted for admin approval'
        });

    } catch (error) {
        console.log(error, "From create product controller");
        res.status(500).json({ message: "Server Error" });
    }
};

export const getProductController = async(req,res)=>{
    try {
        const page = parseInt(req.query.page ??"1", 10)
        const limit = parseInt(req.query.limit?? "20",10)
        const skip = (page-1 )*limit


        // skip ka use isliye kiya let's say user abhi first page par hai toh 
        // skip on first page,page =1 
        // let's say user abhi first page par hai toh usko sirf 20 product he show hongey lekin ab user shift ho gaya next page par toh ab usko previous page par job bhi product woh ho nhi hongey unko hum skip kar denge
        // ab user hai page 2 par toh pehle 20 products skip ho jaayenge aur next 20 producst show hongey


        // page 1 par sirf 20 products show honge
        // page 2 par next 20 producst show hongey uar pehle k 20 products skip ho jaayenge
        // then page 3 par next 20 products show hongey and past k 40 products skip ho jaayenge
        // and so on...

        const {search, category, minPrice, maxPrice} = req.query


         const prompt = `You are an intelligent assistant for an E-commerce platform. A user will type any query about what they want. Your task is to understand the intent and return most relevant keyword from the following list of categories:
- Jeans
- Pants
- Shirt
- Jacket
- Saree
- Shoes

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text. Query: "${search}"`;


        let aiText = null

        if (search && search.trim() !== "") {
            if (useAI && model) {
                try {
                    const result = await model.generateContent(prompt);
                    aiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/[`"\n]/g, "") || "";
                } catch (aiError) {
                    console.error("Gemini AI search failed:", aiError);
                    // Fallback to the raw search text if AI search is unavailable
                    aiText = search.trim();
                }
            } else {
                aiText = search.trim();
            }
        }

        let aiCategory = category;

        const mongoQuery = {}

        // Jeans 
        // jeans
        if(aiText){
            mongoQuery.$or=[
                {name:{$regex:aiText, $options:"i"}},
                {description:{$regex:aiText, $options:"i"}}
            ]
        }

        console.log(aiText)
        if(category){
            mongoQuery.category = category
        }
        
        if(minPrice || maxPrice){
            mongoQuery.price={}

            if(minPrice) mongoQuery.price.$gte = Number(minPrice)
            if(maxPrice) mongoQuery.price.$lte = Number(maxPrice)
        }

        // cache key based par filter and pagination lagana hai 


        const cacheKey = `products:v2:${JSON.stringify({
            page,
            limit,
            search:aiText??"",
            category:aiCategory??"",
            minPrice:minPrice??"",
            maxPrice:maxPrice??""
        })}`


        const  cached = await redis.get(cacheKey)

        if(cached){
            const data = typeof cached==='string'?JSON.parse(cached):cached

            return res.status(200).json({fromCached:true, ...data})

        }


        const [item, total]=await Promise.all([
            Product.find(mongoQuery)
                            .select('name category price description imageUrl isFeatured approvalStatus createdAt owner')
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .lean(),
            Product.countDocuments(mongoQuery)
        ])


        if(!item || item.length===0){
            const emptyPayload={
                products:[],
                page,
                limit,
                total:0,
                hasMore:false,
                appliedFilters:{
                    search:aiText,
                    category:aiCategory,
                    minPrice,
                    maxPrice
                }
            }

            await redis.set(cacheKey, JSON.stringify(emptyPayload))
            return res.status(200).json({fromCached:false, ...emptyPayload})
        }


        // calculate pages

        const totalPages = Math.ceil(total/limit)
        const hasMore = page < totalPages

        const payload={
            products:item,
            page,
            limit,
            total,
            totalPages,
            hasMore,
            appliedFilters:{
                search:aiText,
                category:aiCategory,
                minPrice,
                maxPrice
            }
        }


        await redis.set(cacheKey, JSON.stringify(payload), {ex:600})

        return res.status(200).json({fromCached:false, ...payload})

    } catch (error) {
        console.error(`error from getProduct controller:`, error)
        return res.status(500).json({ message: "Unable to fetch products" })
    }
}




export const getFeatureProduct = async (req, res) => {
    try {
        const cacheKey = 'products:featured'
        const cached = await redis.get(cacheKey)
        if (cached) {
            const data = typeof cached === 'string' ? JSON.parse(cached) : cached
            return res.status(200).json(data)
        }

        const featuredProducts = await Product.find({
            isFeatured: true,
            $or: [
                { approvalStatus: 'approved' },
                { approvalStatus: { $exists: false } }
            ]
        })
            .select('name category price description imageUrl isFeatured approvalStatus createdAt')
            .sort({ createdAt: -1 })
            .lean();

        await redis.set(cacheKey, JSON.stringify(featuredProducts), { ex: 600 })

        return res.status(200).json(featuredProducts);
    } catch (error) {
        console.error(`error from get feature product:`, error);
        return res.status(500).json({ message: "Unable to fetch featured products" });
    }
}

export const toggleFeatureProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

        if (product.approvalStatus && product.approvalStatus !== 'approved') {
            return res.status(400).json({ message: 'Only approved products can be featured' })
        }

    product.isFeatured = !product.isFeatured
    await product.save()

    await clearProductCaches()

    return res.status(200).json({
      message: "Product toggled successfully",
      product
    })
  } catch (error) {
    console.log("toggle error:", error)
    res.status(500).json({ message: "Server error" })
  }
}




export const deleteProduct = async(req,res)=>{
    try {
        const viewer = req.user
        const productId = req.params.id;

        const product = await Product.findById(productId)

        if(!product){
            return res.status(401).json({
                message:"Product not found"
            })
        }

        if (!isAdminUser(viewer) && String(product.owner || '') !== String(viewer?._id || '')) {
            return res.status(403).json({ message: 'You can delete only your own product' })
        }

        if(product.imageUrl){
            const publicId = product.imageUrl.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`Product/${publicId}`)
                console.log(`cloudinary image deleted`)
            } catch (error) {
                console.log(`error from deleting image:`, error)
            }
        }



        await Product.findByIdAndDelete(req.params.id)

        await clearProductCaches()


        return res.status(201).json({
            message:"Product delted succesfully"
        })
    } catch (error) {
        console.log(`error from delte PRoduct`)
    }
}

export const updateProduct = async (req, res) => {
    try {
        const viewer = req.user
        const productId = req.params.id
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        if (!isAdminUser(viewer) && String(product.owner || '') !== String(viewer?._id || '')) {
            return res.status(403).json({ message: 'You can update only your own product' })
        }

        const { name, description, category } = req.body
        const hasPriceField = req.body.price !== undefined && req.body.price !== null && req.body.price !== ''
        const parsedPrice = hasPriceField ? Number(req.body.price) : null

        if (hasPriceField && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
            return res.status(400).json({ message: "Please provide a valid price" })
        }

        if (name !== undefined) product.name = name
        if (description !== undefined) product.description = description
        if (category !== undefined) product.category = category
        if (hasPriceField) product.price = parsedPrice

        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "Product"
            })

            if (product.imageUrl) {
                const publicId = product.imageUrl.split("/").pop().split(".")[0]
                try {
                    await cloudinary.uploader.destroy(`Product/${publicId}`)
                } catch (deleteError) {
                    console.log("error deleting previous image:", deleteError)
                }
            }

            product.imageUrl = uploadRes.secure_url
        }

        if (!isAdminUser(viewer)) {
            product.approvalStatus = 'pending'
            product.approvedBy = null
            product.isFeatured = false
        }

        await product.save()

        await clearProductCaches()

        return res.status(200).json({
            message: isAdminUser(viewer)
                ? "Product updated successfully"
                : "Product updated and moved to pending approval",
            product
        })
    } catch (error) {
        console.error("error from update product:", error)
        return res.status(500).json({ message: "Unable to update product" })
    }
}


export const getSingleProduct = async(req,res)=>{
    try {
        const viewer = req.user
        const adminViewer = isAdminUser(viewer)
        const viewerId = String(viewer?._id || '')
        const productId = req.params.id
        const cacheKey = `products:single:${productId}:${viewerId}:${adminViewer}`
        const cached = await redis.get(cacheKey)
        if (cached) {
            const data = typeof cached === 'string' ? JSON.parse(cached) : cached
            return res.status(200).json(data)
        }

        const product = await Product.findById(productId)
            .select('name category price description imageUrl isFeatured approvalStatus createdAt updatedAt owner')
            .lean()

        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        if (!adminViewer && product.approvalStatus && product.approvalStatus !== 'approved' && String(product.owner || '') !== String(viewer?._id || '')) {
            return res.status(403).json({ message: 'Product is pending admin approval' })
        }

        await redis.set(cacheKey, JSON.stringify(product), { ex: 600 })

        return res.status(200).json(product)
    } catch (error) {
        console.error(`error from get single Product:`, error)
        return res.status(500).json({ message: "Unable to fetch product" })
    }
}

export const getPendingProducts = async (req, res) => {
    try {
        const pendingProducts = await Product.find({ approvalStatus: 'pending' })
            .populate('owner', 'name email role isApproved')
            .select('name category price description imageUrl approvalStatus owner createdAt')
            .sort({ createdAt: -1 })
            .lean()

        return res.status(200).json({
            count: pendingProducts.length,
            products: pendingProducts
        })
    } catch (error) {
        console.error('error from getPendingProducts:', error)
        return res.status(500).json({ message: 'Unable to fetch pending products' })
    }
}

export const approveProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const approverId = req.id

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.approvalStatus = 'approved'
        product.approvedBy = approverId
        await product.save()

        await clearProductCaches()

        return res.status(200).json({
            message: 'Product approved successfully',
            product
        })
    } catch (error) {
        console.error('error from approveProduct:', error)
        return res.status(500).json({ message: 'Unable to approve product' })
    }
}