import {
  createInterviewReviewApi,
  deleteInterviewReviewApi,
  getInterviewReviewListApi,
  getInterviewReviewStatsApi,
  toggleHelpfulInterviewReviewApi,
  updateInterviewReviewApi
} from '@/Api/interviewReview.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback

export const useCreateInterviewReviewHook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInterviewReviewApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Review posted')
      queryClient.invalidateQueries({ queryKey: ['interviewReviews'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to post review'))
    }
  })
}

export const useInterviewReviewListHook = ({ company = '', minRating = 0 } = {}) => {
  return useQuery({
    queryKey: ['interviewReviews', company, minRating],
    queryFn: () => getInterviewReviewListApi({ company, minRating })
  })
}

export const useUpdateInterviewReviewHook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateInterviewReviewApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Review updated')
      queryClient.invalidateQueries({ queryKey: ['interviewReviews'] })
      queryClient.invalidateQueries({ queryKey: ['interviewReviewStats'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to update review'))
    }
  })
}

export const useDeleteInterviewReviewHook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInterviewReviewApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Review deleted')
      queryClient.invalidateQueries({ queryKey: ['interviewReviews'] })
      queryClient.invalidateQueries({ queryKey: ['interviewReviewStats'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete review'))
    }
  })
}

export const useHelpfulInterviewReviewHook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleHelpfulInterviewReviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewReviews'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Unable to update helpful vote'))
    }
  })
}

export const useInterviewReviewStatsHook = () => {
  return useQuery({
    queryKey: ['interviewReviewStats'],
    queryFn: getInterviewReviewStatsApi
  })
}
