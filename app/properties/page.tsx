'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Loader2, Filter, X } from 'lucide-react'

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

export default function AllPropertiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Get filter values from URL params
  const locationFilter = searchParams.get('location')
  const propertyTypeFilter = searchParams.get('propertyType')
  const budgetFilter = searchParams.get('budget')

  // Count active filters
  const activeFiltersCount = [locationFilter, propertyTypeFilter, budgetFilter].filter(Boolean).length

  const clearFilters = () => {
    router.push('/properties')
  }

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        console.log('Fetching properties with filters:', { locationFilter, propertyTypeFilter, budgetFilter })
        
        let query = supabase
          .from('properties')
          .select('*')

        // Apply filters from URL params

        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`)
        }

        if (propertyTypeFilter) {
          query = query.eq('type', propertyTypeFilter)
        }

        if (budgetFilter) {
          // Parse budget range
          const [minStr, maxStr] = budgetFilter.split('-')
          const min = parseInt(minStr)
          const max = maxStr ? parseInt(maxStr) : null

          if (max) {
            query = query.gte('price', min).lte('price', max)
          } else {
            query = query.gte('price', min)
          }
        }

        const startTime = Date.now()
        const { data, error } = await query.order('created_at', { ascending: false })
        const endTime = Date.now()
        console.log(`Query took ${endTime - startTime}ms, returned ${data?.length || 0} properties`)

        if (error) {
          console.error('Error fetching properties:', error)
        } else {
          // Transform data to match PropertyCard interface
          const formattedProperties = data.map(item => ({
            id: item.id,
            title: item.title,
            location: item.location,
            price: `₹${item.price.toLocaleString('en-IN')}`,
            image: item.image_url,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            area: `${item.area.toLocaleString('en-IN')} sq ft`,
            type: item.type,
            rating: item.rating || 4.5,
            isVerified: item.is_verified || true,
            isFeatured: item.featured || false,
            contactPhone: item.contact_phone || undefined,
          }))
          setProperties(formattedProperties)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [locationFilter, propertyTypeFilter, budgetFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            All Properties
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Browse all available properties in one place
          </p>
          
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-primary-600 text-white font-medium">
                {activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Active
              </span>
              {locationFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  📍 {locationFilter}
                </span>
              )}
              {propertyTypeFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  🏠 {propertyTypeFilter}
                </span>
              )}
              {budgetFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  💰 ₹{budgetFilter.split('-').map(n => parseInt(n)).join(' - ')}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No properties found</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

