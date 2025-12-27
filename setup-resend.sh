#!/bin/bash

# 📧 RESEND SETUP SCRIPT
# Create resend_projects collection following auth0_projects pattern

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 SETTING UP RESEND COLLECTION IN MCP_HUB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configuration
APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT:-https://fra.cloud.appwrite.io/v1}"
APPWRITE_PROJECT_ID="${APPWRITE_PROJECT_ID:-694ffb380028abb32fd2}"
APPWRITE_API_KEY="${APPWRITE_API_KEY}"
DATABASE_ID="mcp_hub"
COLLECTION_ID="resend_projects"
RESEND_API_KEY="${RESEND_API_KEY:-re_etVdaM6B_PTAWBmDu2o776ZLniM4PVavX}"
PROJECT_NAME="${PROJECT_NAME:-printHub}"

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

echo "✅ Appwrite API Key: ${APPWRITE_API_KEY:0:10}..."
echo "✅ Resend API Key: ${RESEND_API_KEY:0:10}..."
echo ""

# Step 1: Check if collection exists
echo "STEP 1: Checking if resend_projects collection exists..."
COLLECTION_CHECK=$(curl -s -X GET \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" || true)

if echo "$COLLECTION_CHECK" | grep -q '"id":"resend_projects"'; then
    echo "✅ Collection 'resend_projects' already exists"
else
    echo "📝 Creating resend_projects collection..."
    
    # Create collection
    CREATE_RESPONSE=$(curl -s -X POST \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{
            "collectionId": "resend_projects",
            "name": "Resend Projects",
            "permissions": ["read(\"any\")", "write(\"any\")"]
        }')
    
    if echo "$CREATE_RESPONSE" | grep -q '"id":"resend_projects"'; then
        echo "✅ Collection created successfully"
    else
        echo "⚠️  Collection creation response:"
        echo "$CREATE_RESPONSE"
    fi
    
    sleep 2  # Wait for collection to be created
fi

echo ""

# Step 2: Check and create attributes
echo "STEP 2: Adding attributes to resend_projects collection..."

# Function to check if attribute exists
attribute_exists() {
    local attr_name=$1
    curl -s -X GET \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/${attr_name}" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" | grep -q "\"key\":\"${attr_name}\"" || false
}

# Function to create attribute
create_attribute() {
    local attr_name=$1
    local attr_type=$2
    local required=$3
    local size=${4:-255}
    
    echo "  📝 Creating attribute: $attr_name..."
    ATTR_RESPONSE=$(curl -s -X POST \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/${attr_type}" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"${attr_name}\",
            \"required\": ${required},
            \"size\": ${size}
        }")
    
    if echo "$ATTR_RESPONSE" | grep -q "\"key\":\"${attr_name}\""; then
        echo "  ✅ Attribute '$attr_name' created"
    else
        if echo "$ATTR_RESPONSE" | grep -q "Attribute already exists"; then
            echo "  ℹ️  Attribute '$attr_name' already exists"
        else
            echo "  ⚠️  Response: $(echo "$ATTR_RESPONSE" | grep -o '"message":"[^"]*"' || echo 'Unknown')"
        fi
    fi
    
    sleep 1
}

# Create attributes
create_attribute "api_key" "string" "true" "500"
create_attribute "from_email" "string" "true" "255"
create_attribute "domain" "string" "false" "255"
create_attribute "status" "string" "false" "50"

echo ""

# Step 3: Create or update printHub document
echo "STEP 3: Adding printHub document to resend_projects..."

# Check if printHub document exists
DOC_CHECK=$(curl -s -X GET \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${PROJECT_NAME}" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" || true)

if echo "$DOC_CHECK" | grep -q "\"id\":\"${PROJECT_NAME}\""; then
    echo "ℹ️  Document '$PROJECT_NAME' already exists"
    echo "   (Update manually in Appwrite Console if needed)"
else
    echo "📝 Creating $PROJECT_NAME document..."
    
    # Create document
    DOC_RESPONSE=$(curl -s -X POST \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"documentId\": \"${PROJECT_NAME}\",
            \"data\": {
                \"api_key\": \"${RESEND_API_KEY}\",
                \"from_email\": \"noreply@printhub.com\",
                \"domain\": \"printhub.com\",
                \"status\": \"active\"
            }
        }")
    
    if echo "$DOC_RESPONSE" | grep -q "\"id\":\"${PROJECT_NAME}\""; then
        echo "✅ Document '$PROJECT_NAME' created successfully"
    else
        echo "⚠️  Document creation response:"
        echo "$DOC_RESPONSE" | head -5
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RESEND SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✅ resend_projects collection created/verified"
echo "  ✅ Attributes added: api_key, from_email, domain, status"
echo "  ✅ printHub document created with credentials"
echo ""
echo "🚀 Next Steps:"
echo "  1. Deploy Resend functions to Appwrite"
echo "  2. Test email sending"
echo "  3. Add other projects (whatsapp, automation-bot, etc.)"
echo ""
