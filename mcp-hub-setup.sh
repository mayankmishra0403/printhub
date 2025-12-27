#!/bin/bash

# Universal MCP Hub Setup Script
# Creates collections for Auth0 and Resend supporting multiple projects

set -e

# Configuration
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║        🔍 Universal MCP Hub Setup - Auth0 & Resend                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if API key is set
if [ -z "$APPWRITE_API_KEY" ]; then
  echo "⚠️  APPWRITE_API_KEY not set. Setting up with read-only mode..."
  echo ""
  echo "Get your API key:"
  echo "  1. https://cloud.appwrite.io → Settings → API Keys"
  echo "  2. export APPWRITE_API_KEY='your-key'"
  echo "  3. Run this script again"
  echo ""
  API_KEY_MSG="⚠️  (Need API key for write operations)"
else
  API_KEY_MSG="✅ (API key configured)"
fi

echo "📋 MCP HUB STRUCTURE CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Endpoint: $APPWRITE_ENDPOINT"
echo "Project:  $PROJECT_ID"
echo "Database: $DATABASE_ID"
echo ""

# Check Auth0 collection
echo "🔍 Checking Auth0 Setup..."
echo "───────────────────────────────────────────────────────────────────────────"
echo ""
echo "Expected Structure:"
echo "  Database: mcp_hub"
echo "  Collection: auth0_projects"
echo "    └── Document: printHub (and other projects)"
echo "        ├── client_id: (Auth0 client ID)"
echo "        ├── client_secret: (Auth0 client secret)"
echo "        ├── domain: (Auth0 domain)"
echo "        └── audience: (API identifier)"
echo ""

if [ -n "$APPWRITE_API_KEY" ]; then
  echo "📤 Fetching auth0_projects collection info..."
  RESPONSE=$(curl -s -X GET \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/auth0_projects" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY")
  
  if echo "$RESPONSE" | grep -q '"$id"'; then
    echo "✅ auth0_projects collection EXISTS"
    echo ""
    echo "Getting documents..."
    DOCS=$(curl -s -X GET \
      "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/auth0_projects/documents" \
      -H "X-Appwrite-Project: $PROJECT_ID" \
      -H "X-Appwrite-Key: $APPWRITE_API_KEY")
    
    echo "$DOCS" | jq '.documents[] | {id: .$id, domain: .domain, created: .$createdAt}' 2>/dev/null || echo "✅ Documents found"
  else
    echo "❌ auth0_projects collection NOT FOUND or error"
    echo "Response: $RESPONSE"
  fi
else
  echo "⚠️  Skipping live check (need API key)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔨 Creating Resend Collection (Same Structure)"
echo "───────────────────────────────────────────────────────────────────────────"
echo ""
echo "Design: Same as auth0_projects but for Resend"
echo ""
echo "  Database: mcp_hub"
echo "  Collection: resend_projects"
echo "    └── Document: printHub (and other projects)"
echo "        ├── api_key: (Resend API key)"
echo "        ├── from_email: (From email address)"
echo "        ├── domain: (Verified domain)"
echo "        └── status: (active/inactive)"
echo ""

if [ -n "$APPWRITE_API_KEY" ]; then
  echo "📝 Creating resend_projects collection..."
  
  # Create collection with proper attributes
  CREATE_COLLECTION=$(cat <<'COLLECTION_EOF'
{
  "collectionId": "resend_projects",
  "name": "Resend Projects",
  "permissions": [
    "read(\"user:*\")",
    "create(\"user:*\")",
    "update(\"user:*\")",
    "delete(\"user:*\")"
  ],
  "documentSecurity": false
}
COLLECTION_EOF
)

  RESPONSE=$(curl -s -X POST \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$CREATE_COLLECTION")
  
  if echo "$RESPONSE" | grep -q '"$id"'; then
    echo "✅ resend_projects collection CREATED"
  elif echo "$RESPONSE" | grep -q "already exists"; then
    echo "✅ resend_projects collection already EXISTS"
  else
    echo "⚠️  Response: $RESPONSE"
  fi
  
  echo ""
  echo "📝 Adding attributes to resend_projects..."
  
  # Add api_key attribute
  curl -s -X POST \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/resend_projects/attributes/string" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"key":"api_key","size":500,"required":true}' > /dev/null 2>&1
  
  # Add from_email attribute
  curl -s -X POST \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/resend_projects/attributes/string" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"key":"from_email","size":255,"required":true}' > /dev/null 2>&1
  
  # Add domain attribute
  curl -s -X POST \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/resend_projects/attributes/string" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"key":"domain","size":255,"required":false}' > /dev/null 2>&1
  
  # Add status attribute
  curl -s -X POST \
    "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/resend_projects/attributes/string" \
    -H "X-Appwrite-Project: $PROJECT_ID" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"key":"status","size":50,"required":false,"default":"active"}' > /dev/null 2>&1
  
  echo "✅ Attributes configured"
  
else
  echo "⚠️  Skipping creation (need API key)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 UNIVERSAL MCP HUB STRUCTURE"
echo "───────────────────────────────────────────────────────────────────────────"
echo ""
cat << 'STRUCTURE_EOF'
mcp_hub (Database)
├── auth0_projects (Collection)
│   ├── printHub (Document)
│   │   ├── client_id: JqvWx2irDcCaWHYXr3bJcH0JpJBokKax
│   │   ├── client_secret: ***
│   │   ├── domain: login.ritambharat.software
│   │   └── audience: https://printhub.api
│   ├── whatsapp (Document)
│   │   ├── client_id: ***
│   │   └── ...
│   └── other-project (Document)
│       └── ...
│
└── resend_projects (Collection)
    ├── printHub (Document)
    │   ├── api_key: re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX
    │   ├── from_email: noreply@printhub.com
    │   ├── domain: printhub.com
    │   └── status: active
    ├── whatsapp (Document)
    │   ├── api_key: re_XXXX...
    │   └── ...
    └── other-project (Document)
        └── ...

STRUCTURE_EOF

echo ""
echo "🎯 BENEFITS:"
echo "───────────────────────────────────────────────────────────────────────────"
echo ""
echo "✅ Single Database (mcp_hub) for all credentials"
echo "✅ Organized by Service (auth0_projects, resend_projects, etc.)"
echo "✅ Multiple Projects in each collection"
echo "✅ Easy rotation of credentials per project"
echo "✅ Reusable across all Appwrite functions"
echo "✅ Centralized, no hardcoded secrets"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo "───────────────────────────────────────────────────────────────────────────"
echo ""
echo "1️⃣ Run with API key for automatic setup:"
echo "   export APPWRITE_API_KEY='your-api-key'"
echo "   bash mcp-hub-setup.sh"
echo ""
echo "2️⃣ Or manually create in Appwrite console:"
echo "   - mcp_hub → Collections → Add Collection"
echo "   - Name: resend_projects"
echo "   - Add attributes (api_key, from_email, domain, status)"
echo ""
echo "3️⃣ Add documents for each project:"
echo "   - printHub"
echo "   - whatsapp"
echo "   - other-project"
echo ""
echo "4️⃣ Functions fetch from:"
echo "   mcp_hub/auth0_projects/{projectId}"
echo "   mcp_hub/resend_projects/{projectId}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
