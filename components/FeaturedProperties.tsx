'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PropertyCard from './PropertyCard'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

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

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

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
  }, [])

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Featured Properties
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Discover our handpicked selection of premium properties in prime locations
          </p>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link href="/properties">
            <button className="bg-primary-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm sm:text-base">
              View All Properties
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}



