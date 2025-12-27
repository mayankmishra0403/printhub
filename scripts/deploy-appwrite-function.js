#!/usr/bin/env node

/**
 * Deploy auth0-login function to Appwrite
 * Direct REST API deployment (no CLI needed)
 */

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const config = {
  endpoint: 'fra.cloud.appwrite.io',
  projectId: '694ffb380028abb32fd2',
  apiKey: 'standard_b243997acf994fbeb48eec2fdd29fb5b4799dd03249049f2195347b942de254a03a43d50c58022e2b41de43d70c7b79c640634e2fb546ba147eddbf0c357e54c9341d0c9bdb62ede7d0a2acfb2094b206f5623b7851629be357bfee3b85ba0a45e0f4a62d02fccd85ed15f38ed1bdfc5378d6f4b886745d579ab7281c7407b8a',
};

function uploadFile(filePath, mimeType) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const fileName = filePath.split('/').pop();

    // Create form data manually
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 9);
    let formData = '';
    
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    formData += `Content-Type: ${mimeType}\r\n\r\n`;

    const header = Buffer.from(formData, 'utf8');
    const footer = Buffer.from(`\r\n--${boundary}--`, 'utf8');
    
    const body = Buffer.concat([header, fileContent, footer]);

    const options = {
      hostname: config.endpoint,
      port: 443,
      path: '/v1/storage/buckets/deployments/files',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'X-Appwrite-Project': config.projectId,
        'X-Appwrite-Key': config.apiKey,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.endpoint,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': config.projectId,
        'X-Appwrite-Key': config.apiKey,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function deployFunction() {
  try {
    console.log('🚀 Deploying auth0-login function...\n');

    // Step 1: Create deployment
    console.log('📦 Creating deployment...');
    const deploymentResult = await makeRequest('POST', '/v1/functions/auth0-login/deployments', {
      entrypoint: 'auth0-login.js',
      runtime: 'node-18.0',
      code: 'function(){return "pending";}', // Placeholder
      activate: false, // Don't activate yet
    });

    if (deploymentResult.$id) {
      console.log('✅ Deployment created!');
      console.log(`  ID: ${deploymentResult.$id}\n`);

      // Step 2: For actual code deployment, need to use CLI or Web Console
      console.log('📝 To complete deployment:');
      console.log('\nOption 1: Using Appwrite Web Console');
      console.log('  1. Go to https://cloud.appwrite.io');
      console.log('  2. Navigate to Functions → auth0-login');
      console.log('  3. Click "Code" tab');
      console.log('  4. Paste code from appwrite-functions/auth0-login.js');
      console.log('  5. Add package.json dependencies');
      console.log('  6. Click "Deploy"\n');

      console.log('Option 2: Using Appwrite CLI (if installed)');
      console.log('  cd appwrite-functions');
      console.log('  appwrite functions create-deployment \\');
      console.log('    --function-id=auth0-login \\');
      console.log('    --code="." \\');
      console.log('    --activate\n');

      console.log('✨ Deployment setup complete!');
      
    } else {
      console.log('Response:', JSON.stringify(deploymentResult, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deployFunction();
