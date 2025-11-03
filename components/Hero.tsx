'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Building, Home, Users, Filter, ChevronDown, GraduationCap, Briefcase, Heart, Music, BookOpen, Gamepad2, Utensils, Car, Plane, Camera, Palette, Dumbbell, Coffee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Hero() {
  const router = useRouter()
  const [searchType, setSearchType] = useState('rent')
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [budget, setBudget] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [lifestyle, setLifestyle] = useState('')
  const [occupation, setOccupation] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])

  const searchTypes = [
    { id: 'buy', label: 'Buy', icon: Home },
    { id: 'rent', label: 'Rent', icon: Building },
    { id: 'commercial', label: 'Commercial', icon: Building },
    { id: 'pg', label: 'PG/Co-Living', icon: Users },
  ]

  const propertyTypes = [
    'Apartment', 'Villa', 'Independent House', 'Studio', 'Penthouse', 'PG/Co-Living', 'Serviced Apartment'
  ]

  const budgetRanges = [
    { value: '0-10000', label: '₹0 - ₹10,000' },
    { value: '10000-25000', label: '₹10,000 - ₹25,000' },
    { value: '25000-50000', label: '₹25,000 - ₹50,000' },
    { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
    { value: '100000+', label: '₹1,00,000+' },
  ]

  const popularLocations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'
  ]

  // Domain-based filters for finding like-minded people
  const domainCategories = [
    {
      category: 'Professional Domains',
      domains: [
        { id: 'tech', label: 'Technology', icon: Briefcase, description: 'Software, IT, Startups' },
        { id: 'finance', label: 'Finance', icon: Briefcase, description: 'Banking, Investment, Consulting' },
        { id: 'healthcare', label: 'Healthcare', icon: Briefcase, description: 'Medical, Pharma, Research' },
        { id: 'education', label: 'Education', icon: GraduationCap, description: 'Teaching, Research, Academia' },
        { id: 'design', label: 'Design & Creative', icon: Palette, description: 'UI/UX, Graphic Design, Arts' },
        { id: 'marketing', label: 'Marketing', icon: Briefcase, description: 'Digital Marketing, Advertising' },
      ]
    },
    {
      category: 'Lifestyle & Interests',
      domains: [
        { id: 'fitness', label: 'Fitness & Sports', icon: Dumbbell, description: 'Gym, Yoga, Sports' },
        { id: 'music', label: 'Music & Arts', icon: Music, description: 'Musicians, Artists, Performers' },
        { id: 'reading', label: 'Reading & Writing', icon: BookOpen, description: 'Authors, Book Lovers' },
        { id: 'gaming', label: 'Gaming & Tech', icon: Gamepad2, description: 'Gamers, Tech Enthusiasts' },
        { id: 'cooking', label: 'Cooking & Food', icon: Utensils, description: 'Chefs, Food Bloggers' },
        { id: 'travel', label: 'Travel & Adventure', icon: Plane, description: 'Travelers, Adventure Seekers' },
        { id: 'photography', label: 'Photography', icon: Camera, description: 'Photographers, Content Creators' },
        { id: 'coffee', label: 'Coffee Culture', icon: Coffee, description: 'Coffee Lovers, Cafe Hopping' },
      ]
    }
  ]

  const lifestyleOptions = [
    { value: 'early-bird', label: 'Early Bird (6 AM - 10 PM)' },
    { value: 'night-owl', label: 'Night Owl (Late Night)' },
    { value: 'work-from-home', label: 'Work from Home' },
    { value: 'hybrid', label: 'Hybrid Work' },
    { value: 'student', label: 'Student Life' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
  ]

  const occupationOptions = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Marketing Manager',
    'Financial Analyst', 'Doctor', 'Teacher', 'Student', 'Entrepreneur', 'Consultant',
    'Content Creator', 'Artist', 'Chef', 'Photographer', 'Other'
  ]

  const ageGroups = [
    { value: '18-25', label: '18-25 years' },
    { value: '26-35', label: '26-35 years' },
    { value: '36-45', label: '36-45 years' },
    { value: '46+', label: '46+ years' },
  ]

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'any', label: 'Any' },
  ]

  const amenityOptions = [
    { id: 'wifi', label: 'High-Speed WiFi' },
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'kitchen', label: 'Fully Equipped Kitchen' },
    { id: 'laundry', label: 'Laundry Facilities' },
    { id: 'gym', label: 'Gym/Fitness Center' },
    { id: 'parking', label: 'Parking Space' },
    { id: 'security', label: '24/7 Security' },
    { id: 'cleaning', label: 'Cleaning Service' },
    { id: 'furnished', label: 'Furnished' },
    { id: 'pet-friendly', label: 'Pet Friendly' },
  ]

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    )
  }

  const handleAmenityToggle = (amenityId: string) => {
    setAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleSearch = () => {
    // Build query parameters from filters
    const params = new URLSearchParams()
    
    // Map search type to property types
    // Only apply searchType if propertyType is not manually selected
    if (!propertyType) {
      if (searchType === 'commercial') {
        params.set('propertyType', 'Commercial')
      } else if (searchType === 'pg') {
        params.set('propertyType', 'PG/Co-Living')
      }
    } else {
      // If user manually selected a property type, use that instead
      params.set('propertyType', propertyType)
    }
    
    if (location) params.set('location', location)
    if (budget) params.set('budget', budget)

    // Map selected domain ids to labels and split into domains vs interests
    const idToLabel = new Map<string, string>()
    domainCategories.forEach(group => group.domains.forEach(d => idToLabel.set(d.id, d.label)))
    const professionalIds = ['tech','finance','healthcare','education','design','marketing']
    const interestIds = ['fitness','music','reading','gaming','cooking','travel','photography','coffee']

    const domainLabels = selectedDomains
      .filter(id => professionalIds.includes(id))
      .map(id => idToLabel.get(id)!)
    const interestLabels = selectedDomains
      .filter(id => interestIds.includes(id))
      .map(id => idToLabel.get(id)!)

    if (domainLabels.length) params.set('domains', domainLabels.join(','))
    if (interestLabels.length) params.set('interests', interestLabels.join(','))

    // Map amenity ids to labels
    if (amenities.length) {
      const amenityMap = new Map(amenityOptions.map(a => [a.id, a.label]))
      const amenityLabels = amenities.map(id => amenityMap.get(id)!).filter(Boolean)
      if (amenityLabels.length) params.set('amenities', amenityLabels.join(','))
    }
    
    // Navigate to properties page with filters
    const queryString = params.toString()
    router.push(`/properties${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            Find Your Perfect Home & Roommates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 mb-6 sm:mb-8 px-2"
          >
            Connect with like-minded people based on your interests and lifestyle
          </motion.p>
        </div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          {/* Search Type Tabs */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex flex-wrap justify-center">
              {searchTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSearchType(type.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-md transition-all text-sm sm:text-base ${
                    searchType === type.id
                      ? 'bg-white text-primary-700 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <type.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Search Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                />
              </div>

              {/* Property Type */}
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base cursor-pointer appearance-none"
                >
                  <option value="">Property Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
              </div>

              {/* Budget Range */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base pointer-events-none z-10">₹</span>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-7 sm:pl-8 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base cursor-pointer appearance-none"
                >
                  <option value="">Budget</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base font-medium"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4 space-y-6"
                >
                  {/* Domain-Based Filters */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Find Like-Minded People</h3>
                    <div className="space-y-4">
                      {domainCategories.map((category) => (
                        <div key={category.category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {category.domains.map((domain) => (
                              <button
                                key={domain.id}
                                onClick={() => handleDomainToggle(domain.id)}
                                className={`flex items-center space-x-2 p-2 rounded-lg border text-sm transition-all ${
                                  selectedDomains.includes(domain.id)
                                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <domain.icon className="w-4 h-4" />
                                <span className="truncate">{domain.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle & Demographics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle</label>
                      <select
                        value={lifestyle}
                        onChange={(e) => setLifestyle(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm cursor-pointer appearance-none"
                      >
                        <option value="">Any Lifestyle</option>
                        {lifestyleOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-2.5 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm cursor-pointer appearance-none"
                      >
                        <option value="">Any Occupation</option>
                        {occupationOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-2.5 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm cursor-pointer appearance-none"
                      >
                        <option value="">Any Age</option>
                        {ageGroups.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-2.5 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender Preference</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm cursor-pointer appearance-none"
                      >
                        <option value="">Any Gender</option>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-2.5 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {amenityOptions.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`flex items-center space-x-2 p-2 rounded-lg border text-sm transition-all ${
                            amenities.includes(amenity.id)
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSearch}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium"
              >
                <Search className="w-5 h-5" />
                <span>Find Properties & Roommates</span>
              </button>
            </div>
          </div>

          {/* Popular Locations */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-primary-100 mb-2 sm:mb-3 text-sm sm:text-base">Popular locations:</p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors text-xs sm:text-sm"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 text-center"
        >
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">65K+</div>
            <div className="text-primary-100 text-xs sm:text-sm lg:text-base">Verified Properties</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">9K+</div>
            <div className="text-primary-100 text-xs sm:text-sm lg:text-base">New Listings Daily</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">500+</div>
            <div className="text-primary-100 text-xs sm:text-sm lg:text-base">Cities Covered</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
