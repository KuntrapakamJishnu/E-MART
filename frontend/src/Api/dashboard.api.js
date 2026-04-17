import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export const dashboardApi = async()=>{
    const res   = await axios.get(`${API_BASE_URL}/analytic/getDate`,
        {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        }
    )

    return res.data
}

export const dailySalesApi = async(startDate, endDate)=>{
    const res = await axios.get(`${API_BASE_URL}/analytic/dailySales`,{
        params:{startDate,endDate},
        withCredentials:true
    })

    return res.data
}