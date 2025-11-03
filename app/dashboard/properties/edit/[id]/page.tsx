'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Loader2, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Independent House',
  'Studio',
  'Penthouse',
  'PG/Co-Living',
  'Serviced Apartment'
]

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
  contact_phone: string | null
  availability_status: string | null
  rent_provider_id: string
  professional_domains?: string[] | null
  interests?: string[] | null
  lifestyle?: string[] | null
  amenities?: string[] | null
}

export default function EditPropertyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const propertyId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'Apartment',
    contact_phone: '',
    availability_status: 'available',
  })

  // Image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('')
  const [deleteOldImage, setDeleteOldImage] = useState(false)

  // Preference options
  const PROFESSIONAL_DOMAINS = [
    'Technology','Finance','Healthcare','Education','Design & Creative','Marketing'
  ]
  const INTERESTS = [
    'Fitness & Sports','Music & Arts','Reading & Writing','Gaming & Tech','Cooking & Food','Travel & Adventure','Photography','Coffee Culture'
  ]
  const LIFESTYLES = ['Early Riser','Night Owl','Vegan','Vegetarian','Smoker','Non-Smoker']
  const AMENITIES = ['High-Speed WiFi','Air Conditioning','Fully Equipped Kitchen','Laundry Facilities','Gym/Fitness Center','Parking Space','24/7 Security','Cleaning Service','Furnished','Pet Friendly']

  // Selected preferences
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const toggleInList = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  useEffect(() => {
    if (propertyId && typeof propertyId === 'string') {
      fetchProperty()
    }
  }, [propertyId, user])

  const fetchProperty = async () => {
    if (!user?.id || !propertyId || typeof propertyId !== 'string') {
      if (!user?.id) {
        router.push('/dashboard/properties')
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('rent_provider_id', user.id)
        .single()

      if (error) throw error

      const property = data as Property

      // Check if property belongs to this user
      if (property.rent_provider_id !== user?.id) {
        toast.error('Access denied')
        router.push('/dashboard/properties')
        return
      }

      setFormData({
        title: property.title,
        description: property.description,
        location: property.location,
        price: property.price.toString(),
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        area: property.area.toString(),
        type: property.type,
        contact_phone: property.contact_phone || '',
        availability_status: property.availability_status || 'available',
      })

      setOriginalImageUrl(property.image_url)
      setImagePreview(property.image_url)

      // Load preferences
      setSelectedDomains(property.professional_domains || [])
      setSelectedInterests(property.interests || [])
      setSelectedLifestyle(property.lifestyle || [])
      setSelectedAmenities(property.amenities || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Failed to load property')
      router.push('/dashboard/properties')
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `properties/${fileName}`

      setUploading(true)

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      if (!imageUrl) return
      
      // Extract file path from URL
      // Supabase storage URLs format: https://[project].supabase.co/storage/v1/object/public/property-images/properties/filename
      // Or: https://[project].supabase.co/storage/v1/object/sign/property-images/properties/filename?token=...
      let filePath = ''
      
      // Try to extract from public URL
      const publicUrlMatch = imageUrl.match(/\/property-images\/(.+)$/)
      if (publicUrlMatch) {
        filePath = publicUrlMatch[1].split('?')[0] // Remove query params if any
      } else {
        // Try to extract from signed URL or other formats
        const signedUrlMatch = imageUrl.match(/property-images\/([^?]+)/)
        if (signedUrlMatch) {
          filePath = signedUrlMatch[1]
        }
      }
      
      if (filePath) {
        const { error } = await supabase.storage
          .from('property-images')
          .remove([filePath])
        
        if (error) {
          console.error('Error deleting old image:', error)
          // Don't throw - continue even if deletion fails
        } else {
          console.log('Old image deleted successfully:', filePath)
        }
      } else {
        console.warn('Could not extract file path from URL:', imageUrl)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      // Continue even if deletion fails
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    setDeleteOldImage(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!propertyId || typeof propertyId !== 'string') {
      toast.error('Invalid property ID')
      return
    }
    
    setLoading(true)

    try {
      let imageUrl = originalImageUrl

      // Upload new image if selected
      if (selectedImage) {
        // Delete old image from storage when replacing with new image
        if (originalImageUrl) {
          await deleteImageFromStorage(originalImageUrl)
        }
        
        const newImageUrl = await uploadImageToSupabase(selectedImage)
        
        if (!newImageUrl) {
          setLoading(false)
          return
        }
        imageUrl = newImageUrl
      } else if (deleteOldImage) {
        // User clicked remove but didn't upload new image
        toast.error('Please upload a new image. Image is required.')
        setLoading(false)
        return
      }
      // If neither selectedImage nor deleteOldImage, keep the original image

      // Update property
      const { error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseInt(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: parseInt(formData.area),
          type: formData.type,
          image_url: imageUrl,
          contact_phone: formData.contact_phone,
          availability_status: formData.availability_status,
          professional_domains: selectedDomains as any,
          interests: selectedInterests as any,
          lifestyle: selectedLifestyle as any,
          amenities: selectedAmenities as any,
        })
        .eq('id', propertyId)

      if (error) throw error

      toast.success('Property updated successfully!')
      router.push('/dashboard/properties')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/properties"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-1">Update property details</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="e.g., Beautiful 2BHK Apartment in Downtown"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Describe your property..."
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="e.g., Mumbai, Maharashtra"
                required
              />
            </div>

            {/* Property Type and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="1200"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Contact Phone and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status *
                </label>
                <select
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Image *
              </label>
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(originalImageUrl)
                          setDeleteOldImage(false)
                        }}
                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        title="Cancel new image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {deleteOldImage && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                      Image will be removed
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* Preferences */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-600" /> Preferences
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Professional Domains</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {PROFESSIONAL_DOMAINS.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleInList(selectedDomains, opt, setSelectedDomains)} className={`${selectedDomains.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-4 py-2 text-sm transition-colors text-left`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Lifestyle & Interests</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {INTERESTS.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleInList(selectedInterests, opt, setSelectedInterests)} className={`${selectedInterests.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-4 py-2 text-sm transition-colors text-left`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Lifestyle</p>
                  <div className="flex flex-wrap gap-2">
                    {LIFESTYLES.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleInList(selectedLifestyle, opt, setSelectedLifestyle)} className={`${selectedLifestyle.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-4 py-2 text-sm transition-colors`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {AMENITIES.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleInList(selectedAmenities, opt, setSelectedAmenities)} className={`${selectedAmenities.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-4 py-2 text-sm transition-colors text-left`}>{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {uploading ? 'Uploading...' : 'Updating Property...'}
                  </>
                ) : (
                  'Update Property'
                )}
              </button>
              <Link href="/dashboard/properties" className="flex-1">
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

