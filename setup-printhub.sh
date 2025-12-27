#!/bin/bash

ENDPOINT="https://fra.cloud.appwrite.io/v1"
PROJECT_ID="694ffb380028abb32fd2"
DB_ID="mcp_hub"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    📝 SETTING UP PRINTHUB PROJECT                          ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Update/Create Auth0 credentials for printHub
echo "🔐 Setting up Auth0 credentials for printHub..."
curl -s -X PATCH \
  "${ENDPOINT}/databases/${DB_ID}/collections/auth0_projects/documents/printHub" \
  -H "X-Appwrite-Project: ${PROJECT_ID}" \
  -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax",
    "client_secret": "[YOUR_CLIENT_SECRET]",
    "domain": "login.ritambharat.software",
    "audience": "https://printhub.api"
  }' > /dev/null 2>&1 && echo "✅ Auth0 credentials updated" || \
curl -s -X POST \
  "${ENDPOINT}/databases/${DB_ID}/collections/auth0_projects/documents" \
  -H "X-Appwrite-Project: ${PROJECT_ID}" \
  -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "printHub",
    "data": {
      "client_id": "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax",
      "client_secret": "[YOUR_CLIENT_SECRET]",
      "domain": "login.ritambharat.software",
      "audience": "https://printhub.api"
    }
  }' > /dev/null 2>&1 && echo "✅ Auth0 credentials created"

echo ""

# Update/Create Resend credentials for printHub
echo "📧 Setting up Resend credentials for printHub..."
curl -s -X PATCH \
  "${ENDPOINT}/databases/${DB_ID}/collections/resend_projects/documents/printHub" \
  -H "X-Appwrite-Project: ${PROJECT_ID}" \
  -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX",
    "from_email": "noreply@printhub.com",
    "domain": "printhub.com",
    "status": "active"
  }' > /dev/null 2>&1 && echo "✅ Resend credentials updated" || \
curl -s -X POST \
  "${ENDPOINT}/databases/${DB_ID}/collections/resend_projects/documents" \
  -H "X-Appwrite-Project: ${PROJECT_ID}" \
  -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "printHub",
    "data": {
      "api_key": "re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX",
      "from_email": "noreply@printhub.com",
      "domain": "printhub.com",
      "status": "active"
    }
  }' > /dev/null 2>&1 && echo "✅ Resend credentials created"

echo ""

# Verify the setup
echo "═════════════════════════════════════════════════════════════════════════════"
echo "✅ PRINTHUB PROJECT SETUP COMPLETE!"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 PrintHub Configuration:"
echo ""
echo "🔐 Auth0:"
echo "  Client ID: JqvWx2irDcCaWHYXr3bJcH0JpJBokKax"
echo "  Domain: login.ritambharat.software"
echo "  Audience: https://printhub.api"
echo ""
echo "📧 Resend:"
echo "  API Key: re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX"
echo "  From Email: noreply@printhub.com"
echo "  Domain: printhub.com"
echo ""
echo "🚀 Ready to use Auth0 and Resend functions!"
echo ""
