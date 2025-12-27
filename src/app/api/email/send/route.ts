import { NextRequest, NextResponse } from 'next/server'

// Resend Email API
// API Key from MCP Hub: mcp_hub/resend_projects/printHub
// From Email: noreply@printhub.com

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text, type = 'notification' } = body

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      )
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@printhub.com'

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || generateDefaultHtml(subject, text || ''),
        text: text || subject,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      messageId: data.id,
      message: 'Email sent successfully',
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateDefaultHtml(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">PrintHub</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Professional Printing Services</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">${subject}</h2>
        <div style="color: #555; font-size: 16px;">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #888; font-size: 14px;">
        <p>© ${new Date().getFullYear()} PrintHub - printhub.ritambharat.software</p>
        <p>Professional Printing Services by Ritam Bharat</p>
      </div>
    </body>
    </html>
  `
}
