import { approveProductApi, approveSellerApi, getPendingProductsApi, getPendingSellersApi } from '@/Api/admin.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const usePendingSellersHook = () => {
  return useQuery({
    queryKey: ['pending-sellers'],
    queryFn: getPendingSellersApi
  })
}

export const usePendingProductsHook = () => {
  return useQuery({
    queryKey: ['pending-products'],
    queryFn: getPendingProductsApi
  })
}

export const useApproveSellerHook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveSellerApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Seller approved')
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Unable to approve seller')
    }
  })
}

export const useApproveProductHook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveProductApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Product approved')
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
      queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Unable to approve product')
    }
  })
}
