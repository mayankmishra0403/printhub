#!/bin/bash

# Resend API Key Setup Script
# This script adds the Resend API key to MCP Hub for automatic access by functions

set -e

# Configuration
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"
COLLECTION_ID="resend_projects"
DOCUMENT_ID="printHub"
RESEND_API_KEY="re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           🔐 Resend API Key Setup Script for MCP Hub                       ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Configuration:"
echo "  Endpoint:    $APPWRITE_ENDPOINT"
echo "  Project:     $PROJECT_ID"
echo "  Database:    $DATABASE_ID"
echo "  Collection:  $COLLECTION_ID"
echo "  Document:    $DOCUMENT_ID"
echo ""

# Check if Appwrite API key is provided
if [ -z "$APPWRITE_API_KEY" ]; then
  echo "⚠️  APPWRITE_API_KEY environment variable not set"
  echo ""
  echo "To get your API key:"
  echo "  1. Go to: https://cloud.appwrite.io"
  echo "  2. Settings → API Keys"
  echo "  3. Create new key or copy existing"
  echo ""
  echo "Then run:"
  echo "  export APPWRITE_API_KEY='your-key-here'"
  echo "  bash $0"
  echo ""
  exit 1
fi

echo "🔑 Using Appwrite API Key: ${APPWRITE_API_KEY:0:20}***"
echo ""

# Create the payload
PAYLOAD=$(cat <<EOF
{
  "api_key": "$RESEND_API_KEY",
  "from_email": "noreply@printhub.com",
  "domain": "printhub.com",
  "service": "resend",
  "status": "active",
  "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

echo "📝 Payload to upload:"
echo "$PAYLOAD" | jq . 2>/dev/null || echo "$PAYLOAD"
echo ""

# Try to update the document
echo "📤 Uploading to MCP Hub..."
echo ""

RESPONSE=$(curl -s -X PATCH \
  "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections/$COLLECTION_ID/documents/$DOCUMENT_ID" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"$id"'; then
  echo "✅ Successfully uploaded Resend API key to MCP Hub!"
  echo ""
  echo "📍 Location: mcp_hub/resend_projects/printHub"
  echo ""
  echo "Your Appwrite functions can now access Resend:"
  echo "  • resend-send-email"
  echo "  • resend-verify-email"
  echo ""
  echo "🎉 Setup complete! Ready to send emails!"
else
  echo "⚠️  Response received but may not be successful"
  echo ""
  echo "Possible issues:"
  echo "  • Document might not exist (create via console first)"
  echo "  • API key might be invalid"
  echo "  • Permissions might be restricted"
  echo ""
  echo "Solution: Use Appwrite console to manually add the document:"
  echo "  1. Go to: https://cloud.appwrite.io"
  echo "  2. PrintHub → Databases → mcp_hub → resend_projects"
  echo "  3. Add/Edit printHub document"
  echo "  4. Add api_key field with value:"
  echo "     $RESEND_API_KEY"
fi

echo ""
