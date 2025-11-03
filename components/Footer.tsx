'use client'

import Link from 'next/link'
import { Home, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'For Partners', href: '/partners' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Contact Us', href: '/contact' },
  ],
  services: [
    { name: 'Buy Properties', href: '/buy' },
    { name: 'Rent Properties', href: '/rent' },
    { name: 'PG/Co-Living', href: '/pg' },
    { name: 'Apply for Home Loan', href: '/loans' },
    { name: 'EMI Calculator', href: '/emi-calculator' },
    { name: 'Property Value', href: '/property-value' },
  ],
  cities: [
    { name: 'Mumbai', href: '/mumbai' },
    { name: 'Delhi', href: '/delhi' },
    { name: 'Bangalore', href: '/bangalore' },
    { name: 'Hyderabad', href: '/hyderabad' },
    { name: 'Chennai', href: '/chennai' },
    { name: 'Pune', href: '/pune' },
  ],
  insights: [
    { name: 'Price Trends', href: '/price-trends' },
    { name: 'City Insights', href: '/city-insights' },
    { name: 'Housing Research', href: '/research' },
    { name: 'News & Articles', href: '/news' },
    { name: 'Buying Guide', href: '/buying-guide' },
    { name: 'Report a Fraud', href: '/report-fraud' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">Smart house: your rental services</span>
            </Link>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
              Your trusted partner in finding the perfect rental property. We connect you with verified properties and provide comprehensive rental services.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 text-sm sm:text-base">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm sm:text-base">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>support@yourrentalservice.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm sm:text-base">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Popular Cities</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.cities.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Insights Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Insights</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.insights.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
              Get notified of new properties and rental insights
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white text-sm sm:text-base"
              />
              <button className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-r-lg hover:bg-primary-700 transition-colors text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-0">
              © 2024 Smart house: your rental services. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



