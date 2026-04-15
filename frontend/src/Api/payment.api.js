import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '')

export const createPaymentApi = async(products)=>{
    const res = await axios.post(`${API_BASE_URL}/payment/createPayment`,
        {products},
        {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
    )

    return res.data
}


export const createSuccessApi =async(paymentData)=>{

    const res  =await axios.post(`${API_BASE_URL}/payment/create-success`,
            paymentData,
           {
            headers:{'Content-Type':"Application/json"},
            withCredentials:true
        }
        )

        return res.data
}