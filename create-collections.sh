#!/bin/bash

set -e

APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CREATING AUTH0_PROJECTS COLLECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create auth0_projects collection
AUTH0_RESPONSE=$(curl -s -X POST \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "collectionId": "auth0_projects",
        "name": "Auth0 Projects",
        "permissions": ["read(\"any\")", "write(\"any\")"]
    }')

if echo "$AUTH0_RESPONSE" | grep -q '"id":"auth0_projects"'; then
    echo "✅ auth0_projects collection created"
else
    if echo "$AUTH0_RESPONSE" | grep -q "already exists"; then
        echo "ℹ️  auth0_projects already exists"
    else
        echo "Response: $AUTH0_RESPONSE"
    fi
fi

sleep 2

# Add attributes to auth0_projects
echo "📝 Adding attributes to auth0_projects..."

for attr in "client_id:string:true:255" "client_secret:string:true:500" "domain:string:true:255" "audience:string:false:255"; do
    IFS=: read key type required size <<< "$attr"
    
    curl -s -X POST \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/auth0_projects/attributes/${type}" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"${key}\",
            \"required\": ${required},
            \"size\": ${size}
        }" > /dev/null 2>&1
    
    echo "  ✅ $key (${type})"
    sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 CREATING RESEND_PROJECTS COLLECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create resend_projects collection
RESEND_RESPONSE=$(curl -s -X POST \
    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections" \
    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "collectionId": "resend_projects",
        "name": "Resend Projects",
        "permissions": ["read(\"any\")", "write(\"any\")"]
    }')

if echo "$RESEND_RESPONSE" | grep -q '"id":"resend_projects"'; then
    echo "✅ resend_projects collection created"
else
    if echo "$RESEND_RESPONSE" | grep -q "already exists"; then
        echo "ℹ️  resend_projects already exists"
    else
        echo "Response: $RESEND_RESPONSE"
    fi
fi

sleep 2

# Add attributes to resend_projects
echo "📝 Adding attributes to resend_projects..."

for attr in "api_key:string:true:500" "from_email:string:true:255" "domain:string:false:255" "status:string:false:50"; do
    IFS=: read key type required size <<< "$attr"
    
    curl -s -X POST \
        "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/resend_projects/attributes/${type}" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"${key}\",
            \"required\": ${required},
            \"size\": ${size}
        }" > /dev/null 2>&1
    
    echo "  ✅ $key (${type})"
    sleep 1
done

echo ""
echo "✅ COLLECTIONS CREATED SUCCESSFULLY!"
echo ""
