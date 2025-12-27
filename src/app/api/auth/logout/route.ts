import { NextRequest, NextResponse } from 'next/server'

// Auth0 Logout - Clear cookies and redirect to Auth0 logout
// Domain: login.ritambharat.software

export async function GET(request: NextRequest) {
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Create response that clears auth cookies
  const response = NextResponse.redirect(
    `https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(appUrl!)}`
  )

  // Clear all auth cookies
  response.cookies.delete('auth0_access_token')
  response.cookies.delete('auth0_refresh_token')
  response.cookies.delete('auth0_user')

  return response
}
