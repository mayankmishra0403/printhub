#!/usr/bin/env node

/**
 * Setup Appwrite Auth0 Collection & MCP Configuration (Using REST API)
 */

const http = require('https');

const APPWRITE_CONFIG = {
  endpoint: 'fra.cloud.appwrite.io',
  projectId: '694ffb380028abb32fd2',
  apiKey: 'standard_b243997acf994fbeb48eec2fdd29fb5b4799dd03249049f2195347b942de254a03a43d50c58022e2b41de43d70c7b79c640634e2fb546ba147eddbf0c357e54c9341d0c9bdb62ede7d0a2acfb2094b206f5623b7851629be357bfee3b85ba0a45e0f4a62d02fccd85ed15f38ed1bdfc5378d6f4b886745d579ab7281c7407b8a',
};

const AUTH0_CONFIG = {
  domain: 'login.ritambharat.software',
  clientId: 'JqvWx2irDcCaWHYXr3bJcH0JpJBokKax',
  clientSecret: 'YtM7kSPcGrSLjWrYctUzr_uR6K9eMyKha4TkusnneQ4q-eRn1et9tvdrKfdw46yi',
  managementApiEndpoint: 'https://ritambharat.jp.auth0.com/api/v2/',
};

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: APPWRITE_CONFIG.endpoint,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Key': APPWRITE_CONFIG.apiKey,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function setupAuth0MCP() {
  try {
    console.log('🚀 Setting up Auth0 MCP in Appwrite...\n');

    const dbName = 'mcp_hub';
    const collectionName = 'auth0_projects';

    // Step 1: Create database
    console.log('📦 Creating/checking database...');
    try {
      await request('POST', '/v1/databases', {
        databaseId: 'mcp_hub',
        name: 'MCP Hub',
      });
      console.log('✅ Database created\n');
    } catch (e) {
      console.log('✅ Database already exists\n');
    }

    // Step 2: Create collection
    console.log('📝 Creating/checking collection...');
    try {
      await request('POST', `/v1/databases/${dbName}/collections`, {
        collectionId: collectionName,
        name: 'Auth0 Projects',
        permissions: ['role:all'],
        documentSecurity: true,
      });
      console.log('✅ Collection created\n');
    } catch (e) {
      console.log('✅ Collection already exists\n');
    }

    // Step 3: Add attributes
    console.log('📋 Adding attributes...');
    const attributes = [
      ['projectName', 'string', true],
      ['domain', 'string', true],
      ['clientId', 'string', true],
      ['clientSecret', 'string', true],
      ['managementApiEndpoint', 'string', true],
    ];

    for (const [key, type, required] of attributes) {
      try {
        await request('POST', `/v1/databases/${dbName}/collections/${collectionName}/attributes/${type}`, {
          key: key,
          size: 500,
          required: required,
        });
        console.log(`  ✓ Added "${key}"`);
      } catch (e) {
        console.log(`  ✓ "${key}" already exists`);
      }
    }
    console.log('✅ Attributes added\n');

    // Step 4: Create PrintHub document
    console.log('🔐 Creating PrintHub Auth0 configuration...');
    await request('POST', `/v1/databases/${dbName}/collections/${collectionName}/documents`, {
      documentId: 'printHub',
      data: {
        projectName: 'printHub',
        domain: AUTH0_CONFIG.domain,
        clientId: AUTH0_CONFIG.clientId,
        clientSecret: AUTH0_CONFIG.clientSecret,
        managementApiEndpoint: AUTH0_CONFIG.managementApiEndpoint,
      },
      permissions: ['role:all'],
    });
    console.log('✅ PrintHub configuration created\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Auth0 MCP Setup Complete!\n');
    console.log('📊 Configuration:');
    console.log(`  • Database: ${dbName}`);
    console.log(`  • Collection: ${collectionName}`);
    console.log(`  • Document: printHub`);
    console.log(`  • Domain: ${AUTH0_CONFIG.domain}`);
    console.log(`  • Status: ✅ Active\n`);
    console.log('🔗 Next: Create Auth0 Functions in Appwrite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAuth0MCP();
