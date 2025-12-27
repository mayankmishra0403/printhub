import { NextRequest, NextResponse } from 'next/server'

// Email Verification API
// Generates code and sends via Resend
// API Key from MCP Hub: mcp_hub/resend_projects/printHub

// Simple in-memory store for verification codes (use Redis/DB in production)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, action = 'send' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (action === 'send') {
      // Generate 6-digit verification code
      const code = Math.random().toString().slice(2, 8)
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

      // Store code
      verificationCodes.set(email, { code, expiresAt })

      // Send email via Resend
      const resendApiKey = process.env.RESEND_API_KEY
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@printhub.com'

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: 'Verify your email - PrintHub',
          html: generateVerificationHtml(code),
          text: `Your PrintHub verification code is: ${code}. This code expires in 10 minutes.`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Resend API error:', errorData)
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent',
        expiresIn: '10 minutes',
      })

    } else if (action === 'verify') {
      const { code } = body

      if (!code) {
        return NextResponse.json(
          { error: 'Verification code is required' },
          { status: 400 }
        )
      }

      const stored = verificationCodes.get(email)

      if (!stored) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new one.' },
          { status: 400 }
        )
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(email)
        return NextResponse.json(
          { error: 'Verification code expired. Please request a new one.' },
          { status: 400 }
        )
      }

      if (stored.code !== code) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        )
      }

      // Code is valid - remove from store
      verificationCodes.delete(email)

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Email verified successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "send" or "verify".' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateVerificationHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">PrintHub</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Email Verification</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #555; font-size: 16px;">Use the following code to verify your email address:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${code}</span>
        </div>
        <p style="color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #888; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #888; font-size: 14px;">
        <p>© ${new Date().getFullYear()} PrintHub - printhub.ritambharat.software</p>
      </div>
    </body>
    </html>
  `
}
