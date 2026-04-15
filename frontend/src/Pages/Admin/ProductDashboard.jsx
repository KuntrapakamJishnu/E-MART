import { useCreateProduct, useDeleteProductApi, useGetAllProductHook, useToggleProduct, useUpdateProduct } from '@/hooks/product.hook'
import { useGenerateAiDescriptionHook } from '@/hooks/ai.hook'
import { Plus, Search, Sparkles, WandSparkles, Pencil, Trash2, Check, X } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { Spinner } from '@/components/ui/spinner'
import { deleteProductApi, toggleProductApi } from '@/Api/product.api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const CATEGORY_OPTIONS = [
  { value: 'Mens', label: 'Men' },
  { value: 'Men', label: 'Men (Legacy)' },
  { value: 'Womens', label: 'Women' },
  { value: 'Women', label: 'Women (Legacy)' },
  { value: 'Kids', label: 'Kids' }
]

const ProductDashboard = () => {
  const [searchInput, setsearchInput] = useState("")
  const [page, setpage] = useState(1)
  const [activeSearch, setactiveSearch] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingProductImageUrl, setEditingProductImageUrl] = useState('')
  const [editPreviewUrl, setEditPreviewUrl] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [inlineEditId, setInlineEditId] = useState(null)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [bulkActionLoading, setBulkActionLoading] = useState(null)
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [inlineForm, setInlineForm] = useState({
    name: '',
    description: '',
    category: '',
    price: ''
  })

  const queryClient = useQueryClient()

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setpage(1)
    setactiveSearch(searchInput)
  }

  const { data } = useGetAllProductHook({
    page,
    search: activeSearch,
  })

  const { mutate, isPending } = useCreateProduct()
  const { mutate: updateProduct, isPending: updatingProduct } = useUpdateProduct()
  const { mutate: deleteProduct, isPending: deletingProduct } = useDeleteProductApi()
  const { mutateAsync: generateDescription, isPending: generatingDescription } = useGenerateAiDescriptionHook()
  const { mutate: toggleProduct } = useToggleProduct()
  const { register, handleSubmit, reset, setValue, getValues } = useForm()
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit
  } = useForm()

  const createProductHandler = (formValues) => {
    const formData = new FormData()

    if (formValues.name) formData.append("name", formValues.name)
    if (formValues.description) formData.append("description", formValues.description)
    if (formValues.price) formData.append("price", formValues.price)
    if (formValues.category) formData.append("category", formValues.category)
    if (formValues.image && formValues.image[0]) formData.append("image", formValues.image[0])

    mutate(formData, {
      onSuccess: () => reset()
    })
  }

  const createToggle = (id) => {
    toggleProduct(id)
  }

  const generateDescriptionHandler = async () => {
    const name = getValues('name')
    const category = getValues('category')

    if (!name || !category) return

    const res = await generateDescription({
      title: name,
      category,
      keywords: name,
      tone: 'premium'
    })

    if (res?.description) {
      setValue('description', res.description)
    }
  }

  const openEditDialog = (product) => {
    setEditingProductId(product._id)
    const imageUrl = product.image || product.imageUrl || ''
    setEditingProductImageUrl(imageUrl)
    setEditPreviewUrl(imageUrl)
    resetEdit({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || ''
    })
    setIsEditDialogOpen(true)
  }

  const editProductHandler = (formValues) => {
    if (!editingProductId) return

    const payload = new FormData()
    if (formValues.name) payload.append('name', formValues.name)
    if (formValues.description) payload.append('description', formValues.description)
    if (formValues.price !== undefined && formValues.price !== null && formValues.price !== '') payload.append('price', formValues.price)
    if (formValues.category) payload.append('category', formValues.category)
    if (formValues.image && formValues.image[0]) payload.append('image', formValues.image[0])

    updateProduct(
      { id: editingProductId, payload },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setEditingProductId(null)
          setEditingProductImageUrl('')
          setEditPreviewUrl('')
          resetEdit()
        }
      }
    )
  }

  const openDeleteDialog = (product) => {
    setDeleteTarget(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteProduct = () => {
    if (!deleteTarget?._id) return
    deleteProduct(deleteTarget._id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    })
  }

  const startInlineEdit = (product) => {
    setInlineEditId(product._id)
    setInlineForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || ''
    })
  }

  const cancelInlineEdit = () => {
    setInlineEditId(null)
    setInlineForm({
      name: '',
      description: '',
      category: '',
      price: ''
    })
  }

  const saveInlineEdit = () => {
    if (!inlineEditId) return

    const payload = new FormData()
    if (inlineForm.name) payload.append('name', inlineForm.name)
    if (inlineForm.description) payload.append('description', inlineForm.description)
    if (inlineForm.category) payload.append('category', inlineForm.category)
    if (inlineForm.price !== undefined && inlineForm.price !== null && inlineForm.price !== '') payload.append('price', inlineForm.price)

    updateProduct(
      { id: inlineEditId, payload },
      {
        onSuccess: () => {
          cancelInlineEdit()
        }
      }
    )
  }

  const products = useMemo(() => data?.products || [], [data?.products])
  const currentPage = data?.page || page
  const totalPages = data?.totalPages || 1

  const sortedProducts = useMemo(() => {
    const items = [...products]
    const dir = sortDirection === 'asc' ? 1 : -1

    return items.sort((a, b) => {
      if (sortField === 'name') return (a?.name || '').localeCompare(b?.name || '') * dir
      if (sortField === 'category') return (a?.category || '').localeCompare(b?.category || '') * dir
      if (sortField === 'price') return ((Number(a?.price) || 0) - (Number(b?.price) || 0)) * dir
      if (sortField === 'featured') return ((a?.isFeatured ? 1 : 0) - (b?.isFeatured ? 1 : 0)) * dir
      return (new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime()) * dir
    })
  }, [products, sortField, sortDirection])

  const allSelectedOnPage = sortedProducts.length > 0 && selectedProductIds.length === sortedProducts.length

  const toggleSelectAllOnPage = () => {
    if (allSelectedOnPage) {
      setSelectedProductIds([])
      return
    }
    setSelectedProductIds(sortedProducts.map((item) => item._id))
  }

  const toggleSelectSingle = (productId) => {
    setSelectedProductIds((prev) => (
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    ))
  }

  const handleBulkToggle = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Select at least one product')
      return
    }

    setBulkActionLoading('toggle')
    const results = await Promise.allSettled(selectedProductIds.map((id) => toggleProductApi(id)))
    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.length - successCount

    await queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
    setSelectedProductIds([])
    setBulkActionLoading(null)

    if (failCount === 0) {
      toast.success(`Toggled ${successCount} products`)
    } else {
      toast.error(`Toggled ${successCount} products, ${failCount} failed`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Select at least one product')
      return
    }

    const confirmed = window.confirm(`Delete ${selectedProductIds.length} selected products? This cannot be undone.`)
    if (!confirmed) return

    setBulkActionLoading('delete')
    const results = await Promise.allSettled(selectedProductIds.map((id) => deleteProductApi(id)))
    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.length - successCount

    await queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
    setSelectedProductIds([])
    setBulkActionLoading(null)

    if (failCount === 0) {
      toast.success(`Deleted ${successCount} products`)
    } else {
      toast.error(`Deleted ${successCount} products, ${failCount} failed`)
    }
  }

  useEffect(() => {
    return () => {
      if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editPreviewUrl)
      }
    }
  }, [editPreviewUrl])

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setSelectedProductIds([])
    }, 0)

    return () => clearTimeout(resetTimer)
  }, [page, activeSearch, products.length])

  return (
    <div className='min-h-screen'>
      <div className='max-w-[1450px] mx-auto px-6 py-8 lg:px-8'>
        <div className='mb-8 flex flex-col gap-4 rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300'>
              <Sparkles className='h-4 w-4' />
              Inventory Control
            </p>
            <h1 className='mt-3 text-3xl font-black tracking-[-0.04em] text-white lg:text-4xl'>Products</h1>
            <p className='mt-1 text-sm text-white/70'>{data?.totalProducts || 0} total products in catalog</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button className='inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition-transform hover:scale-[1.02]'>
                <Plus className='w-4 h-4' />
                Create Product
              </button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-lg border-white/20 bg-slate-950/95 text-white backdrop-blur-2xl'>
              <DialogHeader>
                <DialogTitle className='text-white'>Create New Product</DialogTitle>
                <DialogDescription className='text-white/65'>
                  Add a new product to your inventory
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(createProductHandler)} className='space-y-4 mt-4'>
                <input
                  type='text'
                  placeholder='Product Name'
                  className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                  {...register('name')}
                />
                <select
                  className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/80'
                  {...register('category')}
                >
                  <option value=''>Select Category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <input
                  type='text'
                  placeholder='Description'
                  className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                  {...register('description')}
                />
                <button
                  type='button'
                  onClick={generateDescriptionHandler}
                  disabled={generatingDescription}
                  className='inline-flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/15 text-fuchsia-200 font-medium transition-colors hover:bg-fuchsia-500/25 disabled:opacity-50'
                >
                  <WandSparkles className='h-4 w-4' />
                  {generatingDescription ? 'Generating with AI...' : 'Generate Description with AI'}
                </button>
                <input
                  type='number'
                  placeholder='Price'
                  className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                  {...register('price')}
                />
                <input
                  type='file'
                  accept='image/*'
                  className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-900'
                  {...register('image')}
                />
                <button
                  type='submit'
                  disabled={isPending}
                  className='inline-flex w-full h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-50'
                >
                  {isPending ? <Spinner /> : 'Create Product'}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSearchSubmit} className='mb-8 rounded-[24px] border border-white/15 bg-white/95 p-4 shadow-[0_22px_55px_rgba(15,23,42,0.18)]'>
          <div className='flex max-w-2xl gap-2'>
            <input
              type='text'
              className='flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400'
              placeholder='Search products...'
              value={searchInput}
              onChange={(e) => setsearchInput(e.target.value)}
            />
            <button
              type='submit'
              className='px-6 py-3 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2'
            >
              <Search className='w-4 h-4' />
              Search
            </button>
          </div>

          <div className='mt-3 flex flex-wrap items-center gap-2 text-sm'>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className='rounded-xl border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-cyan-400'
            >
              <option value='createdAt'>Sort: Latest</option>
              <option value='name'>Sort: Name</option>
              <option value='category'>Sort: Category</option>
              <option value='price'>Sort: Price</option>
              <option value='featured'>Sort: Featured</option>
            </select>
            <button
              type='button'
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className='rounded-xl border border-slate-300 px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100'
            >
              Direction: {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </form>

        <div className='mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]'>
          <p className='text-sm font-semibold text-slate-700'>{selectedProductIds.length} selected on this page</p>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={toggleSelectAllOnPage}
              className='rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100'
            >
              {allSelectedOnPage ? 'Clear Selection' : 'Select All Page'}
            </button>
            <button
              type='button'
              disabled={bulkActionLoading === 'toggle'}
              onClick={handleBulkToggle}
              className='rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-50'
            >
              {bulkActionLoading === 'toggle' ? 'Toggling...' : 'Bulk Toggle Featured'}
            </button>
            <button
              type='button'
              disabled={bulkActionLoading === 'delete'}
              onClick={handleBulkDelete}
              className='rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50'
            >
              {bulkActionLoading === 'delete' ? 'Deleting...' : 'Bulk Delete'}
            </button>
          </div>
        </div>

        <div className='overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]'>
          <div className='overflow-x-auto premium-scrollbar'>
            <table className='w-full min-w-[880px]'>
              <thead className='bg-slate-50 border-b border-slate-200'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>
                    <input
                      type='checkbox'
                      checked={allSelectedOnPage}
                      onChange={toggleSelectAllOnPage}
                      className='h-4 w-4 accent-slate-900'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>Product</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>Category</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>Price</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>Featured</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider'>Action</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-slate-200'>
                {sortedProducts.map((item) => {
                  const isInlineEditing = inlineEditId === item._id
                  return (
                    <tr key={item._id} className='hover:bg-slate-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedProductIds.includes(item._id)}
                          onChange={() => toggleSelectSingle(item._id)}
                          className='h-4 w-4 accent-slate-900'
                        />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-12 w-12 bg-slate-100 rounded-md overflow-hidden flex-shrink-0'>
                            <img
                              src={item.image || item.imageUrl}
                              className='h-full w-full object-cover'
                              loading='lazy'
                              decoding='async'
                              alt={item.name}
                            />
                          </div>
                          {isInlineEditing ? (
                            <div className='w-full max-w-[360px] space-y-2'>
                              <input
                                type='text'
                                value={inlineForm.name}
                                onChange={(e) => setInlineForm((prev) => ({ ...prev, name: e.target.value }))}
                                className='w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-cyan-400'
                              />
                              <input
                                type='text'
                                value={inlineForm.description}
                                onChange={(e) => setInlineForm((prev) => ({ ...prev, description: e.target.value }))}
                                className='w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-cyan-400'
                                placeholder='Description'
                              />
                            </div>
                          ) : (
                            <span className='text-sm font-medium text-slate-900'>{item.name}</span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {isInlineEditing ? (
                          <select
                            value={inlineForm.category}
                            onChange={(e) => setInlineForm((prev) => ({ ...prev, category: e.target.value }))}
                            className='rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-cyan-400'
                          >
                            {CATEGORY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className='text-sm text-slate-700'>{item.category}</span>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        {isInlineEditing ? (
                          <input
                            type='number'
                            value={inlineForm.price}
                            onChange={(e) => setInlineForm((prev) => ({ ...prev, price: e.target.value }))}
                            className='w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-400'
                          />
                        ) : (
                          <span className='text-sm font-semibold text-slate-900'>Rs. {item.price}</span>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.isFeatured
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.isFeatured ? 'Featured' : 'Standard'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {isInlineEditing ? (
                            <>
                              <button
                                onClick={saveInlineEdit}
                                disabled={updatingProduct}
                                className='inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50'
                              >
                                <Check className='h-3.5 w-3.5' />
                                Save
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200'
                              >
                                <X className='h-3.5 w-3.5' />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startInlineEdit(item)}
                                className='inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100'
                              >
                                <Pencil className='h-3.5 w-3.5' />
                                Quick Edit
                              </button>
                              <button
                                onClick={() => openEditDialog(item)}
                                className='inline-flex items-center gap-1 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 transition-colors hover:bg-fuchsia-100'
                              >
                                <Pencil className='h-3.5 w-3.5' />
                                Edit
                              </button>
                              <button
                                onClick={() => createToggle(item._id)}
                                className='inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100'
                              >
                                Toggle
                              </button>
                              <button
                                onClick={() => openDeleteDialog(item)}
                                className='inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center text-sm text-slate-500'>No products found for this search.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {data?.totalPages > 1 && (
          <div className='flex items-center justify-center gap-6 mt-8 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-xl'>
            <button
              disabled={page === 1}
              onClick={() => setpage((prev) => prev - 1)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                page === 1
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-white/90'
              }`}
            >
              Previous
            </button>

            <div className='flex items-center gap-2 text-sm text-white'>
              <span className='font-semibold'>{currentPage}</span>
              <span className='text-white/60'>of</span>
              <span className='font-semibold'>{totalPages}</span>
            </div>

            <button
              disabled={!data?.hasMore}
              onClick={() => setpage((prev) => prev + 1)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                !data?.hasMore
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-white/90'
              }`}
            >
              Next
            </button>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='sm:max-w-lg border-white/20 bg-slate-950/95 text-white backdrop-blur-2xl'>
            <DialogHeader>
              <DialogTitle className='text-white'>Edit Product</DialogTitle>
              <DialogDescription className='text-white/65'>
                Update product details, pricing, and image.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit(editProductHandler)} className='space-y-4 mt-4'>
              <div className='rounded-xl border border-white/15 bg-white/10 p-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-white/55'>Image Preview</p>
                <div className='mt-2 h-44 w-full overflow-hidden rounded-lg bg-slate-900/50'>
                  {editPreviewUrl ? (
                    <img src={editPreviewUrl} alt='Product preview' className='h-full w-full object-cover' loading='lazy' decoding='async' />
                  ) : (
                    <div className='flex h-full items-center justify-center text-sm text-white/45'>No image selected</div>
                  )}
                </div>
              </div>

              <input
                type='text'
                placeholder='Product Name'
                className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                {...registerEdit('name')}
              />

              <select
                className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/80'
                {...registerEdit('category')}
              >
                <option value=''>Select Category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <input
                type='text'
                placeholder='Description'
                className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                {...registerEdit('description')}
              />

              <input
                type='number'
                placeholder='Price'
                className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-300/80'
                {...registerEdit('price')}
              />

              <input
                type='file'
                accept='image/*'
                className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-900'
                {...registerEdit('image', {
                  onChange: (e) => {
                    const file = e?.target?.files?.[0]
                    if (!file) {
                      setEditPreviewUrl(editingProductImageUrl || '')
                      return
                    }

                    if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(editPreviewUrl)
                    }

                    const localPreview = URL.createObjectURL(file)
                    setEditPreviewUrl(localPreview)
                  }
                })}
              />

              <button
                type='submit'
                disabled={updatingProduct}
                className='inline-flex w-full h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-50'
              >
                {updatingProduct ? <Spinner /> : 'Save Changes'}
              </button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='sm:max-w-md border-white/20 bg-slate-950/95 text-white backdrop-blur-2xl'>
            <DialogHeader>
              <DialogTitle className='text-white'>Delete Product</DialogTitle>
              <DialogDescription className='text-white/65'>
                This action cannot be undone. Delete {deleteTarget?.name || 'this product'} permanently?
              </DialogDescription>
            </DialogHeader>

            <div className='mt-4 flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeleteTarget(null)
                }}
                className='rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={confirmDeleteProduct}
                disabled={deletingProduct}
                className='rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60'
              >
                {deletingProduct ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductDashboard
