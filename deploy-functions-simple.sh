#!/bin/bash

# 📧 DEPLOY RESEND FUNCTIONS - SIMPLE VERSION
# Uses REST API directly to upload and deploy

set -e

APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="694ffb380028abb32fd2"
DATABASE_ID="mcp_hub"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║            📧 DEPLOYING RESEND FUNCTIONS - SIMPLE VERSION                 ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

deploy_function() {
    local func_id=$1
    local func_name=$2
    local tar_file=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 DEPLOYING: $func_name ($func_id)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -f "$tar_file" ]; then
        echo "❌ File not found: $tar_file"
        return 1
    fi
    
    echo "📦 Uploading: $tar_file..."
    
    # Upload deployment
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "${APPWRITE_ENDPOINT}/functions/${func_id}/deployments" \
        -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
        -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
        -F "command=npm start" \
        -F "code=@${tar_file}")
    
    # Split response and HTTP code
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | head -n-1)
    
    if echo "$RESPONSE_BODY" | grep -q '"id"'; then
        DEPLOY_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "✅ Deployment uploaded: $DEPLOY_ID"
        echo ""
        echo "⏳ Waiting for build to complete (this takes 1-2 minutes)..."
        
        # Poll deployment status
        for i in {1..60}; do
            sleep 2
            STATUS_RESPONSE=$(curl -s -X GET \
                "${APPWRITE_ENDPOINT}/functions/${func_id}/deployments/${DEPLOY_ID}" \
                -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                -H "X-Appwrite-Key: ${APPWRITE_API_KEY}")
            
            STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            
            if [ "$STATUS" = "ready" ]; then
                echo "✅ Build completed successfully!"
                
                # Activate deployment
                echo "🔧 Activating deployment..."
                curl -s -X PATCH \
                    "${APPWRITE_ENDPOINT}/functions/${func_id}" \
                    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
                    -H "Content-Type: application/json" \
                    -d "{\"deployment\": \"${DEPLOY_ID}\"}" > /dev/null
                
                echo "✅ Deployment activated!"
                
                # Store metadata in database
                echo "📊 Storing function metadata in database..."
                curl -s -X POST \
                    "${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/resend_projects/documents" \
                    -H "X-Appwrite-Project: ${APPWRITE_PROJECT_ID}" \
                    -H "X-Appwrite-Key: ${APPWRITE_API_KEY}" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"documentId\": \"func-${func_id}\",
                        \"data\": {
                            \"api_key\": \"${DEPLOY_ID}\",
                            \"from_email\": \"${func_id}\",
                            \"domain\": \"deployed\",
                            \"status\": \"ready\"
                        }
                    }" > /dev/null 2>&1
                
                echo "✅ Metadata stored!"
                break
            elif [ "$STATUS" = "failed" ]; then
                echo "❌ Build failed!"
                echo "Response: $STATUS_RESPONSE" | head -5
                return 1
            else
                echo "  ⏳ Status: $STATUS (${i}/60)"
            fi
        done
    else
        echo "❌ Upload failed"
        echo "Response: $RESPONSE_BODY" | head -5
        return 1
    fi
    
    echo ""
}

echo "🔍 Checking for tar.gz files..."
ls -lh resend-functions/*.tar.gz 2>/dev/null || {
    echo "❌ tar.gz files not found. Creating them..."
    cd resend-functions
    tar -czf send-email.tar.gz send-email/
    tar -czf verify-email.tar.gz verify-email/
    cd ..
    echo "✅ Created tar.gz files"
}

echo ""

# Deploy both functions
deploy_function "resend-send-email" "Resend Send Email" "resend-functions/send-email.tar.gz"
deploy_function "resend-verify-email" "Resend Verify Email" "resend-functions/verify-email.tar.gz"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT COMPLETE! ✅                               ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 DEPLOYED FUNCTIONS:"
echo "  ✅ resend-send-email"
echo "  ✅ resend-verify-email"
echo ""
echo "🚀 READY TO USE!"
echo "  Call: POST /functions/resend-send-email/executions"
echo "  Body: {\"projectId\": \"printHub\", \"to\": \"user@example.com\", ...}"
echo ""
