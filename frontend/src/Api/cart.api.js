import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'https://campuskartai.onrender.com/api').replace(/\/$/, '')

export const addToCart=async(payload)=>{
    const res = await axios.post(`${API_BASE_URL}/cart/addToCart`,
        payload,
        {
            headers:{"Content-Type":"Application/json"},
            withCredentials:true
        }
    )
    return res.data
}

export const removeFromCartApi=async(payload)=>{
    const res = await axios.post(`${API_BASE_URL}/cart/removeFromCart`,
        payload,
        {
             headers:{"Content-Type":"Application/json"},
            withCredentials:true
        }
    )
    return res.data
}
export const removeAllApi=async()=>{
    const res = await axios.get(`${API_BASE_URL}/cart/removeAll`,
        {
             headers:{"Content-Type":"Application/json"},
            withCredentials:true
        }
    )
    return res.data
}
export const updateQuantityApi=async({operation, productId})=>{
    const res = await axios.post(`${API_BASE_URL}/cart/updateQuantity/${productId}`,
        {operation},
        {
             headers:{"Content-Type":"Application/json"},
            withCredentials:true
        }
    )
    return res.data
}