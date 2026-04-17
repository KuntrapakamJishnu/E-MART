import {
  approveProductApi,
  approveSellerApi,
  deleteUserByAdminApi,
  getAdminUsersApi,
  getOrderSupportRequestsApi,
  getPendingProductsApi,
  getPendingSellersApi,
  getRecentLoginsApi,
  updateOrderSupportRequestStatusApi
} from '@/Api/admin.api'
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

export const useRecentLoginsHook = () => {
  return useQuery({
    queryKey: ['recent-logins'],
    queryFn: getRecentLoginsApi
  })
}

export const useAdminUsersHook = ({ page, limit, search }) => {
  return useQuery({
    queryKey: ['admin-users', page, limit, search],
    queryFn: () => getAdminUsersApi({ page, limit, search })
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

export const useDeleteUserByAdminHook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUserByAdminApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'User removed successfully')
      queryClient.invalidateQueries({ queryKey: ['recent-logins'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Unable to remove user')
    }
  })
}

export const useOrderSupportRequestsHook = () => {
  return useQuery({
    queryKey: ['admin-order-support-requests'],
    queryFn: getOrderSupportRequestsApi
  })
}

export const useUpdateOrderSupportRequestStatusHook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrderSupportRequestStatusApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Support request updated')
      queryClient.invalidateQueries({ queryKey: ['admin-order-support-requests'] })
      queryClient.invalidateQueries({ queryKey: ['myOrders'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Unable to update support request')
    }
  })
}
