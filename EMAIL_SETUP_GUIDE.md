# Email Setup Guide - Resend Domain Verification

## Why Domain Verification is Required

Resend requires you to verify a domain before sending emails to ensure email deliverability and prevent spam. This is a standard security practice for email services.

## Option 1: Verify Your Domain (Recommended for Production)

### Steps to Verify Your Domain in Resend:

1. **Sign in to Resend Dashboard**
   - Go to [https://resend.com](https://resend.com)
   - Sign in with your account

2. **Add a Domain**
   - Navigate to **Domains** in the left sidebar
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)
   - Click **Add**

3. **Add DNS Records**
   Resend will provide you with DNS records to add:
   - **SPF Record**: Authenticates your domain
   - **DKIM Records**: Sign your emails
   - **DMARC Record** (optional but recommended): Protects your domain

4. **Add Records to Your DNS Provider**
   - Log in to your domain registrar or DNS provider (e.g., GoDaddy, Namecheap, Cloudflare)
   - Go to DNS management
   - Add the TXT records provided by Resend
   - Wait for DNS propagation (usually 5-60 minutes)

5. **Verify Domain**
   - Return to Resend dashboard
   - Click **Verify** next to your domain
   - Once verified (green checkmark), you can use it!

6. **Update Your Environment Variable**
   Update `.env.local`:
   ```env
   RESEND_FROM_EMAIL=Your Rental Service <noreply@yourdomain.com>
   ```

## Option 2: Use Test Domain (Quick Setup for Development)

For development/testing purposes only:

1. **Keep using `onboarding@resend.dev`** in your `.env.local`:
   ```env
   RESEND_FROM_EMAIL=Your Rental Service <onboarding@resend.dev>
   ```

   **Note**: This might only work for sending emails to the email address associated with your Resend account.

## Option 3: Alternative Email Services

If domain verification is not feasible right now, you can switch to other email services:

### SendGrid
- Free tier: 100 emails/day
- Also requires domain verification for production

### Mailgun
- Free tier: 5,000 emails/month
- Also requires domain verification

### Amazon SES
- Very affordable
- Requires AWS account and domain verification

## Current Setup Status

Your current configuration:
- ✅ API Key: Configured
- ⚠️ Domain: Needs verification
- ✅ Email templates: Ready

## Quick Fix for Testing

If you just want to test the booking flow without emails:

1. The booking system will still work - emails just won't send
2. Check the browser console for any email errors (they won't break the booking)
3. The booking will be created successfully even if email fails

## Solution: Using Custom Domain on Vercel

### Step-by-Step for Vercel + Custom Domain:

1. **Get a Domain** (if you don't have one):
   - Buy from: Namecheap, GoDaddy, Google Domains, or Cloudflare (cheapest)
   - Cost: ~$10-15/year

2. **Add Custom Domain to Vercel**:
   - Go to your Vercel project dashboard
   - Settings → Domains
   - Add your custom domain (e.g., `yourdomain.com`)
   - Follow Vercel's DNS instructions (add A/CNAME records)

3. **Verify Domain in Resend**:
   - Follow Option 1 steps above using your custom domain
   - Add the DNS records Resend provides to your domain registrar

4. **Update Environment Variables in Vercel**:
   - Go to Vercel project → Settings → Environment Variables
   - Add:
     ```
     RESEND_API_KEY=your_api_key
     RESEND_FROM_EMAIL=Your Rental Service <noreply@yourdomain.com>
     NEXT_PUBLIC_APP_URL=https://yourdomain.com
     ```

5. **That's it!** Now emails will work with your custom domain.

### Alternative: Free Subdomain Services

If you don't want to buy a domain, you can use free subdomain services:
- **Freenom** (.tk, .ml, .ga domains - free but less reliable)
- **No-IP** (free dynamic DNS)
- **DuckDNS** (free subdomain)

Note: These may have limitations and may not be suitable for production.

## Production Checklist

Before going to production:
- [ ] Domain verified in Resend
- [ ] DNS records added and verified
- [ ] `RESEND_FROM_EMAIL` updated with your domain
- [ ] Test email sent successfully
- [ ] Email links point to production URL (`NEXT_PUBLIC_APP_URL`)

## Need Help?

- Resend Documentation: https://resend.com/docs
- Resend Support: Available in the dashboard
- Common Issues:
  - DNS not propagating? Wait longer or check DNS records are correct
  - Domain not verifying? Double-check all DNS records are added correctly
  - Still having issues? Contact Resend support

