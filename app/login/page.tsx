'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { LogIn, User, Building, ArrowLeft, Mail, Lock, UserPlus, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState<'user' | 'rent_provider'>('user')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message || 'Failed to sign in')
        } else {
          toast.success('Welcome back! Redirecting...', {
            duration: 2000,
            icon: '🎉',
          })
          // Redirect based on userType (the role they selected during signup)
          // Since we can't access profile immediately, we'll redirect to home
          // and home will redirect providers to their dashboard
          router.push('/')
        }
      } else {
        if (!fullName) {
          toast.error('Please enter your full name', {
            icon: '⚠️',
          })
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, fullName, userType)
        if (error) {
          // Show more detailed error message
          const errorMessage = error.message || 'Failed to sign up'
          console.error('Signup error:', error)
          toast.error(errorMessage, {
            icon: '❌',
            duration: 5000,
          })
        } else {
          toast.success(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Account Created Successfully! 🎉</p>
                  <p className="text-sm text-gray-600 mt-1">
                    A verification email has been sent to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                </div>
              </div>
            ),
            {
              duration: 8000,
              style: {
                padding: '16px',
                background: '#fff',
                borderLeft: '4px solid #10B981',
              },
            }
          )
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred', {
        icon: '❌',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        {/* Floating shapes */}
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-all hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </motion.div>

          {/* Main Card with glow effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-3xl blur-lg opacity-30"></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-12 text-center relative overflow-hidden">
                {/* Decorative elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-40 h-40 bg-primary-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-0 right-0 w-52 h-52 bg-primary-500/20 rounded-full translate-x-1/3 translate-y-1/3"
                />
                
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mb-4 shadow-2xl border border-white/30"
                  >
                    {isLogin ? (
                      <LogIn className="w-12 h-12 text-white" />
                    ) : (
                      <UserPlus className="w-12 h-12 text-white" />
                    )}
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-white mb-3"
                  >
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-primary-100 text-lg"
                  >
                    {isLogin ? 'Sign in to continue your journey' : 'Join us and find your perfect home'}
                  </motion.p>
                </div>
              </div>

              {/* Form */}
              <div className="px-8 py-8">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I want to...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setUserType('user')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                          userType === 'user'
                            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100/50 text-primary-700 shadow-md'
                            : 'border-gray-200 hover:border-primary-300 bg-gray-50 hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                        }`}
                      >
                        {userType === 'user' && (
                          <div className="absolute inset-0 bg-primary-500/5"></div>
                        )}
                        <User className={`w-7 h-7 mb-2 relative ${userType === 'user' ? 'text-primary-600' : 'text-gray-600'}`} />
                        <span className="font-semibold text-sm relative">Find Property</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setUserType('rent_provider')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all relative overflow-hidden group ${
                          userType === 'rent_provider'
                            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100/50 text-primary-700 shadow-md'
                            : 'border-gray-200 hover:border-primary-300 bg-gray-50 hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                        }`}
                      >
                        {userType === 'rent_provider' && (
                          <div className="absolute inset-0 bg-primary-500/5"></div>
                        )}
                        <Building className={`w-7 h-7 mb-2 relative ${userType === 'rent_provider' ? 'text-primary-600' : 'text-gray-600'}`} />
                        <span className="font-semibold text-sm relative">List Property</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 transition-colors group-focus-within:text-primary-500" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-primary-300 bg-gray-50 focus:bg-white text-gray-900"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isLogin ? 0 : 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 transition-colors group-focus-within:text-primary-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-primary-300 bg-gray-50 focus:bg-white text-gray-900"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isLogin ? 0.1 : 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 transition-colors group-focus-within:text-primary-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-primary-300 bg-gray-50 focus:bg-white text-gray-900"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                    </div>
                  </motion.div>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="text-xs text-gray-500">
                      By signing up, you agree to our{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="relative w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl overflow-hidden group"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {loading ? (
                      <span className="flex items-center justify-center relative z-10">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Please wait...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center">
                        {isLogin ? (
                          <>
                            Sign In
                            <motion.span
                              initial={{ x: -5, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="ml-2"
                            >
                              →
                            </motion.span>
                          </>
                        ) : (
                          <>
                            Create Account
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                              className="ml-2"
                            >
                              ✨
                            </motion.span>
                          </>
                        )}
                      </span>
                    )}
                  </motion.button>
                </form>

                {/* Toggle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-center"
                >
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setEmail('')
                        setPassword('')
                        setFullName('')
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

