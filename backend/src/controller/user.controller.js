import User from "../model/user.model.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ENV } from "../config/env.js";
import cloudinary from "../config/cloudinary.js";

const getCookieSecurity = (req) => {
    const forwardedProto = req.headers['x-forwarded-proto']
    const isSecureRequest = req.secure || forwardedProto === 'https'

    return {
        sameSite: isSecureRequest ? 'none' : 'lax',
        secure: isSecureRequest
    }
}

const getAuthCookieOptions = (req) => {
    const security = getCookieSecurity(req)
    return {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        ...security
    }
}

const getClearCookieOptions = (req) => {
    const security = getCookieSecurity(req)
    return {
        httpOnly: true,
        maxAge: 0,
        ...security
    }
}

const getUserRole = (user) => {
    if (user?.role) return user.role
    if (user?.owner) return 'admin'
    if (user?.email === ENV.ADMIN_EMAIL) return 'admin'
    return 'student'
}

const buildUserPayload = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto,
    profilePicture: user.profilePicture,
    cartItems: user.cartItems,
    owner: user.owner,
    role: getUserRole(user),
    isApproved: Boolean(user.isApproved)
})

export const register =async(req ,res)=>{
    try {
        const {name, password, email} = req.body;
        const normalizedRole = String(req.body?.role || 'student').toLowerCase()
        const role = normalizedRole === 'seller' ? 'seller' : 'student'

        if(!name || !password || !email){
            return res.status(401).json({
                message:"Please provide all the details"
            })
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(201).json({
                message:"User already exist"
            })
        }


        const hashPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name, 
            email,
            password:hashPassword,
            role,
            isApproved: role === 'seller' ? false : true
        })

        if (user.email === ENV.ADMIN_EMAIL) {
            user.owner = true
            user.role = 'admin'
            user.isApproved = true
            await user.save()
        }

        const token  = await jwt.sign({userId:user._id}, ENV.JWT_TOKEN)

        const sellerPendingApproval = getUserRole(user) === 'seller' && !user.isApproved

        if (sellerPendingApproval) {
            return res.status(201).json({
                message: `welcome ${user.name}. Your seller profile is pending admin approval.`,
                user: buildUserPayload(user)
            })
        }

        return res.status(201).cookie("token", token, getAuthCookieOptions(req)).json({
            message:`welcome ${user.name}`,
            user: buildUserPayload(user)
        })
        
    } catch (error) {
        console.log(`error from register controller, ${error}`)
    }
}


export const login = async(req, res)=>{
    try {
        const {email, password } = req.body;

        if(!email || !password){
            return res.status(401).json({
                message:"Please provide all the details"
            })
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(401).json({
                message:"user does not exist"
            })
        }


        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(401).json({
                message:"user does not exist"
            })
        }

                 const token  = await jwt.sign({userId:user._id}, ENV.JWT_TOKEN)
                 user.lastLoginAt = new Date()

       if(user.email===ENV.ADMIN_EMAIL){
        
        user.owner = true;
        user.role = 'admin';
        user.isApproved = true;
        await user.save()
        return res.status(201).cookie("token", token, getAuthCookieOptions(req)).json({
            message:`welcome back Admin ${user.name}`,
            user: buildUserPayload(user)
        })
       }

    const role = getUserRole(user)
    if (role === 'seller' && !user.isApproved) {
        return res.status(403).json({
            message: 'Seller profile pending admin approval. Please wait for approval before login.'
        })
    }

    return res.status(201).cookie("token", token, getAuthCookieOptions(req)).json({
            message:`welcome ${user.name}`,
            user: buildUserPayload(user)
        })


    } catch (error) {
        console.log(`error from login , ${error}`)
    }
}


export const getUser = async(req, res)=>{
    try {
        const userId = req.id;
        const user = await User.findById(userId)

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }

        if (user.email === ENV.ADMIN_EMAIL && user.role !== 'admin') {
            user.role = 'admin'
            user.owner = true
            user.isApproved = true
            await user.save()
        }

        return res.status(201).json(buildUserPayload(user))
    } catch (error) {
        console.log(`error from getUser, ${error}`)
    }
}


export const getCartItem = async(req,res)=>{
    try {
        const userId = req.id;

        const user = await User.findById(userId).populate({
            path:'cartItems',
            populate:{
                path:'product',
                model:"Product"
            }
        
        }).select('cartItems')

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }

       return res.status(201).json(user)
    } catch (error) {
        console.log(`error from getCartItem, ${error}`)
    }
}



export const updateProfile = async(req,res)=>{
    try {
        const userId = req.id;
        
        const {name} = req.body;
        
        const updateData = {}

        if(name){
            updateData.name = name
        }
        if(req.file){
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

            const uploadRes = await cloudinary.uploader.upload(base64,{
                folder:"ProfilePhoto"
            })

            updateData.profilePicture = uploadRes.secure_url
        }

        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {new: true, runValidators:true}
        ).select('-password')

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }


        return res.status(201).json({
            message:"Profile updated succesfully"
        })


    } catch (error) {
        console.log(`error from updateProfile ,`, error)
    }
}



export const logout = async(req, res)=>{
    try {
         return res.status(201).cookie("token", "", getClearCookieOptions(req)).json({
            message:`user Logged out successfully`
        })
    } catch (error) {
        console.log(`error from logout`)
    }
}

export const getPendingSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller', isApproved: false })
            .select('_id name email role isApproved createdAt')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: sellers.length,
            sellers
        })
    } catch (error) {
        console.log(`error from getPendingSellers, ${error}`)
        return res.status(500).json({ message: 'Unable to fetch pending sellers' })
    }
}

export const approveSeller = async (req, res) => {
    try {
        const sellerId = req.params.id
        const seller = await User.findById(sellerId)

        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' })
        }

        if (getUserRole(seller) !== 'seller') {
            return res.status(400).json({ message: 'User is not a seller account' })
        }

        seller.isApproved = true
        await seller.save()

        return res.status(200).json({
            message: 'Seller approved successfully',
            seller: {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                role: seller.role,
                isApproved: seller.isApproved
            }
        })
    } catch (error) {
        console.log(`error from approveSeller, ${error}`)
        return res.status(500).json({ message: 'Unable to approve seller' })
    }
}

export const getRecentLogins = async (req, res) => {
    try {
        const users = await User.find({
            lastLoginAt: { $ne: null }
        })
            .select('_id name email role isApproved lastLoginAt createdAt owner')
            .sort({ lastLoginAt: -1 })
            .limit(50)

        const safeUsers = users.filter((user) => getUserRole(user) !== 'admin')

        return res.status(200).json({
            count: safeUsers.length,
            users: safeUsers
        })
    } catch (error) {
        console.log(`error from getRecentLogins, ${error}`)
        return res.status(500).json({ message: 'Unable to fetch recent logins' })
    }
}

export const removeUserByAdmin = async (req, res) => {
    try {
        const userIdToDelete = req.params.id
        const adminId = req.id

        if (String(userIdToDelete) === String(adminId)) {
            return res.status(400).json({ message: 'Admin cannot remove own account' })
        }

        const user = await User.findById(userIdToDelete)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (getUserRole(user) === 'admin' || user.email === ENV.ADMIN_EMAIL || user.owner) {
            return res.status(400).json({ message: 'Admin account cannot be removed' })
        }

        await User.findByIdAndDelete(userIdToDelete)

        return res.status(200).json({
            message: 'User removed successfully'
        })
    } catch (error) {
        console.log(`error from removeUserByAdmin, ${error}`)
        return res.status(500).json({ message: 'Unable to remove user' })
    }
}

export const getAllUsersForAdmin = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1)
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
        const search = String(req.query.search || '').trim()

        const query = {
            role: { $ne: 'admin' },
            owner: { $ne: true }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const [totalUsers, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .select('_id name email role isApproved createdAt lastLoginAt')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
        ])

        return res.status(200).json({
            page,
            limit,
            totalUsers,
            totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
            users
        })
    } catch (error) {
        console.log(`error from getAllUsersForAdmin, ${error}`)
        return res.status(500).json({ message: 'Unable to fetch users' })
    }
}