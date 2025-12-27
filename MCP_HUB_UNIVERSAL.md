# 🗄️ Universal MCP Hub - Multi-Project Setup

**Status:** Ready to Deploy | **Time:** 10 minutes | **Scope:** All Projects

---

## 📋 Overview

Single centralized database (`mcp_hub`) storing credentials for **all services** and **all projects**:

```
mcp_hub Database
├── auth0_projects          (Auth0 OAuth credentials)
├── resend_projects         (Resend email credentials)
├── supabase_projects       (Future: Supabase configs)
├── stripe_projects         (Future: Payment configs)
└── other_services          (Future: Other integrations)
```

Each collection can have **multiple projects**:

```
auth0_projects
├── printHub
├── whatsapp
├── automation-bot
└── admin-dashboard

resend_projects
├── printHub
├── whatsapp
├── automation-bot
└── admin-dashboard
```

---

## 🔑 Current Setup Status

### ✅ Auth0 Projects Collection (Existing)

**Location:** `mcp_hub/auth0_projects`

**Structure:**
```json
{
  "printHub": {
    "client_id": "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax",
    "client_secret": "[encrypted]",
    "domain": "login.ritambharat.software",
    "audience": "https://printhub.api",
    "created": "2025-12-27"
  }
}
```

**Document Fields:**
- `client_id` (string) - Auth0 application ID
- `client_secret` (string) - Auth0 application secret
- `domain` (string) - Auth0 tenant domain
- `audience` (string) - API identifier
- `created` (datetime) - Creation timestamp

---

### ✅ Resend Projects Collection (New - To Create)

**Location:** `mcp_hub/resend_projects`

**Structure:**
```json
{
  "printHub": {
    "api_key": "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX",
    "from_email": "noreply@printhub.com",
    "domain": "printhub.com",
    "status": "active",
    "created": "2025-12-27"
  }
}
```

**Document Fields:**
- `api_key` (string) - Resend API key
- `from_email` (string) - Default sender email
- `domain` (string) - Verified sending domain
- `status` (string) - active/inactive
- `created` (datetime) - Creation timestamp

---

## 🚀 Setup Steps

### Step 1: Verify Auth0 Collection (2 minutes)

Go to Appwrite Console:
1. **PrintHub project** → **Databases** → **mcp_hub**
2. **Collections** tab
3. Should see: `auth0_projects`

**Expected Documents:**
- printHub (with client_id, domain, etc.)

If missing, create manually:
- Click **Add Collection**
- ID: `auth0_projects`
- Name: "Auth0 Projects"
- Add attributes: client_id, client_secret, domain, audience

---

### Step 2: Create Resend Collection (2 minutes)

Go to Appwrite Console:
1. **PrintHub project** → **Databases** → **mcp_hub**
2. **Collections** tab
3. **Add Collection**

**Collection Details:**
- **Collection ID:** `resend_projects`
- **Name:** `Resend Projects`
- **Permissions:** Public read/write (change as needed)

**Add Attributes:**
1. Click **Add Attribute**
   - Type: **String**
   - Key: `api_key`
   - Size: `500`
   - Required: ✅ Yes

2. Click **Add Attribute**
   - Type: **String**
   - Key: `from_email`
   - Size: `255`
   - Required: ✅ Yes

3. Click **Add Attribute**
   - Type: **String**
   - Key: `domain`
   - Size: `255`
   - Required: ❌ No

4. Click **Add Attribute**
   - Type: **String**
   - Key: `status`
   - Size: `50`
   - Default: `active`
   - Required: ❌ No

✅ **Save Collection**

---

### Step 3: Add PrintHub Document to Resend (2 minutes)

1. **mcp_hub** → **resend_projects** → **Add Document**

**Document ID:** `printHub`

**Fields:**
```
api_key:     re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX
from_email:  noreply@printhub.com
domain:      printhub.com
status:      active
```

✅ **Save Document**

---

### Step 4: (Optional) Add Other Projects

Repeat Step 3 for other projects:

**Example: WhatsApp Bot Project**

Document ID: `whatsapp`
```
api_key:     re_XXXX...
from_email:  notifications@whatsapp-bot.com
domain:      whatsapp-bot.com
status:      active
```

**Example: Automation Bot**

Document ID: `automation-bot`
```
api_key:     re_YYYY...
from_email:  alerts@automation.internal
domain:      automation.internal
status:      active
```

---

## 🔗 How Functions Access the Data

### Auth0 Function Example

```javascript
import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Get Auth0 config for specific project
const auth0Config = await databases.getDocument(
  "mcp_hub",
  "auth0_projects",
  "printHub"  // Project ID comes from request
);

const { client_id, client_secret, domain } = auth0Config;
// Use credentials to call Auth0 API
```

### Resend Function Example

```javascript
// Get Resend config for specific project
const resendConfig = await databases.getDocument(
  "mcp_hub",
  "resend_projects",
  "printHub"  // Project ID comes from request
);

const { api_key, from_email } = resendConfig;
// Use credentials to send email via Resend API
```

---

## 📊 Comparison: Before vs After

### Before (Individual Functions)
```
resend-send-email-printHub/
resend-verify-email-printHub/
resend-send-email-whatsapp/
resend-verify-email-whatsapp/
auth0-login-printHub/
auth0-signup-whatsapp/
...multiple duplicates...
```

### After (Universal Functions)
```
resend-send-email/          (works for any project)
  ├── Reads: mcp_hub/resend_projects/{projectId}
  └── Gets API key from any project
  
auth0-login/                (works for any project)
  ├── Reads: mcp_hub/auth0_projects/{projectId}
  └── Gets credentials from any project
  
...single set of functions for all projects...
```

**Benefits:**
- ✅ Single function handles all projects
- ✅ Update credentials without redeploy
- ✅ Add new projects without new functions
- ✅ Consistent error handling
- ✅ Easy monitoring and debugging

---

## 🛡️ Security Best Practices

1. **Permissions:** Restrict `mcp_hub` access by roles
   ```
   read: Service functions only
   write: Admin role only
   delete: Disabled
   ```

2. **Encryption:** Use Appwrite's built-in encryption for sensitive fields

3. **Audit:** Enable database logs to track access

4. **Rotation:** Update API keys periodically
   - Resend: Generate new key → update document → old key revoked
   - Auth0: Rotate secrets → update document → functions use new secret

5. **Isolation:** Consider separate database per environment
   ```
   mcp_hub_dev
   mcp_hub_staging
   mcp_hub_production
   ```

---

## 📈 Scaling to Multiple Services

Add new service collections as needed:

```
mcp_hub
├── auth0_projects
├── resend_projects
├── stripe_projects          ← New: Stripe payment keys
│   └── printHub
│       ├── api_key
│       ├── webhook_secret
│       └── account_id
├── supabase_projects        ← New: Supabase configs
│   └── printHub
│       ├── project_url
│       ├── project_key
│       └── service_key
└── openai_projects          ← New: OpenAI API keys
    └── automation-bot
        ├── api_key
        └── model_preference
```

Each service has its own collection with consistent document naming by project.

---

## 🔍 Verification Commands

### Check Auth0 Collection
```bash
curl https://fra.cloud.appwrite.io/v1/databases/mcp_hub/collections/auth0_projects/documents \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "X-Appwrite-Key: [API-KEY]" | jq .
```

### Check Resend Collection
```bash
curl https://fra.cloud.appwrite.io/v1/databases/mcp_hub/collections/resend_projects/documents \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "X-Appwrite-Key: [API-KEY]" | jq .
```

### Get Specific Project
```bash
curl https://fra.cloud.appwrite.io/v1/databases/mcp_hub/collections/resend_projects/documents/printHub \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "X-Appwrite-Key: [API-KEY]" | jq .
```

---

## 📝 Document Template

### New Service Collection

When adding a new service, use this template:

**Collection Name:** `{service}_projects`  
**Document ID:** `{projectName}`

**Example: Stripe**

```json
{
  "api_key": "sk_live_...",
  "publishable_key": "pk_live_...",
  "webhook_secret": "whsec_...",
  "account_id": "acct_...",
  "status": "active"
}
```

---

## ✅ Checklist

- [ ] Verify auth0_projects collection exists
- [ ] Check printHub document in auth0_projects
- [ ] Create resend_projects collection
- [ ] Add attributes to resend_projects
- [ ] Create printHub document with API key
- [ ] Test: Fetch auth0_projects/printHub
- [ ] Test: Fetch resend_projects/printHub
- [ ] Document for team
- [ ] Set up access permissions
- [ ] Plan future services (Stripe, etc.)

---

## 🚀 Ready to Deploy

Once setup complete:
1. Functions automatically use correct credentials
2. No code changes needed for new projects
3. Credentials centrally managed
4. Fully scalable architecture

**Status:** Ready for universal Appwrite function architecture 🎉

Created: December 27, 2025
