'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Heart, Loader2, Home, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'

interface Property {
  id: string
  title: string
  location: string
  price: string
  image: string
  bedrooms: number
  bathrooms: number
  area: string
  type: string
  rating?: number
  isVerified?: boolean
  isFeatured?: boolean
  contactPhone?: string
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to view your favorites')
      router.push('/login')
      return
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, authLoading, router])

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          properties (
            id,
            title,
            location,
            price,
            image_url,
            bedrooms,
            bathrooms,
            area,
            type,
            rating,
            is_verified,
            featured,
            contact_phone
          )
        `)
        .eq('user_id', user?.id)

      if (error) throw error

      // Transform data to match PropertyCard interface
      const formattedProperties = data.map((item: any) => ({
        id: item.properties.id,
        title: item.properties.title,
        location: item.properties.location,
        price: `₹${item.properties.price.toLocaleString('en-IN')}`,
        image: item.properties.image_url,
        bedrooms: item.properties.bedrooms,
        bathrooms: item.properties.bathrooms,
        area: `${item.properties.area.toLocaleString('en-IN')} sq ft`,
        type: item.properties.type,
        rating: item.properties.rating || 4.5,
        isVerified: item.properties.is_verified || true,
        isFeatured: item.properties.featured || false,
        contactPhone: item.properties.contact_phone || undefined,
      }))

      setProperties(formattedProperties)
    } catch (error: any) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('property_id', propertyId)

      if (error) throw error
      
      toast.success('Removed from favorites')
      fetchFavorites()
    } catch (error: any) {
      toast.error('Failed to remove favorite')
      console.error('Error:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Heart className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Saved Properties
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Your favorite properties in one place
          </p>
          {properties.length > 0 && (
            <p className="mt-2 text-sm text-primary-600 font-medium">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
            </p>
          )}
        </motion.div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 sm:p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start exploring properties and save your favorites for easy access</p>
            <Link href="/properties">
              <button className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors shadow-lg font-semibold">
                <Home className="w-5 h-5" />
                <span>Browse Properties</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

