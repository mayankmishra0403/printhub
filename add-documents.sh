#!/bin/bash

APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"
RESEND_API_KEY="re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 ADDING DOCUMENTS TO COLLECTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Add Auth0 printHub document
echo "📝 Adding printHub to auth0_projects..."
curl -s -X POST \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/auth0_projects/documents" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "documentId": "printHub",
        "data": {
            "client_id": "JqvWx2irDcCaWHYXr3bJcH0JpJBokKax",
            "client_secret": "[YOUR_CLIENT_SECRET_HERE]",
            "domain": "login.ritambharat.software",
            "audience": "https://printhub.api"
        }
    }' > /dev/null 2>&1 && echo "✅ printHub added to auth0_projects" || echo "ℹ️  printHub already exists"

# Add Resend printHub document
echo "📝 Adding printHub to resend_projects..."
curl -s -X POST \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/resend_projects/documents" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
        \"documentId\": \"printHub\",
        \"data\": {
            \"api_key\": \"${RESEND_API_KEY}\",
            \"from_email\": \"noreply@printhub.com\",
            \"domain\": \"printhub.com\",
            \"status\": \"active\"
        }
    }" > /dev/null 2>&1 && echo "✅ printHub added to resend_projects" || echo "ℹ️  printHub already exists"

echo ""
echo "✅ DOCUMENTS ADDED!"
