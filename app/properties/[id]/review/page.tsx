'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Star, Loader2, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

interface Property {
  id: string
  title: string
  location: string
}

export default function ReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to leave a review')
      router.push('/login')
      return
    }

    if (profile?.role === 'rent_provider') {
      toast.error('Rent providers cannot leave reviews')
      router.push(`/properties/${id}`)
      return
    }

    if (id) {
      fetchProperty()
    }
  }, [id, user, profile, router])

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        toast.error('Property not found')
        router.push('/')
        return
      }

      setProperty(data)

      // Check if user has already reviewed this property
      if (user?.id) {
        const { data: existingReview, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('property_id', id)
          .eq('user_id', user.id)
          .single()

        if (!reviewError && existingReview) {
          setRating(existingReview.rating)
          setComment(existingReview.comment || '')
        }
      }
    } catch (error: any) {
      toast.error('Failed to fetch property details')
      console.error('Error:', error)
      router.push(`/properties/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || profile?.role === 'rent_provider') return
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)

    try {
      // Check if user has already reviewed this property
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('property_id', id)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)

        if (error) throw error
        toast.success('Review updated successfully!')
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            property_id: id,
            user_id: user.id,
            rating,
            comment: comment || null,
          })

        if (error) throw error
        toast.success('Review submitted successfully!')
      }

      router.push(`/properties/${id}`)
    } catch (error: any) {
      toast.error(`Failed to submit review: ${error.message}`)
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/properties/${id}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Property
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
            <p className="text-gray-600">{property?.title}</p>
            <p className="text-sm text-gray-500">{property?.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                How would you rate this property?
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 0 && 'Click to select'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Share your experience with this property..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {comment.length} characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <Link href={`/properties/${id}`} className="flex-1">
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

