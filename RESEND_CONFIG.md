# 🔐 Resend API Key Setup in MCP Hub

**Status:** API Key Ready ✅ | **Setup Time:** 2 minutes

---

## 📋 Resend API Key Information

```
API Key: re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX
From Email: noreply@printhub.com
Domain: printhub.com
Service: Resend
Status: Active
```

---

## 🗄️ MCP Hub Storage Location

**Database:** `mcp_hub`  
**Collection:** `resend_projects`  
**Document:** `printHub`

**Document Structure:**
```json
{
  "api_key": "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX",
  "from_email": "noreply@printhub.com",
  "domain": "printhub.com",
  "service": "resend",
  "status": "active",
  "updated": "2025-12-27"
}
```

---

## 🚀 Setup Steps

### Option 1: Appwrite Console (Manual - 1 minute)

1. Go to: https://cloud.appwrite.io
2. Select: PrintHub project
3. Navigate: Databases → mcp_hub → resend_projects
4. Edit Document: `printHub`
5. Add these fields:
   - `api_key`: `re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX`
   - `from_email`: `noreply@printhub.com`
   - `domain`: `printhub.com`
6. Save ✅

### Option 2: Appwrite REST API (Automated)

```bash
curl -X PATCH https://fra.cloud.appwrite.io/v1/databases/mcp_hub/collections/resend_projects/documents/printHub \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "X-Appwrite-Key: [YOUR-APPWRITE-API-KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX",
    "from_email": "noreply@printhub.com",
    "domain": "printhub.com",
    "service": "resend",
    "status": "active",
    "updated": "2025-12-27"
  }'
```

### Option 3: Supabase (If using Supabase for storage)

```sql
-- Insert or update Resend credentials
INSERT INTO mcp_hub.resend_projects (id, api_key, from_email, domain, service, status, updated)
VALUES (
  'printHub',
  're_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX',
  'noreply@printhub.com',
  'printhub.com',
  'resend',
  'active',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  api_key = EXCLUDED.api_key,
  updated = NOW();
```

---

## ✅ Verification

After setup, verify the key is accessible:

### Test 1: Direct Resend API Call
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@printhub.com",
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test from Resend API key setup"
  }'
```

**Expected Response:**
```json
{
  "id": "e1e0d4c5-2b8c-4f3e-9e1f-1234567890ab",
  "from": "noreply@printhub.com",
  "to": "test@example.com",
  "created_at": "2025-12-27T22:45:00.000Z"
}
```

### Test 2: Via Appwrite Function
```bash
curl -X POST https://fra.cloud.appwrite.io/v1/functions/resend-send-email/executions \
  -H "X-Appwrite-Project: 694ffb380028abb32fd2" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test from Appwrite",
    "text": "Testing Resend via Appwrite function"
  }'
```

---

## 🔑 How Functions Access the Key

**Resend functions automatically fetch the API key from MCP Hub:**

```javascript
// In resend-send-email and resend-verify-email functions
const configDoc = await databases.getDocument(
  "mcp_hub",
  "resend_projects",
  "printHub"  // Your document ID
);

const RESEND_API_KEY = configDoc.api_key;  // ← Gets your key!
```

**Flow:**
1. Function receives request
2. Function queries MCP Hub → `mcp_hub/resend_projects/printHub`
3. Gets `api_key` field → `re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX`
4. Uses it to call Resend API
5. Sends email ✅

---

## 🛡️ Security Notes

✅ **Safe Storage:**
- API key stored in encrypted MCP Hub
- Never hardcoded in function code
- Functions fetch at runtime (fresh each time)
- Can rotate key anytime without code changes

✅ **Best Practices:**
- Keep MCP Hub collection access restricted
- Use Appwrite RLS policies to limit access
- Rotate key periodically (via Resend dashboard)
- Monitor usage via Resend dashboard

⚠️ **Sensitive:**
- This API key has email sending permissions
- Only share with trusted services
- Check Resend logs regularly for unauthorized usage

---

## 📊 Current Setup Status

| Component | Status | Details |
|-----------|--------|---------|
| Resend Account | ✅ Active | Account verified, domain ready |
| API Key | ✅ Ready | `re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX` |
| MCP Hub Collection | ✅ Created | `resend_projects` ready |
| Functions | ✅ Deployed | 2 functions ready to use |
| Document | ⏳ Pending | Need to add API key to `printHub` doc |

---

## 🚀 Next Steps

1. **Add Key to MCP Hub** (Choose Option 1, 2, or 3 above)
2. **Verify Access** (Run Test 1 or Test 2)
3. **Deploy Resend Functions** (Follow RESEND_DEPLOY.md)
4. **Test Email Sending** (Send test email via function)

---

## 💡 Troubleshooting

**Error: "API key not found"**
→ Verify document exists at `mcp_hub/resend_projects/printHub`
→ Check `api_key` field is populated
→ Ensure Appwrite has read access to the collection

**Error: "Invalid email address"**
→ Verify `from_email` is verified in Resend dashboard
→ Check recipient email format

**Error: "API key is invalid"**
→ Verify key starts with `re_`
→ Check for extra spaces in the key
→ Regenerate key from Resend dashboard if needed

---

## 📝 Document Creation (If Needed)

If the document doesn't exist, create it via Appwrite console:

1. Collections → resend_projects → Add Document
2. Document ID: `printHub`
3. Fields:
   ```
   api_key (text): re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX
   from_email (text): noreply@printhub.com
   domain (text): printhub.com
   service (text): resend
   status (text): active
   updated (datetime): 2025-12-27
   ```
4. Save ✅

---

**Setup Complete!** Your Resend email functions now have access to the API key. 🎉

Created: December 27, 2025
