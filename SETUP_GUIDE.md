# Supabase Setup Guide

## ✅ What's Already Implemented

1. **Authentication System** - Full login/signup with user roles (User and Rent Provider)
2. **UI Components** - Beautiful login/signup pages matching your website theme
3. **Auth Context** - Global authentication state management
4. **Header Integration** - User profile dropdown and role-based navigation
5. **Dashboard** - Property listing dashboard for Rent Providers

## ⚠️ What You Need to Do

~~**GOOD NEWS:** The database schema migration has already been applied automatically!~~ ✅

All required tables have been created with proper security settings. You just need to:

### Step 1: Disable Email Verification (for testing)

For easier testing during development:

1. Go to **Authentication** > **Settings** in Supabase dashboard
2. Scroll to **Email Auth** section
3. **DISABLE** "Enable email confirmations"
4. Click **Save**

⚠️ **Important:** Re-enable this in production!

### Step 2: Test Authentication

1. Visit http://localhost:3000/login
2. Click "Sign Up" to create an account
3. You should see two options:
   - **Find Property** (User role) 
   - **List Property** (Rent Provider role)
4. Select one and complete signup
5. Verify you can log in with your credentials
6. Check that you see your name in the header dropdown

## 🎯 Features Available After Setup

### For Regular Users:
- ✅ Sign up and log in
- ✅ Browse properties
- ✅ Save favorite properties (to be implemented)
- ✅ Book properties (to be implemented)
- ✅ Leave reviews (to be implemented)

### For Rent Providers:
- ✅ Sign up and log in with Rent Provider role
- ✅ Access dashboard at `/dashboard/properties`
- ✅ View all their properties
- ✅ See property statistics
- ✅ Add/Edit/Delete properties (to be implemented)
- ✅ Manage bookings (to be implemented)

## 📝 Next Steps to Complete

1. **Add Property Form** - Allow Rent Providers to create new listings
2. **Edit Property Form** - Allow Rent Providers to update their listings
3. **Booking System** - Allow Users to book properties
4. **Review System** - Allow Users to review properties they've booked
5. **Profile Page** - Allow users to edit their profiles

## 🐛 Troubleshooting

### "Error fetching profile" in console
- Make sure the `profiles` table exists in Supabase
- Check that Row Level Security is enabled

### "Access denied" when visiting dashboard
- Make sure you signed up as a Rent Provider
- Check your profile has `role = 'rent_provider'` in the `profiles` table

### Can't sign up
- Make sure email confirmation is disabled in Supabase (for development)
- Or check your email for verification link
- Go to: Auth > Settings > Email Auth

## 🔒 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only update their own profiles
- Rent Providers can only see/manage their own properties
- Users can only create reviews for properties they've booked

