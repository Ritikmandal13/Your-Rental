'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  image_url: string
  is_verified: boolean | null
  availability_status: string | null
}

export default function PropertiesDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Properties Dashboard Effect:', { authLoading, user: !!user, profile: !!profile, profileRole: profile?.role })
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading...')
      return
    }

    // If no user, redirect
    if (!user) {
      console.log('No user, redirecting to login')
      toast.error('Please login to access this page.')
      router.push('/login')
      return
    }

    // Wait for profile to load (profile might still be null even if authLoading is false)
    if (!profile) {
      console.log('Profile not loaded yet, waiting...')
      // Profile is still loading, wait a bit more
      // But set a timeout to avoid infinite waiting
      const timeout = setTimeout(() => {
        console.error('Profile loading timeout - fetching anyway')
        if (user) {
          fetchProperties()
        }
      }, 3000)
      return () => clearTimeout(timeout)
    }

    // Check if user is a rent provider
    if (profile.role !== 'rent_provider') {
      console.log('Not a rent provider, role:', profile.role)
      toast.error('Access denied. Only rent providers can access this page.')
      router.push('/')
      return
    }

    // User is a provider, fetch properties
    if (user && profile.role === 'rent_provider') {
      console.log('Fetching properties for provider:', user.id)
      fetchProperties()
    }
  }, [user, profile, authLoading, router])

  const fetchProperties = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available')
        toast.error('User ID not found')
        setLoading(false)
        return
      }
      
      console.log('Fetching properties for user:', user.id)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('rent_provider_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      console.log('Properties fetched successfully:', data?.length || 0)
      setProperties(data || [])
    } catch (error: any) {
      console.error('Error fetching properties:', error)
      toast.error(`Failed to fetch properties: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Property deleted successfully')
      fetchProperties()
    } catch (error: any) {
      toast.error('Failed to delete property')
      console.error('Error:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <h1 className="text-4xl font-bold mb-2">Property Dashboard</h1>
              <p className="text-primary-100 text-lg">Welcome back, {profile?.full_name || 'Provider'}!</p>
              <p className="text-primary-200 mt-1">Manage your listings and grow your business</p>
            </div>
            <Link href="/dashboard/properties/add">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-xl font-semibold"
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg">Add New Property</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

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
                <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{properties.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active listings</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="w-7 h-7 text-white" />
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
                <p className="text-gray-600 text-sm font-medium">Available</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {properties.filter(p => p.availability_status === 'available').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
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
                <p className="text-gray-600 text-sm font-medium">Rented</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">
                  {properties.filter(p => p.availability_status === 'rented').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Occupied</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by adding your first property listing and start earning from your properties</p>
            <Link href="/dashboard/properties/add">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors shadow-lg font-semibold"
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg">Add Your First Property</span>
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300"
              >
                <div className="relative h-56 bg-gray-200">
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      property.availability_status === 'available'
                        ? 'bg-green-500 text-white'
                        : property.availability_status === 'rented'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {property.availability_status || 'available'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    📍 {property.location}
                  </p>
                  <p className="text-3xl font-bold text-primary-600 mb-3">
                    ₹{property.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">per month</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-5 pb-4 border-b border-gray-200">
                    <span className="font-medium">{property.bedrooms} bed</span>
                    <span className="font-medium">{property.bathrooms} bath</span>
                    <span className="font-medium">{property.area.toLocaleString('en-IN')} sq ft</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/properties/edit/${property.id}`} className="flex-1">
                      <button className="w-full inline-flex items-center justify-center space-x-2 bg-primary-50 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                        <Edit className="w-5 h-5" />
                        <span>Edit</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="inline-flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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

