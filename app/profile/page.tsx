'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { User, Mail, Phone, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ProfileSettingsPage() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to access this page')
      router.push('/login')
      return
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      })
    }
  }, [user, profile, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
      })

      if (error) throw error
      
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 sm:px-8 py-8 sm:py-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-primary-100">Manage your account information and preferences</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  {profile?.full_name ? (
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-12 sm:w-16 h-12 sm:h-16 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">Click to upload a new photo</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Role Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Account Type</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {profile?.role === 'rent_provider' ? 'Rent Provider' : 'Regular User'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

