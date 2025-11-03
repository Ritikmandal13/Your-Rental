'use client'

import { useEffect, useState, Suspense } from 'react'
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

function AllPropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Get filter values from URL params
  const locationFilter = searchParams.get('location')
  const propertyTypeFilter = searchParams.get('propertyType')
  const budgetFilter = searchParams.get('budget')
  // New preference-based filters (CSV lists)
  const parseCsv = (key: string): string[] => {
    const v = searchParams.get(key)
    if (!v) return []
    return v.split(',').map(s => s.trim()).filter(Boolean)
  }
  const domains = parseCsv('domains')
  const interests = parseCsv('interests')
  const lifestyle = parseCsv('lifestyle')
  const amenities = parseCsv('amenities')

  const toPgTextArray = (vals: string[]) => {
    const esc = (s: string) => s.split('"').join('\\"')
    return `{${vals.map(v => '"' + esc(v) + '"').join(',')}}`
  }

  // Options (keep in sync with provider form)
  const PROFESSIONAL_DOMAINS = [
    'Technology','Finance','Healthcare','Education','Design & Creative','Marketing'
  ]
  const INTERESTS = [
    'Fitness & Sports','Music & Arts','Reading & Writing','Gaming & Tech','Cooking & Food','Travel & Adventure','Photography','Coffee Culture'
  ]
  const LIFESTYLES = ['Early Riser','Night Owl','Vegan','Vegetarian','Smoker','Non-Smoker']
  const AMENITIES = ['High-Speed WiFi','Air Conditioning','Fully Equipped Kitchen','Laundry Facilities','Gym/Fitness Center','Parking Space','24/7 Security','Cleaning Service','Furnished','Pet Friendly']

  // Local UI state (initialized from URL)
  const [selDomains, setSelDomains] = useState<string[]>(domains)
  const [selInterests, setSelInterests] = useState<string[]>(interests)
  const [selLifestyle, setSelLifestyle] = useState<string[]>(lifestyle)
  const [selAmenities, setSelAmenities] = useState<string[]>(amenities)

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (locationFilter) params.set('location', locationFilter)
    if (propertyTypeFilter) params.set('propertyType', propertyTypeFilter)
    if (budgetFilter) params.set('budget', budgetFilter)
    if (selDomains.length) params.set('domains', selDomains.join(','))
    if (selInterests.length) params.set('interests', selInterests.join(','))
    if (selLifestyle.length) params.set('lifestyle', selLifestyle.join(','))
    if (selAmenities.length) params.set('amenities', selAmenities.join(','))
    router.push(`/properties?${params.toString()}`)
  }

  // Count active filters
  const activeFiltersCount = [
    locationFilter,
    propertyTypeFilter,
    budgetFilter,
    domains.length ? 'd' : '',
    interests.length ? 'i' : '',
    lifestyle.length ? 'l' : '',
    amenities.length ? 'a' : '',
  ].filter(Boolean).length

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

        // Preference filters (match any of selected)
        if (domains.length) {
          query = query.filter('professional_domains', 'ov', toPgTextArray(domains))
        }
        if (interests.length) {
          query = query.filter('interests', 'ov', toPgTextArray(interests))
        }
        if (lifestyle.length) {
          query = query.filter('lifestyle', 'ov', toPgTextArray(lifestyle))
        }
        if (amenities.length) {
          query = query.filter('amenities', 'ov', toPgTextArray(amenities))
        }

        const startTime = Date.now()
        let data: any[] | null = null
        try {
          const res = await (query as any)
            .order('created_at', { ascending: false })
            .throwOnError()
          data = res.data
        } catch (e: any) {
          console.error('Error fetching properties:', e?.message || e)
        }
        const endTime = Date.now()
        console.log(`Query took ${endTime - startTime}ms, returned ${data?.length || 0} properties`)

        if (data) {
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
        console.error('Error:', (error as any)?.message || error)
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
          <div className="mt-4">
            <button onClick={() => setShowFilters(v => !v)} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors">
              <Filter className="w-4 h-4 mr-2" /> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          
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
              {domains.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  👔 {domains.join(', ')}
                </span>
              )}
              {interests.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  🎯 {interests.join(', ')}
                </span>
              )}
              {lifestyle.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  🧬 {lifestyle.join(', ')}
                </span>
              )}
              {amenities.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  🏷️ {amenities.join(', ')}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-10 bg-white rounded-2xl shadow p-6 space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(opt => (
                  <button key={opt} type="button" onClick={() => toggle(selAmenities, opt, setSelAmenities)} className={`${selAmenities.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-3 py-1.5 text-sm transition-colors`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Professional Domains</p>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONAL_DOMAINS.map(opt => (
                  <button key={opt} type="button" onClick={() => toggle(selDomains, opt, setSelDomains)} className={`${selDomains.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-3 py-1.5 text-sm transition-colors`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(opt => (
                  <button key={opt} type="button" onClick={() => toggle(selInterests, opt, setSelInterests)} className={`${selInterests.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-3 py-1.5 text-sm transition-colors`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Lifestyle</p>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLES.map(opt => (
                  <button key={opt} type="button" onClick={() => toggle(selLifestyle, opt, setSelLifestyle)} className={`${selLifestyle.includes(opt) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-800'} border border-gray-300 hover:border-primary-500 rounded-lg px-3 py-1.5 text-sm transition-colors`}>{opt}</button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <button onClick={applyFilters} className="inline-flex items-center px-5 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

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

export default function AllPropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <AllPropertiesContent />
    </Suspense>
  )
}

