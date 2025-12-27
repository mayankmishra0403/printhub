# 🚀 Appwrite Function Deployment Guide

## Auth0 Login Function - Step by Step

### Method 1: Web Console (Easiest) ✅

1. **Open Appwrite Console**
   - Go to: https://cloud.appwrite.io/console
   - Project: `694ffb380028abb32fd2`

2. **Navigate to Functions**
   - Left sidebar → Functions
   - Select: `auth0-login`

3. **Upload Code**
   - Click "Code" tab
   - Delete placeholder code
   - Copy entire content from `appwrite-functions/auth0-login.js`
   - Paste into editor

4. **Add Dependencies**
   - Click "Settings" tab
   - Add `node-appwrite` to dependencies
   - Version: `^13.0.0`

5. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete
   - Status should change to "✅ Deployed"

---

### Method 2: CLI (If Installed)

```bash
cd appwrite-functions

appwrite client --project-id="694ffb380028abb32fd2"

appwrite functions create-deployment \
    --function-id=auth0-login \
    --code="." \
    --activate
```

---

### Function Details

```
📋 Function Configuration:
├── ID: auth0-login
├── Runtime: Node.js 18.0
├── Entrypoint: auth0-login.js
├── Execution: Any (Public)
└── Status: Ready for deployment

🔗 HTTP Endpoint:
POST https://fra.cloud.appwrite.io/v1/functions/auth0-login/executions

📨 Request Body:
{
  "email": "user@example.com",
  "password": "yourpassword"
}

✅ Success Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

---

## Files Location

```
appwrite-functions/
├── auth0-login.js              ← Main function code
├── auth0-login-package.json    ← Dependencies
└── deployment-guide.md         ← This file
```

---

## Database Configuration

Function automatically reads from:
- **Database**: `mcp_hub`
- **Collection**: `auth0_projects`
- **Document**: `printHub`

Credentials stored:
- ✅ Auth0 Domain
- ✅ Client ID
- ✅ Client Secret
- ✅ Management API Endpoint

---

## Next Steps

1. ✅ Deploy `auth0-login` function
2. 📝 Create `auth0-signup` function
3. 🔑 Create `auth0-manage-users` function
4. 📧 Set up Resend email functions
5. 💳 Set up Stripe payment functions (later)

---

## Testing

After deployment, test using curl:

```bash
curl -X POST https://fra.cloud.appwrite.io/v1/functions/auth0-login/executions \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

**Last Updated**: December 27, 2025
**Status**: ✅ Ready for deployment
