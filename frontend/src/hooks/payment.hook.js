import { createPaymentApi, createSuccessApi, placeCodOrderApi, getMyOrdersApi, downloadOrderInvoiceApi, createOrderSupportRequestApi } from '@/Api/payment.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUserStore } from '@/store/userStore'


export const useCreatePaymentHook = ()=>{
    return useMutation({
        mutationFn:createPaymentApi,
        onError:(err)=>{
            toast.error(err?.response?.data?.message || 'Unable to initialize payment')
        }
    })
}


export const useCreateSuccessHook = ()=>{
    const queryClient = useQueryClient()
    const currentUser = useUserStore((state) => state.user)
    const setUser = useUserStore((state) => state.setUser)
    return useMutation({
        mutationFn:createSuccessApi,
        onSuccess:async(data)=>{
            queryClient.setQueryData(['getCartItem'], { cartItems: [] })
            await queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            await queryClient.refetchQueries({ queryKey: ['getCartItem'] })
            if (currentUser) {
                setUser({ ...currentUser, cartItems: [] })
            }
            toast.success(data.message)
        },
        onError:(err)=>{
            toast.error(err?.response?.data?.message || 'Payment verification failed')
        }
    })
}

export const usePlaceCodOrderHook = () => {
    const queryClient = useQueryClient()
    const currentUser = useUserStore((state) => state.user)
    const setUser = useUserStore((state) => state.setUser)
    return useMutation({
        mutationFn: placeCodOrderApi,
        onSuccess: async (data) => {
            queryClient.setQueryData(['getCartItem'], { cartItems: [] })
            await queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            await queryClient.refetchQueries({ queryKey: ['getCartItem'] })
            if (currentUser) {
                setUser({ ...currentUser, cartItems: [] })
            }
            toast.success(data.message)
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to place COD order')
        }
    })
}

export const useGetMyOrdersHook = () => {
    return useQuery({
        queryKey: ['myOrders'],
        queryFn: getMyOrdersApi,
        retry: false
    })
}

export const useDownloadOrderInvoiceHook = () => {
    return useMutation({
        mutationFn: downloadOrderInvoiceApi,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to download invoice')
        }
    })
}

export const useCreateOrderSupportRequestHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createOrderSupportRequestApi,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['myOrders'] })
            toast.success(data?.message || 'Support request submitted')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to submit support request')
        }
    })
}