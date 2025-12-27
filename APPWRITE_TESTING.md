# 🧪 Quick Testing Guide - Auth0 Functions

**Time:** 5 minutes | **After:** Deployment complete

---

## 📍 Function URLs

After deployment, you'll have these URLs in Appwrite Console:

```bash
export LOGIN_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-login"
export SIGNUP_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-signup"
export RESET_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset"
export PROFILE_URL="https://fra.cloud.appwrite.io/v1/functions/auth0-profile"
```

---

## ✅ Test 1: Generate Login URL

**Purpose:** Test OAuth authorization URL generation

```bash
curl -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "test-state-123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://login.ritambharat.software/authorize?client_id=...",
  "state": "test-state-123"
}
```

✅ **If you see this:** Function is working! 🎉

---

## ✅ Test 2: Create User (Signup)

**Purpose:** Test user registration

```bash
curl -X POST "$SIGNUP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "userId": "auth0|...",
    "email": "testuser@example.com",
    "emailVerified": false,
    "createdAt": "2024-12-27T..."
  },
  "message": "User created successfully"
}
```

✅ **If you see this:** Signup is working! 🎉

---

## ✅ Test 3: Get User Profile

**Purpose:** Test profile retrieval

```bash
# Using userId
curl -X GET "$PROFILE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "auth0|65a4f3c8d..."
  }'

# Or using email
curl -X GET "$PROFILE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "user_id": "auth0|...",
    "email": "testuser@example.com",
    "email_verified": false,
    "user_metadata": {
      "firstName": "Test",
      "lastName": "User"
    },
    "created_at": "2024-12-27T..."
  }
}
```

✅ **If you see this:** Profile retrieval is working! 🎉

---

## ✅ Test 4: Update Profile

**Purpose:** Test profile update

```bash
curl -X PATCH "$PROFILE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "auth0|65a4f3c8d...",
    "updates": {
      "user_metadata": {
        "firstName": "Updated",
        "lastName": "Name",
        "phoneNumber": "+1234567890"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "user_id": "auth0|...",
    "email": "testuser@example.com",
    "user_metadata": {
      "firstName": "Updated",
      "lastName": "Name",
      "phoneNumber": "+1234567890"
    }
  },
  "message": "User updated successfully"
}
```

✅ **If you see this:** Profile update is working! 🎉

---

## ✅ Test 5: Send Password Reset

**Purpose:** Test password reset email

```bash
curl -X POST "$RESET_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "email": "testuser@example.com"
}
```

✅ **If you see this:** Password reset is working! 🎉

---

## ✅ Test 6: Complete OAuth Flow

**Purpose:** Test full authorization code exchange

```bash
# Step 1: Get auth URL
curl -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"state": "oauth-test"}'

# Copy the authorizationUrl from response and open in browser
# After Auth0 login, you'll get redirected with a code

# Step 2: Exchange code for token
curl -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "YOUR_OAUTH_CODE_HERE",
    "state": "oauth-test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "idToken": "eyJhbGc...",
  "refreshToken": "...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

✅ **If you see this:** Complete OAuth flow is working! 🎉

---

## ❌ Troubleshooting

### Error: "Auth0 config not found"
- Verify document `printHub` exists in `mcp_hub/auth0_projects`
- Check Auth0 credentials are saved in the document

### Error: "Appwrite API Key invalid"
- Go to Appwrite Console → Settings → API Keys
- Copy the correct key
- Update function settings with new key

### Error: "CORS error"
- This is expected - functions need CORS headers
- The frontend integration guide handles this

### Error: "Email already exists"
- The user was already created
- Try with a different email

### Error: "Unauthorized"
- Check environment variables are set in function settings
- Verify Appwrite credentials in database document

---

## 📊 All Tests Summary

| Test | Function | Status |
|------|----------|--------|
| Generate Login URL | auth0-login | ✅ |
| Create User | auth0-signup | ✅ |
| Get Profile | auth0-profile | ✅ |
| Update Profile | auth0-profile | ✅ |
| Password Reset | auth0-password-reset | ✅ |
| OAuth Flow | auth0-login | ✅ |

---

## 🎯 Next Steps

✅ All functions tested and working?

**Option 1: Integrate with Frontend**
- See: `APPWRITE_INTEGRATE.md`
- Copy API routes to PrintHub

**Option 2: Deep Dive Testing**
- See: `/tmp/mcp-tools/appwrite/auth0/TESTING.md`
- More advanced test cases

---

**Status:** ✅ Ready to Test  
**Updated:** Dec 27, 2024
