import { getCartItem, getUser, loginApi, logoutApi, registerApi, updateProfile } from "@/Api/user.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
import { setAuthToken } from "@/Api/base.api"

const getErrorMessage = (err, fallbackMessage) =>
    err?.response?.data?.message || fallbackMessage


export const useRegisterHook = ()=>{
    const navigate = useNavigate()
    const setUser = useUserStore((state) => state.setUser)
    return useMutation({
        mutationFn:registerApi,
        onSuccess:(data)=>{
            toast.success(data.message)
            setAuthToken(data?.token || null)
            setUser(data.user)
            navigate('/')
        },
        onError:(err)=>{
            toast.error(getErrorMessage(err, 'Registration failed'))
        }
    })
}



export const useLoginHook = ()=>{
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const setUser = useUserStore((state) => state.setUser)
    return useMutation({
        mutationFn:loginApi,
        onSuccess:(data)=>{
            toast.success(data.message)
            setAuthToken(data?.token || null)
            setUser(data.user)
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            navigate('/')
        },
        onError:(err)=>{
            toast.error(getErrorMessage(err, 'Login failed'))
        }
    })
}

export const useLogoutHook = ()=>{
    const navigate = useNavigate()
    const  queryClient = useQueryClient()
    const clearUser = useUserStore((state) => state.clearUser)
    return useMutation({
        mutationFn:logoutApi,
        onSuccess:(data)=>{
            toast.success(data.message)
            clearUser()
            setAuthToken(null)
            queryClient.removeQueries({ queryKey: ['getUser'] })
            queryClient.removeQueries({ queryKey: ['getCartItem'] })
            navigate('/login', { replace: true })
        },
        onError:(err)=>{
            toast.error(getErrorMessage(err, 'Logout failed'))
        }
    })
}



export const useUpdateProfileHook = ()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:updateProfile,
        onSuccess:(data)=>{
            toast.success(data.message)
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
        },
        onError:(err)=>{
            toast.error(getErrorMessage(err, 'Profile update failed'))
        }
    })
}


export const useGetProfileHook = ()=>{
    return useQuery({
        queryFn:getUser,
        queryKey:['getUser'],
        retry:false,
        
    })
}

export const useGetUserCartItemHook = ()=>{
    return useQuery({
        queryFn:getCartItem,
        queryKey:['getCartItem'],
        retry:false,
        
    })
}

