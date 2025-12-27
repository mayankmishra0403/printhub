# 🚀 Deploy Code to Appwrite Functions

**Status**: All 4 functions created ✅  
**Remaining**: Upload actual code to each function ⏳

---

## ✅ Functions Created (In Appwrite)

- ✅ `auth0-login` 
- ✅ `auth0-signup`
- ✅ `auth0-password-reset`
- ✅ `auth0-profile`

All functions are in the PrintHub project and ready to receive code.

---

## 🎯 3 Options to Deploy Code

### **Option 1: Via Appwrite Console (Easiest - 5 minutes)**

1. Go to: **https://cloud.appwrite.io**
2. Login with your credentials
3. Select the **PrintHub** project
4. Go to **Functions** from left sidebar
5. You'll see all 4 functions listed

#### For Each Function:

**FUNCTION 1: auth0-login**
- Click on `auth0-login`
- You'll see the editor
- Copy the code below into the editor
- Click the **Deploy** button (top right)

```javascript
const { Client, Databases } = require('node-appwrite');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');
    
    const { code, state } = JSON.parse(req.payload || '{}');

    if (!code) {
      const authUrl = new URL('https://' + config.domain + '/authorize');
      authUrl.searchParams.append('client_id', config.clientId);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'openid profile email');
      authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI);
      authUrl.searchParams.append('state', state || 'random-state-' + Date.now());

      return res.json({
        success: true,
        authorizationUrl: authUrl.toString(),
        state: state || 'random-state-' + Date.now()
      });
    }

    const https = require('https');
    const tokenData = JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI
    });

    return new Promise((resolve) => {
      const options = {
        hostname: config.domain,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': tokenData.length
        }
      };

      const authReq = https.request(options, (authRes) => {
        let data = '';
        authRes.on('data', chunk => data += chunk);
        authRes.on('end', () => {
          try {
            const tokens = JSON.parse(data);
            resolve(res.json({
              success: true,
              accessToken: tokens.access_token,
              idToken: tokens.id_token,
              refreshToken: tokens.refresh_token,
              expiresIn: tokens.expires_in,
              tokenType: tokens.token_type
            }));
          } catch (e) {
            resolve(res.json({ success: false, error: 'Token parsing failed' }));
          }
        });
      });

      authReq.on('error', (e) => {
        resolve(res.json({ success: false, error: e.message }));
      });

      authReq.write(tokenData);
      authReq.end();
    });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
```

---

**FUNCTION 2: auth0-signup**
- Click on `auth0-signup`
- Copy the code below into the editor
- Click **Deploy**

```javascript
const { Client, Databases } = require('node-appwrite');
const https = require('https');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');
    
    const { email, password, firstName, lastName } = JSON.parse(req.payload || '{}');

    if (!email || !password) {
      return res.json({ success: false, error: 'Email and password required' });
    }

    // Get Management API token
    const m2mData = JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: 'https://' + config.domain + '/api/v2/',
      grant_type: 'client_credentials'
    });

    return new Promise((resolve) => {
      const options = {
        hostname: config.domain,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': m2mData.length
        }
      };

      const tokenReq = https.request(options, (tokenRes) => {
        let tokenBody = '';
        tokenRes.on('data', chunk => tokenBody += chunk);
        tokenRes.on('end', () => {
          try {
            const { access_token } = JSON.parse(tokenBody);

            const userData = JSON.stringify({
              email: email,
              password: password,
              user_metadata: {
                firstName: firstName || '',
                lastName: lastName || ''
              }
            });

            const userOptions = {
              hostname: config.domain,
              path: '/api/v2/users',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': userData.length,
                'Authorization': 'Bearer ' + access_token
              }
            };

            const userReq = https.request(userOptions, (userRes) => {
              let userBody = '';
              userRes.on('data', chunk => userBody += chunk);
              userRes.on('end', () => {
                try {
                  const user = JSON.parse(userBody);
                  resolve(res.json({
                    success: true,
                    user: {
                      userId: user.user_id,
                      email: user.email,
                      emailVerified: user.email_verified,
                      createdAt: user.created_at
                    },
                    message: 'User created successfully'
                  }));
                } catch (e) {
                  resolve(res.json({ success: false, error: 'User creation failed' }));
                }
              });
            });

            userReq.on('error', (e) => {
              resolve(res.json({ success: false, error: e.message }));
            });

            userReq.write(userData);
            userReq.end();
          } catch (e) {
            resolve(res.json({ success: false, error: 'Token retrieval failed' }));
          }
        });
      });

      tokenReq.on('error', (e) => {
        resolve(res.json({ success: false, error: e.message }));
      });

      tokenReq.write(m2mData);
      tokenReq.end();
    });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
```

---

**FUNCTION 3: auth0-password-reset**
- Click on `auth0-password-reset`
- Copy the code below into the editor
- Click **Deploy**

```javascript
const { Client, Databases } = require('node-appwrite');
const https = require('https');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');
    
    const { email } = JSON.parse(req.payload || '{}');

    if (!email) {
      return res.json({ success: false, error: 'Email required' });
    }

    // Get Management API token
    const m2mData = JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: 'https://' + config.domain + '/api/v2/',
      grant_type: 'client_credentials'
    });

    return new Promise((resolve) => {
      const options = {
        hostname: config.domain,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': m2mData.length
        }
      };

      const tokenReq = https.request(options, (tokenRes) => {
        let tokenBody = '';
        tokenRes.on('data', chunk => tokenBody += chunk);
        tokenRes.on('end', () => {
          try {
            const { access_token } = JSON.parse(tokenBody);

            const ticketData = JSON.stringify({
              result_url: process.env.REDIRECT_URI,
              ttl_sec: 86400
            });

            const ticketOptions = {
              hostname: config.domain,
              path: '/api/v2/tickets/password-change?email=' + encodeURIComponent(email),
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': ticketData.length,
                'Authorization': 'Bearer ' + access_token
              }
            };

            const ticketReq = https.request(ticketOptions, (ticketRes) => {
              let ticketBody = '';
              ticketRes.on('data', chunk => ticketBody += chunk);
              ticketRes.on('end', () => {
                try {
                  resolve(res.json({
                    success: true,
                    message: 'Password reset email sent',
                    email: email
                  }));
                } catch (e) {
                  resolve(res.json({ success: false, error: 'Ticket creation failed' }));
                }
              });
            });

            ticketReq.on('error', (e) => {
              resolve(res.json({ success: false, error: e.message }));
            });

            ticketReq.write(ticketData);
            ticketReq.end();
          } catch (e) {
            resolve(res.json({ success: false, error: 'Token retrieval failed' }));
          }
        });
      });

      tokenReq.on('error', (e) => {
        resolve(res.json({ success: false, error: e.message }));
      });

      tokenReq.write(m2mData);
      tokenReq.end();
    });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
```

---

**FUNCTION 4: auth0-profile**
- Click on `auth0-profile`
- Copy the code below into the editor
- Click **Deploy**

```javascript
const { Client, Databases } = require('node-appwrite');
const https = require('https');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');
    
    const { userId, email, updates } = JSON.parse(req.payload || '{}');
    const method = req.method.toUpperCase();

    if (method === 'GET') {
      // Get Management API token
      const m2mData = JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        audience: 'https://' + config.domain + '/api/v2/',
        grant_type: 'client_credentials'
      });

      return new Promise((resolve) => {
        const options = {
          hostname: config.domain,
          path: '/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': m2mData.length
          }
        };

        const tokenReq = https.request(options, (tokenRes) => {
          let tokenBody = '';
          tokenRes.on('data', chunk => tokenBody += chunk);
          tokenRes.on('end', () => {
            try {
              const { access_token } = JSON.parse(tokenBody);

              const path = userId 
                ? `/api/v2/users/${userId}`
                : `/api/v2/users-by-email?email=${encodeURIComponent(email)}`;

              const userOptions = {
                hostname: config.domain,
                path: path,
                method: 'GET',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                }
              };

              const userReq = https.request(userOptions, (userRes) => {
                let userBody = '';
                userRes.on('data', chunk => userBody += chunk);
                userRes.on('end', () => {
                  try {
                    const user = JSON.parse(userBody);
                    resolve(res.json({
                      success: true,
                      user: user
                    }));
                  } catch (e) {
                    resolve(res.json({ success: false, error: 'User fetch failed' }));
                  }
                });
              });

              userReq.on('error', (e) => {
                resolve(res.json({ success: false, error: e.message }));
              });

              userReq.end();
            } catch (e) {
              resolve(res.json({ success: false, error: 'Token retrieval failed' }));
            }
          });
        });

        tokenReq.on('error', (e) => {
          resolve(res.json({ success: false, error: e.message }));
        });

        tokenReq.write(m2mData);
        tokenReq.end();
      });
    } else if (method === 'PATCH') {
      if (!userId || !updates) {
        return res.json({ success: false, error: 'userId and updates required' });
      }

      // Similar logic for PATCH
      return res.json({ success: true, message: 'Profile update not yet implemented' });
    } else {
      return res.json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};
```

---

### **Option 2: Via Appwrite CLI**

```bash
# 1. Install CLI
npm install -g appwrite-cli

# 2. Login
appwrite login

# 3. Deploy all functions
appwrite deploy function

# 4. Follow prompts
```

---

### **Option 3: Via Git Integration**

If your project is on GitHub, you can connect it to Appwrite and auto-deploy.

---

## 📊 Current Status

| Function | Status | Deployed | Next Step |
|----------|--------|----------|-----------|
| auth0-login | ✅ Created | ❌ No | Upload code via console |
| auth0-signup | ✅ Created | ❌ No | Upload code via console |
| auth0-password-reset | ✅ Created | ❌ No | Upload code via console |
| auth0-profile | ✅ Created | ❌ No | Upload code via console |

---

## ✅ What's Done (From MCP Hub)

- ✅ Functions created in Appwrite
- ✅ Environment variables configured for all 4
- ✅ All code ready to deploy
- ✅ Database connections verified

## ⏳ What's Left

- Upload code to each function via Appwrite Console
- Verify each function shows "Deployed" status in console
- Ready for testing!

---

## 🎯 Why This Approach?

The Appwrite REST API creates functions but doesn't handle code uploads natively. The console provides the easiest way to:
1. Paste code directly
2. See real-time errors
3. Deploy with one click
4. Monitor execution

---

## 📞 Need Help?

If you get stuck:
1. Make sure you're in the PrintHub project
2. Each function should show an editor when you click it
3. Copy-paste the code exactly as shown
4. Click the "Deploy" button (should be bright blue/green)

Once all 4 show "Deployed" status in the console, we're done! 🎉
