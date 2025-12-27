# 🚀 PrintHub Vercel Deployment Guide

**Project:** PrintHub Website  
**Domain:** printhub.ritambharat.software  
**Framework:** Next.js 14  
**Database:** Supabase (via Prisma)  
**Auth:** Auth0 (MCP Hub से credentials)  
**Email:** Resend (MCP Hub से API key)

---

## 📋 Prerequisites

- Vercel Account (https://vercel.com)
- GitHub Account (for version control)
- Environment variables ready

---

## 🔧 Step 1: Push to GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial PrintHub commit - ready for Vercel"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/printhub.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository
4. Configure project:
   - **Framework:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build` or `yarn build`
   - **Output Directory:** .next
   - **Install Command:** `npm install` or `yarn install`

---

## 🔐 Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables

```env
# Database
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_url

# Auth0 (from MCP Hub)
AUTH0_DOMAIN=login.ritambharat.software
AUTH0_CLIENT_ID=JqvWx2irDcCaWHYXr3bJcH0JpJBokKax
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_BASE_URL=https://printhub.ritambharat.software

# Appwrite (MCP Hub credentials)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=694ffb380028abb32fd2
APPWRITE_API_KEY=your_api_key
APPWRITE_DB_ID=mcp_hub

# Resend (from MCP Hub)
RESEND_API_KEY=re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX

# App Settings
NEXT_PUBLIC_API_URL=https://printhub.ritambharat.software
NEXT_PUBLIC_PROJECT_ID=printHub
NODE_ENV=production
```

---

## 🌍 Step 4: Configure Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `printhub.ritambharat.software`
4. Follow DNS configuration instructions

### DNS Configuration (at ritambharat.software registrar):

```
Type: CNAME
Name: printhub
Value: cname.vercel.com
TTL: 3600
```

or

```
Type: A
Name: printhub
Value: 76.76.19.165
TTL: 3600
```

---

## 🧪 Step 5: Test Deployment

After deployment:

1. **Check build logs:** Vercel Dashboard → Deployments → [Latest] → Build Logs
2. **Test website:** https://printhub.ritambharat.software
3. **Check Auth0 flow:** Login page should work
4. **Check Resend integration:** Email sending should work

---

## 📊 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported in Vercel
- [ ] Environment variables added
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Build successful
- [ ] Website accessible
- [ ] Auth0 login works
- [ ] Email sending works
- [ ] Database connection verified

---

## 🔄 Continuous Deployment

Every push to `main` branch will auto-deploy to Vercel!

```bash
# To deploy
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys to https://printhub.ritambharat.software
```

---

## 🆘 Troubleshooting

### Build fails
- Check: `npm run build` locally first
- Check environment variables are set
- Check Node.js version (Vercel uses 18.x by default)

### Domain not working
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Check domain in Vercel settings

### Auth0 issues
- Verify AUTH0_BASE_URL matches domain
- Check Auth0 application allowed callbacks
- Check environment variables are correct

### Database connection issues
- Verify DATABASE_URL is correct
- Check Supabase project is running
- Verify IP whitelist in Supabase

---

## 📚 MCP Hub Integration

All credentials are stored in MCP Hub:

```
mcp_hub/
├── auth0_projects/
│   └── printHub → client_id, client_secret, domain
└── resend_projects/
    └── printHub → api_key, from_email, domain
```

Functions access these automatically:
- Auth0 login/signup via `/functions/auth0-*`
- Email sending via `/functions/resend-send-email`
- Verification emails via `/functions/resend-verify-email`

---

## 🎉 Deployment Complete!

Your PrintHub website is now live on:
**https://printhub.ritambharat.software**

Ready to handle:
- User authentication (Auth0)
- Email sending (Resend)
- Database operations (Supabase)
- Cloud functions (Appwrite)

All secured and centralized via MCP Hub! 🚀
