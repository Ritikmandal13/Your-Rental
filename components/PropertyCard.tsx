'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Bed, Bath, Square, Star, Phone, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface PropertyCardProps {
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

export default function PropertyCard({
  id,
  title,
  location,
  price,
  image,
  bedrooms,
  bathrooms,
  area,
  type,
  rating = 4.5,
  isVerified = true,
  isFeatured = false,
  contactPhone,
}: PropertyCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (user) {
      checkFavorite()
    }
  }, [user, id])

  const checkFavorite = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('favorites' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .single()

      if (!error && data) {
        setIsLiked(true)
      }
    } catch (error) {
      // Not in favorites, ignore
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please login to save favorites')
      return
    }

    try {
      if (isLiked) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id)

        if (error) throw error
        toast.success('Removed from favorites')
        setIsLiked(false)
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites' as any)
          .insert({
            user_id: user.id,
            property_id: id,
          })

        if (error) throw error
        toast.success('Added to favorites')
        setIsLiked(true)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites')
      console.error('Error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <Link href={`/properties/${id}`}>
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {isFeatured && (
            <span className="bg-yellow-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {isVerified && (
            <span className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              Verified
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all z-10 ${
            isLiked
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

          {/* Property Type */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <span className="bg-black/70 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
              {type}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <Link href={`/properties/${id}`}>
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base hover:text-primary-600 transition-colors">{title}</h3>
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              <span className="text-xs sm:text-sm font-medium">{rating}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">{location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{bedrooms} Beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{bathrooms} Baths</span>
              </div>
              <div className="flex items-center">
                <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{area}</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{price}</span>
              <span className="text-xs sm:text-sm text-gray-600 ml-1">/month</span>
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {contactPhone && (
            <a 
              href={`tel:${contactPhone}`} 
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full bg-primary-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Call</span>
              </button>
            </a>
          )}
          <Link href={`/properties/${id}`} className="flex-1">
            <button className="w-full bg-gray-100 text-gray-700 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 sm:space-x-2">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">View Details</span>
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}



