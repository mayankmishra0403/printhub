import { NextRequest, NextResponse } from 'next/server'

// Auth0 Login - Redirect to Auth0 authorization page
// Domain: login.ritambharat.software

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const returnTo = searchParams.get('returnTo') || '/services'

  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const callbackUrl = process.env.AUTH0_CALLBACK_URL
  const audience = process.env.AUTH0_AUDIENCE

  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({ returnTo, timestamp: Date.now() })).toString('base64')

  const authUrl = new URL(`https://${auth0Domain}/authorize`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('redirect_uri', callbackUrl!)
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', state)
  
  if (audience) {
    authUrl.searchParams.set('audience', audience)
  }

  return NextResponse.redirect(authUrl.toString())
}
