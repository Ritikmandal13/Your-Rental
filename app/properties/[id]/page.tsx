'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, MapPin, Bed, Bath, Square, Star, Phone, MessageCircle, Calendar, User, Loader2, Edit } from 'lucide-react'
import { getBookingNotificationEmailForProvider } from '@/lib/email-templates'
import { motion } from 'framer-motion'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  image_url: string
  rating: number | null
  is_verified: boolean | null
  availability_status: string | null
  contact_phone: string | null
  rent_provider_id: string | null
  created_at: string | null
  professional_domains?: string[] | null
  interests?: string[] | null
  lifestyle?: string[] | null
  amenities?: string[] | null
}

interface PropertyImage {
  id: string
  image_url: string
  display_order: number
}

interface Review {
  id: string
  property_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string | null
  booking_id: string | null
  updated_at: string | null
  user_profile: {
    full_name: string | null
    avatar_url: string | null
  }
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const router = useRouter()
  const { user, profile } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingStartDate, setBookingStartDate] = useState('')
  const [bookingEndDate, setBookingEndDate] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [submittingBooking, setSubmittingBooking] = useState(false)
  const [providerInfo, setProviderInfo] = useState<{ full_name: string | null; email: string | null }>({ full_name: null, email: null })

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProperty()
      fetchReviews()
    }
  }, [id])

  const fetchProperty = async () => {
    if (!id || typeof id !== 'string') return
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        toast.error('Property not found')
        router.push('/')
        return
      }

      setProperty(data)

      // Fetch provider info
      if (data.rent_provider_id) {
        const { data: providerData, error: providerError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', data.rent_provider_id)
          .single()

        if (!providerError && providerData) {
          setProviderInfo(providerData)
        }
      }

      // Fetch property images
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images' as any)
        .select('*')
        .eq('property_id', id)
        .order('display_order', { ascending: true })

      if (!imagesError && imagesData) {
        setPropertyImages(imagesData as unknown as PropertyImage[])
      }
    } catch (error: any) {
      toast.error('Failed to fetch property details')
      console.error('Error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!id || typeof id !== 'string') return
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profile:profiles!reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('property_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews((data as unknown as Review[]) || [])
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to book a property')
      router.push('/login')
      return
    }

    if (profile?.role === 'rent_provider') {
      toast.error('Rent providers cannot book properties')
      return
    }

    if (!property) return

    setSubmittingBooking(true)

    try {
      const startDate = new Date(bookingStartDate)
      const endDate = new Date(bookingEndDate)
      
      if (endDate < startDate) {
        toast.error('End date must be after start date')
        setSubmittingBooking(false)
        return
      }

      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalAmount = (property.price / 30) * days

      const { error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          user_id: user.id,
          rent_provider_id: property.rent_provider_id || user?.id || '', // Fallback if null
          start_date: bookingStartDate,
          end_date: bookingEndDate,
          total_amount: totalAmount,
          message: bookingMessage || null,
          status: 'pending',
        })

      if (error) throw error

      // Send email notification to rental provider
      try {
        if (property.rent_provider_id) {
          const { data: providerData } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', property.rent_provider_id)
            .single()

          if (providerData?.email) {
            const emailContent = getBookingNotificationEmailForProvider({
              propertyTitle: property.title,
              propertyLocation: property.location,
              userName: profile?.full_name || user.email || 'Guest User',
              userEmail: user.email || '',
              startDate: bookingStartDate,
              endDate: bookingEndDate,
              totalAmount,
              message: bookingMessage || null,
              appUrl: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
            })

            await fetch('/api/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: providerData.email,
                subject: emailContent.subject,
                html: emailContent.html,
              }),
            })
          }
        }
      } catch (emailError) {
        // Log error but don't fail the booking
        console.error('Failed to send email notification:', emailError)
      }

      toast.success('Booking request submitted successfully!')
      setShowBookingForm(false)
      setBookingStartDate('')
      setBookingEndDate('')
      setBookingMessage('')
    } catch (error: any) {
      toast.error(`Failed to submit booking: ${error.message}`)
      console.error('Error:', error)
    } finally {
      setSubmittingBooking(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) return null

  const isOwner = user?.id === property?.rent_provider_id

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            >
              {/* Main Image */}
              <div className="relative h-96 w-full">
                <Image
                  src={propertyImages.length > 0 ? propertyImages[selectedImageIndex].image_url : property.image_url}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Image Thumbnails */}
              {propertyImages.length > 1 && (
                <div className="p-4 grid grid-cols-4 sm:grid-cols-5 gap-2 bg-gray-50">
                  {propertyImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-primary-600 scale-105'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Preferences */}
            {(property.professional_domains?.length || property.interests?.length || property.lifestyle?.length || property.amenities?.length) && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.professional_domains?.length ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Professional Domains</p>
                      <div className="flex flex-wrap gap-2">
                        {property.professional_domains.map((d) => (
                          <span key={d} className="px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-200">{d}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {property.interests?.length ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {property.interests.map((d) => (
                          <span key={d} className="px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-200">{d}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {property.lifestyle?.length ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Lifestyle</p>
                      <div className="flex flex-wrap gap-2">
                        {property.lifestyle.map((d) => (
                          <span key={d} className="px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-200">{d}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {property.amenities?.length ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((d) => (
                          <span key={d} className="px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 border border-primary-200">{d}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{property.location}</span>
                  </div>
                </div>
                {isOwner && (
                  <Link href={`/dashboard/properties/edit/${property.id}`}>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </Link>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-gray-700">{property.area.toLocaleString('en-IN')} sq ft</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <span className="text-gray-700">{property.type}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold">{averageRating}</span>
                  <span className="text-gray-600">({reviews.length})</span>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            {review.user_profile?.avatar_url ? (
                              <img src={review.user_profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <User className="w-5 h-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.user_profile?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 ml-13">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No reviews yet. Be the first to review this property!
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-primary-600">
                  ₹{property.price.toLocaleString('en-IN')}
                </span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>

              {property.availability_status === 'available' ? (
                isOwner ? (
                  <div className="space-y-3">
                    <button className="w-full bg-gray-200 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed">
                      This is your property
                    </button>
                  </div>
                ) : profile?.role === 'rent_provider' ? (
                  <div className="space-y-3">
                    <button className="w-full bg-gray-200 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed">
                      Providers can't book
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!showBookingForm ? (
                      <>
                        <button
                          onClick={() => setShowBookingForm(true)}
                          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                          Book Now
                        </button>
                        {id && (
                          <Link href={`/properties/${id}/review`}>
                            <button className="w-full border border-primary-600 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium">
                              Leave a Review
                            </button>
                          </Link>
                        )}
                        {property.contact_phone ? (
                          <a 
                            href={`tel:${property.contact_phone}`}
                            className="w-full"
                          >
                            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>Call Now</span>
                            </button>
                          </a>
                        ) : null}
                      </>
                    ) : (
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={bookingStartDate}
                            onChange={(e) => setBookingStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={bookingEndDate}
                            onChange={(e) => setBookingEndDate(e.target.value)}
                            min={bookingStartDate || new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                          <textarea
                            value={bookingMessage}
                            onChange={(e) => setBookingMessage(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Add a message for the property owner..."
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowBookingForm(false)}
                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingBooking}
                            className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingBooking ? (
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                              'Submit'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed">
                    Not Available
                  </button>
                </div>
              )}

              {/* Provider Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Property Owner</p>
                <p className="text-sm text-gray-600">{providerInfo.full_name || 'N/A'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

