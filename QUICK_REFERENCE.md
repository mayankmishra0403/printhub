# ⚡ Quick Reference Card

## 🔑 Environment Variables

```env
# Copy-paste into .env.local

APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=694ffb380028abb32fd2
APPWRITE_API_KEY=[GET-FROM-APPWRITE-CONSOLE]

REDIRECT_URI=http://localhost:3000/api/auth/callback
NODE_ENV=development
```

---

## 📍 Function URLs (After Deployment)

```
Login:           https://fra.cloud.appwrite.io/v1/functions/auth0-login
Signup:          https://fra.cloud.appwrite.io/v1/functions/auth0-signup
Password Reset:  https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset
Profile:         https://fra.cloud.appwrite.io/v1/functions/auth0-profile
```

---

## 📁 Files to Create

### API Routes (5 files in `src/app/api/auth/`)
```
src/app/api/auth/
├── init.ts              (Generate Auth URL)
├── callback.ts          (OAuth callback)
├── signup.ts            (User registration)
├── profile.ts           (Get/Update profile)
└── reset-password.ts    (Password reset)
```

### Components (2 files in `src/components/auth/`)
```
src/components/auth/
├── LoginButton.tsx      (Login button component)
└── SignupForm.tsx       (Signup form component)
```

### Context (1 file in `src/contexts/`)
```
src/contexts/
└── auth-context.tsx     (Auth context & hooks)
```

---

## 🧪 Test Commands

```bash
# Set function URL
export LOGIN_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-login"
export SIGNUP_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-signup"
export RESET_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset"
export PROFILE_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-profile"

# Test 1: Get login URL
curl -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"state": "test"}'

# Test 2: Create user
curl -X POST "$SIGNUP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test"
  }'

# Test 3: Get profile
curl -X GET "$PROFILE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test 4: Update profile
curl -X PATCH "$PROFILE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "auth0|...",
    "updates": {"user_metadata": {"firstName": "Updated"}}
  }'

# Test 5: Password reset
curl -X POST "$RESET_URL" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 🎨 Component Usage

```tsx
// In your page
import { LoginButton } from '@/components/auth/LoginButton';
import { SignupForm } from '@/components/auth/SignupForm';

export default function LoginPage() {
  return (
    <div>
      <LoginButton />
      {/* or */}
      <SignupForm />
    </div>
  );
}

// Access auth in component
'use client';
import { useAuth } from '@/contexts/auth-context';

export function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

---

## ✅ Deployment Checklist

### Step 1: Deploy Functions
- [ ] Go to Appwrite Console
- [ ] Create `auth0-login` function
- [ ] Create `auth0-signup` function
- [ ] Create `auth0-password-reset` function
- [ ] Create `auth0-profile` function
- [ ] Set env vars for all 4
- [ ] All show "Deployed" status

### Step 2: Test Functions
- [ ] Test 1: Generate login URL ✅
- [ ] Test 2: Create user ✅
- [ ] Test 3: Get profile ✅
- [ ] Test 4: Update profile ✅
- [ ] Test 5: Password reset ✅
- [ ] Test 6: Full OAuth flow ✅

### Step 3: Integrate with PrintHub
- [ ] Create 5 API routes
- [ ] Create Auth context
- [ ] Create 2 UI components
- [ ] Update app layout
- [ ] Update .env.local
- [ ] Test with `npm run dev`

---

## 🔗 Important URLs

```
Appwrite Console:  https://cloud.appwrite.io
Project ID:        694ffb380028abb32fd2
Database:          mcp_hub
Collection:        auth0_projects
Document:          printHub
```

---

## 📚 Documentation Files

```
NEXT_STEPS.md          ← Overview (you are here)
APPWRITE_DEPLOY.md     ← Detailed deployment guide
APPWRITE_TESTING.md    ← Test cases & curl commands
APPWRITE_INTEGRATE.md  ← Complete integration code
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "API Key invalid" | Get from Appwrite Console → Settings → API Keys |
| "CORS error" | Normal, API routes handle it |
| "Tokens not saving" | Check localStorage in DevTools |
| "Function timeout" | Check network tab in DevTools |
| "User already exists" | Try with different email |
| "Unauthorized" | Verify env vars in function settings |

---

## 📞 Need Help?

1. Check the troubleshooting sections in:
   - APPWRITE_DEPLOY.md
   - APPWRITE_TESTING.md
   - APPWRITE_INTEGRATE.md

2. Verify environment variables

3. Check Appwrite Console logs

4. Test with curl before integrating

---

## 🎯 Timeline

| Step | File | Time |
|------|------|------|
| Deploy | APPWRITE_DEPLOY.md | 5 min |
| Test | APPWRITE_TESTING.md | 5 min |
| Integrate | APPWRITE_INTEGRATE.md | 5 min |
| **TOTAL** | | **15 min** |

---

**Status:** ✅ Ready to Deploy  
**Updated:** Dec 27, 2024
