#!/bin/bash

# 🚀 COMPLETE SETUP: AUTH0 + RESEND
# Run this to verify Auth0 and setup Resend automatically

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 UNIVERSAL MCP HUB SETUP: AUTH0 + RESEND                        ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
export APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="694ffb380028abb32fd2"
export RESEND_API_KEY="re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX"

# Ask for API key if not set
if [ -z "$APPWRITE_API_KEY" ]; then
    echo "🔑 Enter your Appwrite API Key:"
    echo "   (Get from: Appwrite Console → Settings → API Keys)"
    echo ""
    read -p "API Key: " APPWRITE_API_KEY
    export APPWRITE_API_KEY
    echo ""
fi

# Step 1: Check Auth0
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1️⃣ : CHECKING AUTH0 SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

bash check-auth0-setup.sh

AUTH0_STATUS=$?

if [ $AUTH0_STATUS -eq 0 ]; then
    echo ""
    echo "✅ AUTH0 SETUP VERIFIED!"
    echo ""
    
    # Step 2: Setup Resend
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 2️⃣ : SETTING UP RESEND"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    bash setup-resend.sh
    
    RESEND_STATUS=$?
    
    if [ $RESEND_STATUS -eq 0 ]; then
        echo ""
        echo "╔════════════════════════════════════════════════════════════════════════════╗"
        echo "║              ✅ SETUP COMPLETE! ✅                                        ║"
        echo "╚════════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "🎉 YOUR MCP HUB IS READY!"
        echo ""
        echo "📊 SUMMARY:"
        echo "  ✅ auth0_projects collection verified"
        echo "  ✅ printHub document with Auth0 credentials"
        echo "  ✅ resend_projects collection created"
        echo "  ✅ Attributes added: api_key, from_email, domain, status"
        echo "  ✅ printHub document with Resend credentials"
        echo ""
        echo "🚀 NEXT STEPS:"
        echo "  1. Deploy Resend functions:"
        echo "     bash RESEND_DEPLOY.md (follow manual steps)"
        echo ""
        echo "  2. Add other projects (whatsapp, automation-bot):"
        echo "     bash add-project.sh --project whatsapp --service resend"
        echo ""
        echo "  3. Scale to other services (Stripe, Supabase, OpenAI)"
        echo "     Follow MCP_HUB_UNIVERSAL.md for pattern"
        echo ""
    else
        echo "❌ Resend setup failed"
        exit 1
    fi
else
    echo ""
    echo "❌ AUTH0 SETUP CHECK FAILED"
    echo ""
    echo "ACTION REQUIRED:"
    echo "  1. Create auth0_projects collection manually in Appwrite Console"
    echo "  2. Add printHub document with credentials"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi
