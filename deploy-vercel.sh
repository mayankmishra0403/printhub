#!/bin/bash

# 🚀 DEPLOY PRINTHUB TO VERCEL
# Quick deployment script for printhub.ritambharat.software

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           🚀 DEPLOYING PRINTHUB TO VERCEL                                 ║"
echo "║           Domain: printhub.ritambharat.software                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed"
    echo ""
    echo "Install with:"
    echo "  npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Step 1: Test build locally
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1️⃣ : Testing build locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run build 2>&1 | tail -20; then
    echo ""
    echo "✅ Build successful!"
else
    echo ""
    echo "❌ Build failed. Fix errors and try again."
    exit 1
fi

echo ""

# Step 2: Git setup
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2️⃣ : Setting up Git..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial PrintHub commit - ready for Vercel deployment"
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already exists"
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "Update before Vercel deployment"
    fi
fi

echo ""

# Step 3: Vercel login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3️⃣ : Vercel authentication..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if vercel whoami &> /dev/null; then
    echo "✅ Already authenticated with Vercel"
else
    echo "📝 Please authenticate with Vercel..."
    vercel login
fi

echo ""

# Step 4: Deploy to production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4️⃣ : Deploying to Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

vercel --prod

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT SUBMITTED! ✅                              ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Next Steps:"
echo "  1. Check build status: https://vercel.com/dashboard"
echo "  2. Configure custom domain if not done:"
echo "     Vercel Dashboard → Settings → Domains"
echo "     Add: printhub.ritambharat.software"
echo "  3. Add environment variables:"
echo "     Vercel Dashboard → Settings → Environment Variables"
echo "     (See VERCEL_DEPLOY.md for details)"
echo "  4. Update DNS records:"
echo "     At ritambharat.software domain registrar"
echo "     CNAME: printhub → cname.vercel.com"
echo ""
echo "🌍 Your website will be live at:"
echo "  https://printhub.ritambharat.software"
echo ""
echo "📚 For detailed setup guide, see: VERCEL_DEPLOY.md"
echo ""
