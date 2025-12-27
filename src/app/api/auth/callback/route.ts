import { NextRequest, NextResponse } from 'next/server'

// Auth0 Callback Handler
// Domain: login.ritambharat.software
// Callback URL: https://printhub.ritambharat.software/api/auth/callback

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle Auth0 errors
  if (error) {
    console.error('Auth0 Error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: process.env.AUTH0_CALLBACK_URL,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/login?error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info from Auth0
    const userInfoResponse = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info')
      return NextResponse.redirect(
        new URL('/login?error=userinfo_failed', process.env.NEXT_PUBLIC_APP_URL)
      )
    }

    const userInfo = await userInfoResponse.json()

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(
      new URL('/services', process.env.NEXT_PUBLIC_APP_URL)
    )

    // Store tokens in secure HTTP-only cookies
    response.cookies.set('auth0_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 86400,
      path: '/',
    })

    if (tokens.refresh_token) {
      response.cookies.set('auth0_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    }

    // Store user info in a non-httpOnly cookie for client access
    response.cookies.set('auth0_user', JSON.stringify({
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 86400,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=callback_error', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
