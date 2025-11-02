'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Bell, Loader2, Check, CheckCheck, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to view notifications')
      router.push('/login')
      return
    }

    if (user) {
      fetchNotifications()
    }
  }, [user, authLoading, router])

  const fetchNotifications = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      fetchNotifications()
    } catch (error: any) {
      console.error('Error:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
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
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-3">
                  <Bell className="w-6 h-6 text-primary-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  Stay updated with your property activity
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="mb-6 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 sm:p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You're all caught up! We'll notify you when there's new activity on your properties.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {notification.link ? (
                  <Link href={notification.link}>
                    <div
                      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all ${
                        !notification.is_read ? 'border-l-4 border-primary-600' : ''
                      }`}
                    >
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="float-right ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className={`text-lg font-semibold mb-2 ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(notification.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`bg-white rounded-xl shadow-lg p-6 ${
                      !notification.is_read ? 'border-l-4 border-primary-600' : ''
                    }`}
                  >
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="float-right ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <h3 className={`text-lg font-semibold mb-2 ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(notification.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

