# 🚀 Resend Email Functions Deployment to Appwrite

**Status:** Code Ready ✅ | **Time to Deploy:** 2 minutes | **Difficulty:** Easy

---

## 📦 What's Included

Two ready-to-deploy email functions with **full production code**:

1. **resend-send-email** - Send any email (marketing, notifications, alerts)
2. **resend-verify-email** - Send verification codes with HTML templates

---

## 🎯 Quick Deploy Steps

### Step 1: Appwrite Console
Go to: https://cloud.appwrite.io → **PrintHub** project

### Step 2: Create Functions
**Function 1: resend-send-email**
- **Name:** `resend-send-email`
- **ID:** `resend-send-email`
- **Runtime:** Node.js 18.0
- **Click:** Create function

**Function 2: resend-verify-email**
- **Name:** `resend-verify-email`
- **ID:** `resend-verify-email`
- **Runtime:** Node.js 18.0
- **Click:** Create function

### Step 3: Upload Code

For each function:
1. Go to function → **Deployments** tab
2. **Upload Code** → Select tar.gz file:
   - `resend-send-email.tar.gz` for first function
   - `resend-verify-email.tar.gz` for second function
3. **Entrypoint:** `index.js`
4. **Click:** Activate Deployment ✅

### Step 4: Set Environment Variables

Go to **Settings** tab for each function and add:

```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=694ffb380028abb32fd2
APPWRITE_API_KEY=[Your API Key from Settings → API Keys]
```

---

## 📁 Function Code Files

Located in `/tmp/resend-functions/`:

```
/tmp/resend-functions/
├── send-email.tar.gz          ← Upload this
├── verify-email.tar.gz        ← Upload this
├── send-email/
│   ├── index.js              ← Source code
│   └── package.json          ← Dependencies
└── verify-email/
    ├── index.js              ← Source code
    └── package.json          ← Dependencies
```

**To re-package locally:**
```bash
cd /tmp/resend-functions/send-email && tar -czf ../send-email.tar.gz index.js package.json
cd /tmp/resend-functions/verify-email && tar -czf ../verify-email.tar.gz index.js package.json
```

---

## 🔧 Function Details

### resend-send-email

**Purpose:** Send emails (marketing, notifications, etc.)

**Endpoint:** `/functions/resend-send-email`

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome to PrintHub",
  "html": "<h1>Welcome!</h1><p>Your account is ready.</p>",
  "text": "Welcome! Your account is ready.",
  "from": "noreply@printhub.com"  // Optional, defaults as shown
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "e1e0d4c5-2b8c-4f3e-9e1f-1234567890ab",
  "message": "Email sent successfully"
}
```

**Error Handling:**
- ✅ Invalid email format
- ✅ Missing required fields
- ✅ Resend API failures
- ✅ Database connection issues

---

### resend-verify-email

**Purpose:** Send email verification codes

**Endpoint:** `/functions/resend-verify-email`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "e1e0d4c5-2b8c-4f3e-9e1f-1234567890ab",
  "verificationCode": "ABC123",
  "expiresIn": 600,
  "message": "Verification email sent successfully"
}
```

**Features:**
- Auto-generates 6-character code
- Sends HTML-formatted email
- Returns code for verification logic
- Expires in 10 minutes (600 seconds)

---

## 🔑 MCP Hub Integration

Both functions read credentials from centralized storage:

**Database:** `mcp_hub`  
**Collection:** `resend_projects`  
**Document:** `printHub`

**Document Structure:**
```json
{
  "api_key": "[YOUR_RESEND_API_KEY]",
  "from_email": "noreply@printhub.com",
  "domain": "printhub.com"
}
```

### Setup MCP Hub (One-time):

1. Go to Supabase/Appwrite console
2. Navigate to `mcp_hub` database
3. Create `resend_projects` collection if missing
4. Create `printHub` document with:
   - `api_key`: Your Resend API key (from https://resend.com/api-keys)
   - Other optional fields

---

## 🧪 Testing Functions

### Using curl:

**Test send-email:**
```bash
curl -X POST https://fra.cloud.appwrite.io/v1/functions/resend-send-email/executions \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

**Test verify-email:**
```bash
curl -X POST https://fra.cloud.appwrite.io/v1/functions/resend-verify-email/executions \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

## 📊 Architecture

```
PrintHub Frontend/Backend
         ↓
    Appwrite Functions
         ├── resend-send-email
         └── resend-verify-email
         ↓
    MCP Hub (Database)
         └── resend_projects/printHub (Credentials)
         ↓
    Resend API
         └── Send real emails
```

---

## ✅ Post-Deployment Checklist

- [ ] Both functions created in Appwrite Console
- [ ] Code deployed to both functions
- [ ] Environment variables set on both
- [ ] MCP Hub document created with API key
- [ ] Test send-email with curl
- [ ] Test verify-email with curl
- [ ] Ready for integration with PrintHub

---

## 🚀 Next Steps

Once deployed:

1. **Option A:** Test functions (see Testing section above)
2. **Option B:** Integrate with PrintHub API
3. **Option C:** Add email triggers to auth flows

---

## 📚 File Locations

```
Workspace:
├── RESEND_DEPLOY.md              ← This file
├── APPWRITE_DEPLOY.md            ← Auth0 functions guide
├── APPWRITE_INTEGRATE.md         ← Integration with frontend
├── appwrite-functions/
│   ├── auth0-login.js
│   ├── auth0-signup.js
│   └── ... (auth0 functions)
└── resend-functions/             ← Your Resend code
    ├── send-email/
    │   ├── index.js
    │   └── package.json
    └── verify-email/
        ├── index.js
        └── package.json
```

---

## 💡 Tips

- **API Keys:** Keep Resend API keys in MCP Hub, never in code
- **Emails:** Always use verified domains with Resend for production
- **Templates:** Extend HTML templates in verify-email function as needed
- **Errors:** Check Appwrite function logs if something fails

---

## 🆘 Troubleshooting

**Error: "API key not found"**
→ Check MCP Hub document `resend_projects/printHub`

**Error: "Invalid email"**
→ Verify recipient email format

**Function not executing**
→ Check Appwrite console for logs, ensure env vars set

**Emails not arriving**
→ Check Resend dashboard for bounces, verify domain setup

---

**Deployment Status:** ✅ CODE READY - AWAITING UPLOAD

Created: December 27, 2025
