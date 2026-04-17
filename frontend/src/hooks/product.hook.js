import { createProductApi, deleteProductApi, getAllProductApi, getFeaturedProductApi, getSingleProductApi, toggleProductApi, updateProductApi } from "@/Api/product.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateProduct = ()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:createProductApi,
        onSuccess:()=>{
            toast.success("Product created")
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
        },
        onError:(err)=>{
            toast.error(err?.response?.data?.message || "Unable to create product")
        }
    })
}


export const useGetAllProductHook = ({
  page = 1,
  limit = 20,
  search = "",
  category = "",
  minPrice = "",
    maxPrice = "",
    color = "",
    quality = ""
} = {}) => {
  return useQuery({
    queryKey: [
      'getAllProduct',
      page,
      limit,
      search,
      category,
      minPrice,
            maxPrice,
            color,
            quality
    ],
    queryFn: () =>
      getAllProductApi({
        page,
        limit,
        search,
        category,
        minPrice,
                maxPrice,
                color,
                quality
      }),
    keepPreviousData: true
  });
};

export const useDeleteProductApi = ()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:deleteProductApi,
        onSuccess:()=>{
            toast.success("Product deleted")
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
        },
        onError:()=>{
            toast.error("Unable to delete product")
        }
    })
}


export const useToggleProduct = ()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:toggleProductApi,

        onSuccess:(data)=>{

             queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
             toast.success("Product Toggled successfully")
        

            console.log(data)
        },
        onError:(err)=>{
            console.log(err)
        }
    })
}


export const useGetSingleProduct=(id)=>{
    return useQuery({
        queryFn:()=>getSingleProductApi(id),
        queryKey:['getSingleProduct',id]
    })
}
export const useGetFeaturedProcut=()=>{
    return useQuery({
        queryFn:getFeaturedProductApi,
        queryKey:['getFeatured']
    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateProductApi,
        onSuccess: () => {
            toast.success("Product updated")
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
        },
        onError: () => {
            toast.error("Unable to update product")
        }
    })
}