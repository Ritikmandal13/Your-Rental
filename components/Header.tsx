'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Menu, X, User, Heart, Bell, Home, Building, MapPin, LogOut, Settings, Package, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/properties?location=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/properties')
    }
    setSearchQuery('')
  }

  const navigation = [
    { name: 'Rent', href: '/properties', icon: Building },
  ]

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Smart house: your rental services</span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">Smart house</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-6">
            <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                  placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            </form>
          </div>

          {/* Search Icon Button for Smaller Screens */}
          <button
            onClick={() => router.push('/properties')}
            className="hidden md:flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Search className="w-5 h-5" />
            </button>
            
          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Quick Links - Icons Only */}
                {profile?.role === 'rent_provider' && (
                  <>
                    <Link href="/dashboard/properties">
                      <button className="hidden xl:flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" title="My Properties">
                        <Package className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link href="/dashboard/bookings">
                      <button className="hidden xl:flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" title="Bookings">
                        <Calendar className="w-5 h-5" />
                      </button>
                    </Link>
                  </>
                )}
                {profile?.role === 'user' && (
                  <Link href="/bookings">
                    <button className="hidden xl:flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" title="My Bookings">
                      <Calendar className="w-5 h-5" />
                    </button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="hidden md:flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{profile?.full_name || 'Profile'}</span>
            </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                      >
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                            {profile?.role === 'rent_provider' ? 'Provider' : 'User'}
                          </span>
                        </div>
                        {profile?.role === 'rent_provider' ? (
                          <>
                            <Link href="/dashboard/properties" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Package className="w-4 h-4 mr-2" />
                              My Properties
                            </Link>
                            <Link href="/dashboard/bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Calendar className="w-4 h-4 mr-2" />
                              Bookings
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href="/bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Calendar className="w-4 h-4 mr-2" />
                              My Bookings
                            </Link>
                            <Link href="/favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Heart className="w-4 h-4 mr-2" />
                              Saved Properties
                            </Link>
                          </>
                        )}
                        <Link href="/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications
                        </Link>
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </Link>
                        <div className="border-t border-gray-200 mt-1 pt-1">
                          <button 
                            onClick={signOut}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/login">
            <button className="hidden md:flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
            </button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user ? (
                  <>
                    {profile?.role === 'rent_provider' && (
                      <>
                        <Link href="/dashboard/properties" onClick={() => setIsMenuOpen(false)}>
                          <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                            <Package className="w-5 h-5" />
                            <span>My Properties</span>
                          </button>
                        </Link>
                        <Link href="/dashboard/bookings" onClick={() => setIsMenuOpen(false)}>
                          <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                            <Calendar className="w-5 h-5" />
                            <span>Bookings</span>
                          </button>
                        </Link>
                      </>
                    )}
                    {profile?.role === 'user' && (
                      <>
                        <Link href="/bookings" onClick={() => setIsMenuOpen(false)}>
                          <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                            <Calendar className="w-5 h-5" />
                            <span>My Bookings</span>
                          </button>
                        </Link>
                        <Link href="/favorites" onClick={() => setIsMenuOpen(false)}>
                <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                  <Heart className="w-5 h-5" />
                  <span>Saved Properties</span>
                </button>
                        </Link>
                      </>
                    )}
                    <Link href="/notifications" onClick={() => setIsMenuOpen(false)}>
                <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <button className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 py-2 w-full">
                        <Settings className="w-5 h-5" />
                        <span>Profile Settings</span>
                      </button>
                    </Link>
                    <button 
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                      className="flex items-center space-x-3 text-red-600 hover:text-red-700 py-2 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="flex items-center space-x-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}



