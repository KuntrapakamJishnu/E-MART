import axios from "axios"
import { API_BASE_URL } from "./base.api"

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