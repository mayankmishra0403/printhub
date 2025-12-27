# 🔗 Appwrite Integration with PrintHub

**Time:** 5 minutes | **After:** Functions deployed & tested

---

## 📋 What We'll Do

Add Appwrite Auth0 functions to your PrintHub frontend.

**Files to Create:**
- 5 API routes in `src/app/api/auth/`
- 1 Auth context in `src/contexts/`
- 2 UI components in `src/components/auth/`

---

## 🔑 Environment Setup

**1. Update `.env.local`**

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=694ffb380028abb32fd2

# Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=login.ritambharat.software
NEXT_PUBLIC_AUTH0_CLIENT_ID=JqvWx2irDcCaWHYXr3bJcH0JpJBokKax
NEXT_PUBLIC_APPWRITE_LOGIN_FUNCTION=https://fra.cloud.appwrite.io/v1/functions/auth0-login
NEXT_PUBLIC_APPWRITE_SIGNUP_FUNCTION=https://fra.cloud.appwrite.io/v1/functions/auth0-signup
NEXT_PUBLIC_APPWRITE_PROFILE_FUNCTION=https://fra.cloud.appwrite.io/v1/functions/auth0-profile
NEXT_PUBLIC_APPWRITE_RESET_FUNCTION=https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset

# Redirect
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

---

## 📁 Step 1: Create API Routes

### Route 1️⃣: `/src/app/api/auth/init.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const state = Math.random().toString(36).substring(7);
    const loginFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_LOGIN_FUNCTION;

    // Call Appwrite login function to get Auth URL
    const response = await fetch(loginFuncUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: state,
      }),
    });

    const data = await response.json();

    if (data.success && data.authorizationUrl) {
      // Store state in cookie for verification
      const responseData = NextResponse.redirect(data.authorizationUrl);
      responseData.cookies.set('auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
      });
      return responseData;
    } else {
      return NextResponse.json(
        { error: 'Failed to generate auth URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Route 2️⃣: `/src/app/api/auth/callback.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const cookies = request.cookies;
    const storedState = cookies.get('auth_state')?.value;

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code' },
        { status: 400 }
      );
    }

    if (state !== storedState) {
      return NextResponse.json(
        { error: 'State mismatch - possible CSRF attack' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const loginFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_LOGIN_FUNCTION;
    const response = await fetch(loginFuncUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        state: state,
      }),
    });

    const data = await response.json();

    if (data.success && data.accessToken) {
      // Create response with redirect to dashboard
      const responseData = NextResponse.redirect(
        new URL('/dashboard', request.url)
      );

      // Store tokens in httpOnly cookies
      responseData.cookies.set('access_token', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: data.expiresIn || 86400,
      });

      if (data.refreshToken) {
        responseData.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

      if (data.idToken) {
        responseData.cookies.set('id_token', data.idToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.expiresIn || 86400,
        });
      }

      // Clear state cookie
      responseData.cookies.delete('auth_state');

      return responseData;
    } else {
      return NextResponse.json(
        { error: 'Token exchange failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Route 3️⃣: `/src/app/api/auth/signup.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const signupFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_SIGNUP_FUNCTION;

    const response = await fetch(signupFuncUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        user: data.user,
        message: 'User created successfully',
      });
    } else {
      return NextResponse.json(
        { error: data.error || 'Signup failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Route 4️⃣: `/src/app/api/auth/profile.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email required' },
        { status: 400 }
      );
    }

    const profileFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_FUNCTION;

    const response = await fetch(profileFuncUrl!, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId || undefined,
        email: email || undefined,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        user: data.user,
      });
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to get profile' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'userId and updates required' },
        { status: 400 }
      );
    }

    const profileFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_FUNCTION;

    const response = await fetch(profileFuncUrl!, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        updates,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        user: data.user,
        message: 'Profile updated successfully',
      });
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to update profile' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Route 5️⃣: `/src/app/api/auth/reset-password.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const resetFuncUrl = process.env.NEXT_PUBLIC_APPWRITE_RESET_FUNCTION;

    const response = await fetch(resetFuncUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent',
      });
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to send reset email' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📦 Step 2: Create Auth Context

### File: `/src/contexts/auth-context.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  getProfile: (userId?: string, email?: string) => Promise<User | null>;
  updateProfile: (userId: string, updates: Record<string, any>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    window.location.href = '/api/auth/init';
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    window.location.href = '/';
  };

  const signup = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || '',
          lastName: lastName || '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser({
          userId: data.user.userId,
          email: data.user.email,
          firstName: firstName || '',
          lastName: lastName || '',
          emailVerified: data.user.emailVerified,
          createdAt: data.user.createdAt,
        });
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error(data.error || 'Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (userId?: string, email?: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined,
          email: email || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.user as User;
      } else {
        throw new Error(data.error || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  const updateProfile = async (userId: string, updates: Record<string, any>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates,
        }),
      });

      const data = await response.json();

      if (data.success && user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = () => {
    return accessToken || localStorage.getItem('access_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        accessToken,
        login,
        logout,
        signup,
        getProfile,
        updateProfile,
        resetPassword,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 🎨 Step 3: Create UI Components

### Component 1️⃣: `/src/components/auth/LoginButton.tsx`

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const { login } = useAuth();

  return (
    <Button onClick={login} variant="default">
      Login with Auth0
    </Button>
  );
}
```

### Component 2️⃣: `/src/components/auth/SignupForm.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SignupForm() {
  const { signup, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signup(email, password, firstName, lastName);
      // Redirect on success
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
```

---

## 🔧 Step 4: Update App Layout

### File: `/src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintHub',
  description: 'Your print management solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 📝 Step 5: Usage Examples

### Example 1: Login Button

```tsx
import { LoginButton } from '@/components/auth/LoginButton';

export function Header() {
  return (
    <header>
      <LoginButton />
    </header>
  );
}
```

### Example 2: Signup Form

```tsx
import { SignupForm } from '@/components/auth/SignupForm';

export function SignupPage() {
  return (
    <div>
      <h1>Create Account</h1>
      <SignupForm />
    </div>
  );
}
```

### Example 3: Protected Page

```tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## ✅ Verification Checklist

- [ ] `.env.local` updated with all variables
- [ ] 5 API routes created in `src/app/api/auth/`
- [ ] Auth context created in `src/contexts/auth-context.tsx`
- [ ] 2 UI components created in `src/components/auth/`
- [ ] App layout updated with AuthProvider
- [ ] Next.js server restarted
- [ ] Can access `/api/auth/init` for login
- [ ] Can create account via SignupForm
- [ ] Tokens stored in localStorage

---

## 🎯 Testing Integration

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000
# 3. Click Login button
# 4. You should see Auth0 login screen
# 5. Or test signup form
```

---

## 🆘 Troubleshooting

**"Can't find module" error?**
- Check file paths are correct
- Run `npm install` if needed

**"CORS error"?**
- This is normal - browser to function call
- API routes handle it properly

**"Tokens not saving"?**
- Check localStorage in browser DevTools
- Verify auth routes are being called

**"Redirect not working"?**
- Check `NEXT_PUBLIC_REDIRECT_URI` in `.env.local`
- Match your actual localhost/domain

---

**Status:** ✅ Ready to Integrate  
**Updated:** Dec 27, 2024
