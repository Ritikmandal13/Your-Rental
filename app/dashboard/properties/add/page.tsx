'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Loader2, Plus, Home, MapPin, Bed, Bath, Square, DollarSign, Phone, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Independent House',
  'Studio',
  'Penthouse',
  'PG/Co-Living',
  'Serviced Apartment'
]

export default function AddPropertyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  })

  // Images state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Validate each file
    const validFiles: File[] = []
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`)
        return
      }

      // Check total count
      if (selectedImages.length + validFiles.length >= 10) {
        toast.error('Maximum 10 images allowed')
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length === 0) return

    // Create previews for new files
    const newPreviews: string[] = []
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles])
          setImagePreviews(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `properties/${fileName}`

      setUploading(true)
      console.log('Starting upload:', filePath)
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)

      // Add timeout wrapper
      const uploadPromise = supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      })

      const { error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw uploadError
      }

      console.log('Upload successful, getting public URL')
      // Get public URL
      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      console.log('Public URL:', data.publicUrl)
      return data.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedImages.length === 0) {
      toast.error('Please select at least one property image')
      return
    }

    setLoading(true)

    try {
      // Upload all images
      const uploadPromises = selectedImages.map(file => uploadImageToSupabase(file))
      const imageUrls = await Promise.all(uploadPromises)
      
      // Filter out any failed uploads
      const validImageUrls = imageUrls.filter(url => url !== null) as string[]
      
      if (validImageUrls.length === 0) {
        setLoading(false)
        toast.error('Failed to upload images')
        return
      }

      // Use first image as primary image for properties table
      const primaryImageUrl = validImageUrls[0]

      // Insert property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseInt(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: parseInt(formData.area),
          type: formData.type,
          image_url: primaryImageUrl,
          contact_phone: formData.contact_phone,
          rent_provider_id: user?.id,
          availability_status: 'available',
          rating: 4.5,
          is_verified: false,
          featured: false
        })
        .select()

      if (propertyError) throw propertyError

      const propertyId = propertyData[0].id

      // Insert all images into property_images table
      const propertyImages = validImageUrls.map((url, index) => ({
        property_id: propertyId,
        image_url: url,
        display_order: index
      }))

      const { error: imagesError } = await supabase
        .from('property_images' as any)
        .insert(propertyImages)

      if (imagesError) throw imagesError

      toast.success('Property added successfully!')
      router.push('/dashboard/properties')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard/properties"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Properties
          </Link>
          
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Add New Property</h1>
                <p className="text-primary-100 text-base mt-1">Create an amazing listing for your property</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Basic Information
              </h2>
              
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Home className="w-4 h-4 mr-2 text-primary-600" />
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="e.g., Beautiful 2BHK Apartment in Downtown"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2 text-primary-600" />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900 resize-none"
                    placeholder="Describe your property in detail..."
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="e.g., Mumbai, Maharashtra"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary-600" />
                Property Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    required
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 mr-2 text-primary-600" />
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Bed className="w-4 h-4 mr-2 text-primary-600" />
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Bath className="w-4 h-4 mr-2 text-primary-600" />
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Square className="w-4 h-4 mr-2 text-primary-600" />
                    Area (sq ft) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                    placeholder="1200"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary-600" />
                Contact Information
              </h2>
              
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-primary-600" />
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            {/* Images Upload Section */}
            <div className="pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Property Images
                <span className="ml-2 text-sm font-normal text-gray-500">(Max 10)</span>
              </h2>
              
              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-300 group-hover:border-primary-500 transition-all shadow-sm">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
                        {index === 0 && (
                          <span className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {imagePreviews.length < 10 && (
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                      <Upload className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="mb-2 text-base font-semibold text-gray-700 group-hover:text-primary-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mb-2">PNG, JPG or WEBP (MAX. 5MB each)</p>
                    <p className="text-sm font-medium text-primary-600">
                      {imagePreviews.length} of 10 images selected
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              )}
              
              {imagePreviews.length === 0 && (
                <p className="text-sm text-red-600 mt-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  At least one image is required
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-8 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    <span>{uploading ? 'Uploading Images...' : 'Adding Property...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                    <span>Publish Property</span>
                  </>
                )}
              </button>
              <Link href="/dashboard/properties" className="flex-1">
                <button
                  type="button"
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors font-semibold"
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

