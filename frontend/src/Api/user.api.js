import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export const registerApi = async(paylod)=>{
    const res =  await axios.post(`${API_BASE_URL}/register`,
        paylod,
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}





export const loginApi = async(paylod)=>{
    const res =  await axios.post(`${API_BASE_URL}/login`,
        paylod,
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}

export const logoutApi = async()=>{
    const res =  await axios.post(`${API_BASE_URL}/logout`,
        {},
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}




export const updateProfile = async(paylod)=>{
    const res =  await axios.post(`${API_BASE_URL}/updateProfile`,
        paylod,
        {
            headers:{'Content-Type':'multipart/form-data'},
            withCredentials:true
        }
    )

    return res.data
}



export const getUser = async()=>{
    const res =  await axios.get(`${API_BASE_URL}/getUser`,
        
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}

export const getCartItem = async()=>{
    const res =  await axios.get(`${API_BASE_URL}/getCartItem`,
        
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}