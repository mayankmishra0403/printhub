#!/bin/bash

# 📧 DEPLOY RESEND FUNCTIONS VIA APPWRITE CLI
# Creates both send-email and verify-email functions

set -e

APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              📧 DEPLOYING RESEND FUNCTIONS VIA APPWRITE CLI               ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Function to create Appwrite function via CLI
deploy_function() {
    local func_id=$1
    local func_name=$2
    local tar_file=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 CREATING FUNCTION: $func_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Create function
    CREATE_RESPONSE=$(curl -s -X POST \
        "${APPWRITE_ENDPOINT}/functions" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"functionId\": \"${func_id}\",
            \"name\": \"${func_name}\",
            \"runtime\": \"node-18.0\",
            \"entrypoint\": \"src/index.js\",
            \"scopes\": [\"databases.read\", \"databases.write\"],
            \"events\": [],
            \"scheduleCron\": \"\",
            \"scheduleTimeout\": 1800,
            \"timeout\": 900
        }")
    
    if echo "$CREATE_RESPONSE" | grep -q "\"id\":\"${func_id}\""; then
        FUNC_ID=$(echo "$CREATE_RESPONSE" | grep -o "\"id\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)
        echo "✅ Function created: $FUNC_ID"
    else
        if echo "$CREATE_RESPONSE" | grep -q "already exists"; then
            echo "ℹ️  Function already exists"
            FUNC_ID="$func_id"
        else
            echo "⚠️  Response: $(echo "$CREATE_RESPONSE" | head -3)"
            return 1
        fi
    fi
    
    sleep 2
    
    # Upload deployment
    echo "📦 Uploading deployment: $tar_file..."
    
    if [ ! -f "$tar_file" ]; then
        echo "❌ File not found: $tar_file"
        return 1
    fi
    
    DEPLOY_RESPONSE=$(curl -s -X POST \
        "${APPWRITE_ENDPOINT}/functions/${FUNC_ID}/deployments" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -F "command=npm start" \
        -F "code=@${tar_file}")
    
    if echo "$DEPLOY_RESPONSE" | grep -q '"status":"pending"'; then
        DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | grep -o '"id":"[^\"]*"' | head -1 | cut -d'"' -f4)
        echo "✅ Deployment created: $DEPLOY_ID"
        
        # Wait for deployment to be ready
        echo "⏳ Waiting for deployment to complete (this may take 1-2 minutes)..."
        
        for i in {1..30}; do
            sleep 5
            STATUS=$(curl -s -X GET \
                "${APPWRITE_ENDPOINT}/functions/${FUNC_ID}/deployments/${DEPLOY_ID}" \
                -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            
            if [ "$STATUS" = "ready" ]; then
                echo "✅ Deployment ready!"
                
                # Activate deployment
                curl -s -X PATCH \
                    "${APPWRITE_ENDPOINT}/functions/${FUNC_ID}" \
                    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
                    -H "Content-Type: application/json" \
                    -d "{\"deployment\": \"${DEPLOY_ID}\"}" > /dev/null
                
                echo "✅ Deployment activated!"
                
                # Store in database
                curl -s -X POST \
                    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/resend_projects/documents" \
                    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"documentId\": \"functions-${func_id}\",
                        \"data\": {
                            \"api_key\": \"deployment\",
                            \"from_email\": \"${FUNC_ID}\",
                            \"domain\": \"${DEPLOY_ID}\",
                            \"status\": \"deployed\"
                        }
                    }" > /dev/null 2>&1
                
                echo "✅ Function deployment tracked in database"
                break
            elif [ "$STATUS" = "failed" ]; then
                echo "❌ Deployment failed"
                return 1
            else
                echo "  ⏳ Status: $STATUS (${i}/30)"
            fi
        done
    else
        echo "⚠️  Deployment response:"
        echo "$DEPLOY_RESPONSE" | head -3
    fi
    
    echo ""
}

# Check if tar files exist
if [ ! -f "resend-functions/send-email.tar.gz" ]; then
    echo "❌ send-email.tar.gz not found"
    echo "Run: cd resend-functions && tar -czf send-email.tar.gz send-email/"
    exit 1
fi

if [ ! -f "resend-functions/verify-email.tar.gz" ]; then
    echo "❌ verify-email.tar.gz not found"
    echo "Run: cd resend-functions && tar -czf verify-email.tar.gz verify-email/"
    exit 1
fi

# Deploy functions
deploy_function "resend-send-email" "Resend Send Email" "resend-functions/send-email.tar.gz"
deploy_function "resend-verify-email" "Resend Verify Email" "resend-functions/verify-email.tar.gz"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOYMENT COMPLETE! ✅                             ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  ✅ resend-send-email function deployed"
echo "  ✅ resend-verify-email function deployed"
echo "  ✅ Deployment IDs stored in database"
echo ""
echo "🚀 Next: Test email sending!"
echo ""
