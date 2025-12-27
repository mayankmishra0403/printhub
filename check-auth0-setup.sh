#!/bin/bash

# 🔍 AUTH0 SETUP VERIFICATION SCRIPT
# Check if Auth0 projects collection exists and has proper structure

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING AUTH0 SETUP IN MCP_HUB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configuration
APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT:-https://fra.cloud.appwrite.io/v1}"
APPWRITE_PROJECT_ID="${APPWRITE_PROJECT_ID:-694ffb380028abb32fd2}"
APPWRITE_API_KEY="${APPWRITE_API_KEY}"
DATABASE_ID="mcp_hub"
COLLECTION_ID="auth0_projects"

# Check if API key is provided
if [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ ERROR: APPWRITE_API_KEY not set"
    echo ""
    echo "Set your API key:"
    echo "  export APPWRITE_API_KEY='your-api-key-here'"
    echo ""
    echo "Get from: Appwrite Console → Settings → API Keys"
    exit 1
fi

echo "✅ API Key: ${APPWRITE_API_KEY:0:10}..."
echo ""

# Step 1: Check if database exists
echo "STEP 1: Checking mcp_hub database..."
DB_RESPONSE=$(curl -s -X GET \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}")

if echo "$DB_RESPONSE" | grep -q '"id":"mcp_hub"'; then
    echo "✅ Database 'mcp_hub' exists"
else
    echo "⚠️  Database check response:"
    echo "$DB_RESPONSE" | head -5
fi

echo ""

# Step 2: Check if auth0_projects collection exists
echo "STEP 2: Checking auth0_projects collection..."
COLLECTION_RESPONSE=$(curl -s -X GET \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}")

if echo "$COLLECTION_RESPONSE" | grep -q '"id":"auth0_projects"'; then
    echo "✅ Collection 'auth0_projects' exists"
    
    # Show collection structure
    echo ""
    echo "📋 Collection Structure:"
    echo "$COLLECTION_RESPONSE" | grep -o '"key":"[^"]*"' | head -10
else
    echo "❌ Collection 'auth0_projects' NOT FOUND"
    echo ""
    echo "ACTION REQUIRED: Create auth0_projects collection manually"
    echo "  1. Go to Appwrite Console"
    echo "  2. PrintHub → Databases → mcp_hub"
    echo "  3. Click 'Add Collection'"
    echo "  4. ID: auth0_projects"
    echo "  5. Add attributes:"
    echo "     - client_id (string, required)"
    echo "     - client_secret (string, required)"
    echo "     - domain (string, required)"
    echo "     - audience (string)"
    exit 1
fi

echo ""

# Step 3: Check for printHub document
echo "STEP 3: Checking printHub document in auth0_projects..."
DOCUMENT_RESPONSE=$(curl -s -X GET \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/printHub" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}")

if echo "$DOCUMENT_RESPONSE" | grep -q '"id":"printHub"'; then
    echo "✅ Document 'printHub' exists in auth0_projects"
    echo ""
    echo "📊 Document Contents:"
    echo "$DOCUMENT_RESPONSE" | grep -o '"[^"]*":"[^"]*"' | head -10
else
    echo "⚠️  Document 'printHub' NOT found"
    echo ""
    echo "ACTION REQUIRED: Create printHub document manually"
    echo "  1. Go to Appwrite Console"
    echo "  2. PrintHub → Databases → mcp_hub → auth0_projects"
    echo "  3. Click 'Add Document'"
    echo "  4. Document ID: printHub"
    echo "  5. Add fields:"
    echo "     - client_id: JqvWx2irDcCaWHYXr3bJcH0JpJBokKax"
    echo "     - client_secret: (your value)"
    echo "     - domain: login.ritambharat.software"
    echo "     - audience: https://printhub.api"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AUTH0 SETUP CHECK COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Step: Run setup-resend.sh to create Resend collection"
echo ""
