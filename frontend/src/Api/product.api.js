import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '')

export const createProductApi = async(Payload)=>{
    const res = await axios.post(`${API_BASE_URL}/product/createProduct`,
        Payload,
        {
            withCredentials:true
        }
        
    )

    return res.data
}

export const getAllProductApi = async(params)=>{
    const{
        page=1,
        limit=20,
        search="",
        category="",
        minPrice="",
        maxPrice=""
    } = params
    const res = await axios.get(`${API_BASE_URL}/product/getAllProduct`,
        {
            params:{
                page,
                limit,
                search:search||undefined,
                category:category||undefined,
                minPrice:minPrice||undefined,
                maxPrice:maxPrice||undefined
            },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true

        },
       
       
        
    )

    return res.data
}

export const getFeaturedProductApi = async()=>{
    const res = await axios.get(`${API_BASE_URL}/product/getFeaturedProduct`,
       
        {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
        
    )

    return res.data
}


export const deleteProductApi = async(id)=>{
    const res  = await axios.post(
        `${API_BASE_URL}/product/deleteProduct/${id}`,
        {},
        {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
    )

    return res.data
}

export const toggleProductApi = async(id)=>{
    const res  = await axios.post(`${API_BASE_URL}/product/toggleProduct/${id}`,
        {},
        {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
    )

    return res.data
}

export const getSingleProductApi = async(id)=>{
    const res  = await axios.get(`${API_BASE_URL}/product/getSingleProduct/${id}`,
        {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
    )

    return res.data
}

export const updateProductApi = async ({ id, payload }) => {
    const res = await axios.post(
        `${API_BASE_URL}/product/updateProduct/${id}`,
        payload,
        {
            withCredentials: true
        }
    )

    return res.data
}