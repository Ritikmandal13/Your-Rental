'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FeaturedProperties from '@/components/FeaturedProperties'
import Services from '@/components/Services'
import Footer from '@/components/Footer'

export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if we're fully loaded and user is a rent provider
    if (!loading && user && profile?.role === 'rent_provider') {
      setRedirecting(true)
      router.push('/dashboard/properties')
    }
  }, [user, profile, loading])

  // Show loading while auth is initializing OR while redirecting providers
  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedProperties />
      <Services />
      <Footer />
    </main>
  )
}



