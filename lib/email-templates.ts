export function getBookingNotificationEmailForProvider(data: {
  propertyTitle: string
  propertyLocation: string
  userName: string
  userEmail: string
  startDate: string
  endDate: string
  totalAmount: number
  message?: string | null
  appUrl?: string
}) {
  const { propertyTitle, propertyLocation, userName, userEmail, startDate, endDate, totalAmount, message, appUrl } = data
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalAmount)

  return {
    subject: `New Booking Request for ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Booking Request</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              You have received a new booking request for your property.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Property Details</h2>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Location:</strong> ${propertyLocation}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Guest Information</h2>
              <p><strong>Name:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Booking Details</h2>
              <p><strong>Check-in Date:</strong> ${formattedStartDate}</p>
              <p><strong>Check-out Date:</strong> ${formattedEndDate}</p>
              <p><strong>Total Amount:</strong> <span style="font-size: 20px; color: #667eea; font-weight: bold;">${formattedAmount}</span></p>
            </div>
            
            ${message ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Message from Guest</h2>
              <p style="font-style: italic;">${message}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard/bookings" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Booking Details
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Please log in to your dashboard to accept or reject this booking request.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Best regards,<br>
              Smart house: your rental services Team
            </p>
          </div>
        </body>
      </html>
    `
  }
}

export function getBookingConfirmationEmailForUser(data: {
  propertyTitle: string
  propertyLocation: string
  providerName: string
  startDate: string
  endDate: string
  totalAmount: number
  appUrl?: string
}) {
  const { propertyTitle, propertyLocation, providerName, startDate, endDate, totalAmount, appUrl } = data
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalAmount)

  return {
    subject: `Booking Confirmed: ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Booking Confirmed!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your booking request has been confirmed by the rental provider.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #10b981; margin-top: 0;">Property Details</h2>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Location:</strong> ${propertyLocation}</p>
              <p><strong>Property Owner:</strong> ${providerName}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #10b981; margin-top: 0;">Booking Details</h2>
              <p><strong>Check-in Date:</strong> ${formattedStartDate}</p>
              <p><strong>Check-out Date:</strong> ${formattedEndDate}</p>
              <p><strong>Total Amount:</strong> <span style="font-size: 20px; color: #10b981; font-weight: bold;">${formattedAmount}</span></p>
            </div>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-weight: bold; color: #059669;">
                ✨ Your booking is confirmed! We're excited to host you.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/bookings" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View My Bookings
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions or need to make changes to your booking, please contact the property owner or our support team.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              We look forward to serving you!<br>
              <strong>Smart house: your rental services Team</strong>
            </p>
          </div>
        </body>
      </html>
    `
  }
}

