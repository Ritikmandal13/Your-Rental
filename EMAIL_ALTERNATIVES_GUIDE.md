# Email Service Alternatives - No Domain Required

## Option 1: Nodemailer with Gmail (Recommended - Free, No Domain Needed)

### Setup Steps:

1. **Install Dependencies** (Already done)
   ```bash
   npm install nodemailer @types/nodemailer
   ```

2. **Enable 2-Factor Authentication on Gmail**
   - Go to your Google Account settings
   - Security → 2-Step Verification
   - Enable it

3. **Create Gmail App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Rental Service" as the name
   - Copy the generated 16-character password

4. **Update `.env.local`**
   ```env
   # Disable Resend
   # RESEND_API_KEY=...
   # RESEND_FROM_EMAIL=...

   # Enable Nodemailer with Gmail
   USE_NODEMAILER=true
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   FROM_EMAIL=Your Rental Service <your-email@gmail.com>
   ```

5. **Restart your dev server**
   ```bash
   npm run dev
   ```

### Pros:
- ✅ Completely FREE
- ✅ No domain verification needed
- ✅ Easy setup
- ✅ Works immediately
- ✅ 500 emails/day limit (usually enough)

### Cons:
- ⚠️ Uses your personal Gmail (or create a dedicated Gmail for your app)
- ⚠️ 500 emails/day limit
- ⚠️ Less professional (shows your Gmail address)

---

## Option 2: EmailJS (Free Tier Available)

### Setup Steps:

1. **Sign up at EmailJS**
   - Go to: https://www.emailjs.com/
   - Create a free account (200 emails/month free)

2. **Create an Email Service**
   - Add your Gmail/Outlook as service
   - EmailJS will handle the sending

3. **Get your credentials**
   - Service ID
   - Template ID
   - Public Key

4. **Update code to use EmailJS**
   - This requires client-side implementation
   - Would need to restructure the email sending logic

### Pros:
- ✅ No domain verification
- ✅ Free tier available
- ✅ Easy to use

### Cons:
- ⚠️ Requires client-side implementation
- ⚠️ Limited to 200 emails/month on free tier
- ⚠️ Less secure (public keys exposed)

---

## Option 3: Mailgun Sandbox (For Testing Only)

### Setup Steps:

1. **Sign up at Mailgun**
   - Go to: https://www.mailgun.com/
   - Free tier: 100 emails/day for first 3 months

2. **Use Sandbox Domain**
   - Mailgun provides a sandbox domain
   - No verification needed
   - Limited to 5 authorized recipients

3. **Update `.env.local`**
   ```env
   USE_MAILGUN=true
   MAILGUN_API_KEY=your-api-key
   MAILGUN_DOMAIN=sandbox-xxxx.mailgun.org
   ```

### Pros:
- ✅ Professional email service
- ✅ No domain verification for sandbox
- ✅ Good deliverability

### Cons:
- ⚠️ Sandbox limited to 5 recipients
- ⚠️ Not suitable for production
- ⚠️ Need domain verification for production

---

## Option 4: Amazon SES (Requires AWS Account)

### Setup Steps:

1. **Create AWS Account**
2. **Enable SES in AWS Console**
3. **Verify Email Address (not domain)**
   - Can verify individual email addresses
   - No domain needed initially

4. **Get SMTP credentials**

### Pros:
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Scalable
- ✅ Professional

### Cons:
- ⚠️ Requires AWS account
- ⚠️ More complex setup
- ⚠️ Need to verify sender email

---

## Quick Switch Guide

### To Switch from Resend to Nodemailer:

1. Update `.env.local`:
   ```env
   USE_NODEMAILER=true
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   FROM_EMAIL=Your Rental Service <your-email@gmail.com>
   ```

2. Restart your server - that's it!

The code automatically detects which service to use based on your environment variables.

---

## Recommendation

For **quick setup without domain**: Use **Nodemailer with Gmail**
- Fastest to set up
- No domain needed
- Free
- Works immediately

For **production later**: Switch to **Resend with verified domain** or **Amazon SES**
- More professional
- Better deliverability
- Higher email limits

---

## Troubleshooting

### Gmail "Less secure app" error
- Solution: Use App Passwords (not regular password)
- Enable 2-Factor Authentication first

### Emails going to spam
- Normal for Gmail (they show your email address)
- For production, use a verified domain service

### Rate limiting
- Gmail: 500 emails/day
- EmailJS: 200 emails/month (free)
- Resend: Varies by plan

