import { NextRequest, NextResponse } from 'next/server'

async function sendWithNodemailer(to: string, subject: string, html: string, from: string) {
  const nodemailer = await import('nodemailer')
  
  // Create transporter with Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  })

  const mailOptions = {
    from: from || process.env.GMAIL_USER || 'your-rental-service@gmail.com',
    to: to,
    subject: subject,
    html: html,
  }

  const info = await transporter.sendMail(mailOptions)
  return { success: true, data: info }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env.local file' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.FROM_EMAIL || `Smart house: your rental services <${process.env.GMAIL_USER}>`
    const result = await sendWithNodemailer(to, subject, html, fromEmail)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', message: error.message },
      { status: 500 }
    )
  }
}
