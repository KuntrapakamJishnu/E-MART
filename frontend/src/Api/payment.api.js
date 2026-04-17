import axios from "axios"
import { API_BASE_URL } from "./base.api"

const trimTrailingSlash = (value = '') => String(value || '').replace(/\/$/, '')

const API_BASE_CANDIDATES = (() => {
    const candidates = []
    const primary = trimTrailingSlash(API_BASE_URL)

    if (primary) {
        candidates.push(primary)
    }

    if (primary.endsWith('/api')) {
        candidates.push(primary.slice(0, -4))
    } else {
        candidates.push(`${primary}/api`)
    }

    return [...new Set(candidates.filter(Boolean))]
})()

const requestWithFallback = async ({ method, paths, data, responseType, headers = {} }) => {
    let lastError = null
    const resolvedPaths = Array.isArray(paths) ? paths : []

    for (let index = 0; index < API_BASE_CANDIDATES.length; index += 1) {
        const base = API_BASE_CANDIDATES[index]
        for (let pathIndex = 0; pathIndex < resolvedPaths.length; pathIndex += 1) {
            const path = resolvedPaths[pathIndex]
            try {
                const response = await axios({
                    method,
                    url: `${base}${path}`,
                    data,
                    responseType,
                    headers: {
                        'Content-Type': 'Application/json',
                        ...headers
                    },
                    withCredentials: true
                })
                return response.data
            } catch (error) {
                lastError = error
                const status = error?.response?.status
                const hasMorePaths = pathIndex < resolvedPaths.length - 1
                const hasMoreBases = index < API_BASE_CANDIDATES.length - 1
                const shouldTryNext = status === 404 && (hasMorePaths || hasMoreBases)
                if (!shouldTryNext) {
                    throw error
                }
            }
        }
    }

    throw lastError
}

export const createPaymentApi = async({ products, deliveryInfo })=>{
    return requestWithFallback({
        method: 'post',
        paths: ['/payment/createPayment', '/payment/create-payment'],
        data: { products, deliveryInfo }
    })
}


export const createSuccessApi =async(paymentData)=>{
    return requestWithFallback({
        method: 'post',
        paths: ['/payment/create-success', '/payment/verify'],
        data: paymentData
    })
}

export const placeCodOrderApi = async ({ products, deliveryInfo }) => {
    return requestWithFallback({
        method: 'post',
        paths: ['/payment/place-cod-order', '/payment/placeCodOrder', '/payment/cod'],
        data: { products, deliveryInfo }
    })
}

export const getMyOrdersApi = async () => {
    return requestWithFallback({
        method: 'get',
        paths: ['/payment/orders']
    })
}

export const downloadOrderInvoiceApi = async (orderId) => {
    return requestWithFallback({
        method: 'get',
        paths: [`/payment/orders/${orderId}/invoice`],
        responseType: 'arraybuffer',
        headers: {
            Accept: 'application/pdf'
        }
    })
}