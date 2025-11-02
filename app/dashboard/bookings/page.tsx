'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2, Package, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { getBookingConfirmationEmailForUser } from '@/lib/email-templates'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Booking {
  id: string
  status: string
  start_date: string
  end_date: string
  total_amount: number
  message: string | null
  created_at: string
  property: {
    id: string
    title: string
    location: string
    image_url: string
  }
  user_profile: {
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  }
}

export default function ProviderBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // If no user, redirect
    if (!user) {
      toast.error('Please login to access this page.')
      router.push('/login')
      return
    }

    // Wait for profile to load (profile might still be null even if authLoading is false)
    if (!profile) {
      // Profile is still loading, wait a bit more
      return
    }

    // Check if user is a rent provider
    if (profile.role !== 'rent_provider') {
      toast.error('Access denied. Only rent providers can access this page.')
      router.push('/')
      return
    }

    // User is a provider, fetch bookings
    if (user && profile.role === 'rent_provider') {
      fetchBookings()
    }
  }, [user, profile, authLoading, router])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties!bookings_property_id_fkey(
            id,
            title,
            location,
            image_url
          ),
          user_profile:profiles!bookings_user_id_fkey(
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('rent_provider_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch bookings')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingBooking(bookingId)

    try {
      // Fetch booking details before updating
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties!bookings_property_id_fkey(
            id,
            title,
            location
          ),
          user_profile:profiles!bookings_user_id_fkey(
            email,
            full_name
          ),
          provider_profile:profiles!bookings_rent_provider_id_fkey(
            full_name
          )
        `)
        .eq('id', bookingId)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      // Send confirmation email to user if booking is confirmed
      if (newStatus === 'confirmed' && bookingData?.user_profile?.email) {
        try {
          const emailContent = getBookingConfirmationEmailForUser({
            propertyTitle: bookingData.property?.title || 'Property',
            propertyLocation: bookingData.property?.location || '',
            providerName: bookingData.provider_profile?.full_name || 'Property Owner',
            startDate: bookingData.start_date,
            endDate: bookingData.end_date,
            totalAmount: bookingData.total_amount,
            appUrl: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
          })

          await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: bookingData.user_profile.email,
              subject: emailContent.subject,
              html: emailContent.html,
            }),
          })
        } catch (emailError) {
          // Log error but don't fail the status update
          console.error('Failed to send confirmation email:', emailError)
        }
      }

      toast.success(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`)
      fetchBookings()
    } catch (error: any) {
      toast.error(`Failed to update booking: ${error.message}`)
      console.error('Error:', error)
    } finally {
      setUpdatingBooking(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'cancelled':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Booking Management</h1>
              <p className="text-primary-100 text-lg">Review and manage all booking requests</p>
              <p className="text-primary-200 mt-1">Respond to guest inquiries efficiently</p>
            </div>
            <Link href="/dashboard/properties">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-xl font-semibold"
              >
                <Package className="w-5 h-5" />
                <span className="text-lg">My Properties</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{bookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">All requests</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active bookings</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">You'll see booking requests here as users book your properties. Keep adding properties to attract more guests!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Property Image */}
                  <Link href={`/properties/${booking.property.id}`} className="relative h-64 lg:h-full cursor-pointer">
                    <Image
                      src={booking.property.image_url}
                      alt={booking.property.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>

                  {/* Booking Details */}
                  <div className="lg:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/properties/${booking.property.id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                            {booking.property.title}
                          </h3>
                        </Link>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{booking.property.location}</span>
                        </div>

                        {/* User Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                              {booking.user_profile?.avatar_url ? (
                                <img src={booking.user_profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <User className="w-6 h-6 text-primary-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{booking.user_profile?.full_name || 'Guest User'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {booking.user_profile?.email && (
                              <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{booking.user_profile.email}</span>
                              </div>
                            )}
                            {booking.user_profile?.phone && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{booking.user_profile.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                    </div>

                    {/* Booking Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-gray-200">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-500">Check-in</p>
                          <p className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-500">Check-out</p>
                          <p className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Package className="w-5 h-5 mr-2 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="font-bold text-lg text-gray-900">₹{booking.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="mb-4 pt-4 border-t border-gray-200">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-5 h-5 text-primary-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Message from guest:</p>
                            <p className="text-sm text-gray-600">{booking.message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {booking.status === 'pending' && (
                      <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={updatingBooking === booking.id}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {updatingBooking === booking.id ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            'Confirm Booking'
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          disabled={updatingBooking === booking.id}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

