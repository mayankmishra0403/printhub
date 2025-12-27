# 🧠 AI Context - Project & User Info

> Last Updated: December 27, 2025

---

## 👤 User Profile

| Field | Value |
|-------|-------|
| **Name** | Mayank Mishra |
| **Email** | mayankmishra7296@gmail.com |
| **Domains** | `edu-nova.tech` (testing), `ritambharat.software` (company) |
| **GitHub** | Connected via GitHub Student Developer Pack |
| **OS** | macOS |
| **Shell** | zsh |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js 15+, React, TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Auth + Storage), Prisma ORM |
| **Deployment** | Vercel, Cloudflare |
| **Monitoring** | Sentry (error tracking) |
| **Design** | Figma |
| **Docs** | Notion |
| **Version Control** | Git, GitHub, GitKraken |
| **Feature Flags** | ConfigCat |
| **Cloud** | Azure (activated) |

---

## 📁 Current Project

| Field | Value |
|-------|-------|
| **Name** | PrintHub |
| **Path** | `/Users/mayankmishra7296gmail.com/Pictures/workspace-fbb58750-4ede-424f-822b-7c5a107eac4b` |
| **Type** | Printing Services Web App |
| **Framework** | Next.js 15+ with App Router |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |

---

## 📊 Current Architecture (Session 8)

**Frontend**: Next.js 14 (TypeScript + Tailwind + shadcn/ui)
**Backend**: Appwrite Cloud Functions + Supabase Database
**Auth**: Auth0 (via MCP Hub credentials)
**Email**: Resend (via MCP Hub API key)
**Credentials Storage**: Centralized MCP Hub Database (Appwrite)
**Hosting**: Vercel (ready to deploy)
**Domain**: printhub.ritambharat.software

**MCP Hub Structure**:
```
mcp_hub Database
├── auth0_projects/ (Collection)
│   ├── printHub (Document) ✅
│   │   ├── client_id: "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax"
│   │   ├── client_secret: "[SECURE]"
│   │   ├── domain: "login.ritambharat.software"
│   │   └── audience: "https://api.ritambharat.software"
│   ├── whatsapp (ready for config)
│   └── automation-bot (ready for config)
│
└── resend_projects/ (Collection)
    ├── printHub (Document) ✅
    │   ├── api_key: "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX"
    │   ├── from_email: "noreply@printhub.com"
    │   ├── domain: "printhub.com"
    │   └── status: "active"
    │
    ├── func-resend-send-email (Metadata) ✅
    │   └── deployment_id: "6950183126b3a92100fb"
    │
    └── func-resend-verify-email (Metadata) ✅
        └── deployment_id: "695018563e2802755e7b"
```

**Universal Function Pattern** (single function serves all projects):
```javascript
// Function receives projectId in request
const { projectId, email, subject, ... } = JSON.parse(req.body);

// Fetch credentials from MCP Hub
const config = await databases.getDocument(
  "mcp_hub",
  "resend_projects",
  projectId  // "printHub", "whatsapp", etc.
);

// Use credentials to call external API
// Works for: Auth0, Resend, Stripe, OpenAI, etc.
```

---

## 🔌 Connected MCPs

| MCP | Status | Configuration |
|-----|--------|---------------|
| **Supabase** | ✅ Active | Project Ref: `upusrmkxcyfttjttvqsn` |
| **Vercel** | ✅ Active | Token: `9OM2oeEFnSmZgA5FdlxjDNzG` |
| **Cloudflare** | ✅ Active | Account ID: `0d94e3a4450b6285ae0f5841fbc2938a` |
| **Sentry** | ✅ Active | Org token configured |
| **GitHub** | ✅ Active | Full access (repos, issues, PRs, search) |
| **GitKraken** | ✅ Active | Git management |
| **Figma** | ✅ Active | Design files access |
| **Notion** | ✅ Active | Docs & databases |
| **Browser MCP** | ✅ Active | Web automation (navigate, click, screenshot, type) |
| **ConfigCat** | ✅ Active | Feature flags (via extension) |
| **Azure** | ✅ Active | Cloud services |
| **Pylance** | ✅ Active | Python language server |
| **Appwrite** | ✅ Active | Project ID: `694ffb380028abb32fd2`, Endpoint: `https://fra.cloud.appwrite.io/v1`, 4 Auth0 functions LIVE + 2 Resend functions building |
| **Auth0** | ✅ Active | Domain: `login.ritambharat.software`, Client ID: `JqvWx2irDcCaWHYXr3bJcH0JpJBokKax`, Credentials in mcp_hub/auth0_projects/printHub |
| **Resend** | ✅ Active | API Key: `re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX`, Credentials in mcp_hub/resend_projects/printHub, 2 functions deployed (IDs: 6950183126b3a92100fb, 695018563e2802755e7b) |

---

## 🤖 JARVIS Status

> **Tum (AI Assistant) hi mere JARVIS ho.**  
> VS Code + MCPs ke through sab kuch manage hota hai - coding, deployment, database, automation, sab kuch.  
> Koi alag JARVIS project banana nahi hai - yeh setup hi JARVIS hai.

**Capabilities:**
- 💻 Code generation, debugging, refactoring
- 🚀 Deployment via Vercel/Cloudflare
- 🗄️ Database management via Supabase
- 🌐 Web automation via Browser MCP
- 📊 Error tracking via Sentry
- 🎨 Design access via Figma
- 📝 Documentation via Notion
- 🔀 Git management via GitHub/GitKraken
- 🚩 Feature flags via ConfigCat
- ☁️ Cloud services via Azure

---

## 🗣️ Communication Style

- **Language**: Hindi-English mix (Hinglish)
- **Tone**: Casual, friendly, direct
- **Preference**: Short, actionable responses
- **Approach**: Hands-on, practical, no unnecessary questions
