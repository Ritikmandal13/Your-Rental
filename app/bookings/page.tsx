'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2, Package, Bed, Bath, Square } from 'lucide-react'
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
    price: number
    bedrooms: number
    bathrooms: number
    area: number
  }
}

export default function MyBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to view your bookings')
      router.push('/login')
      return
    }

    if (user && profile?.role === 'rent_provider') {
      toast.error('This page is for users only. Rent providers have a different dashboard.')
      router.push('/')
      return
    }

    if (user && profile?.role === 'user') {
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
            image_url,
            price,
            bedrooms,
            bathrooms,
            area
          )
        `)
        .eq('user_id', user?.id)
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
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Track and manage your property bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and book your perfect property</p>
            <Link href="/">
              <button className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                <span className="font-medium">Browse Properties</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Property Image */}
                  <Link href={`/properties/${booking.property.id}`} className="relative h-48 md:h-full cursor-pointer">
                    <Image
                      src={booking.property.image_url}
                      alt={booking.property.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>

                  {/* Booking Details */}
                  <div className="md:col-span-3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Link href={`/properties/${booking.property.id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                            {booking.property.title}
                          </h3>
                        </Link>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{booking.property.location}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>{booking.property.bedrooms} beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span>{booking.property.bathrooms} baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1" />
                            <span>{booking.property.area.toLocaleString('en-IN')} sq ft</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                    </div>

                    {/* Booking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-gray-200">
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
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 mr-2 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-500">Booked on</p>
                          <p className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {booking.message && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Your message:</span> {booking.message}
                        </p>
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

