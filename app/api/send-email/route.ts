import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, type } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Your Rental Service <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      
      // Check if it's a domain verification error
      if (error.message?.toLowerCase().includes('domain') || 
          error.message?.toLowerCase().includes('verify') ||
          error.message?.toLowerCase().includes('from')) {
        console.warn('Domain verification required. Email not sent but booking was successful.')
        // Return success even if email fails (optional: you can change this behavior)
        return NextResponse.json({ 
          success: true, 
          warning: 'Email not sent - domain verification required. Please verify your domain in Resend dashboard.',
          details: error.message 
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

