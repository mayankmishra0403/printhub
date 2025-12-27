import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Get current Auth0 user from cookies

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('auth0_user')
  const accessToken = cookieStore.get('auth0_access_token')

  if (!userCookie || !accessToken) {
    return NextResponse.json({ user: null, authenticated: false })
  }

  try {
    const user = JSON.parse(userCookie.value)
    return NextResponse.json({
      user,
      authenticated: true,
    })
  } catch (error) {
    return NextResponse.json({ user: null, authenticated: false })
  }
}
