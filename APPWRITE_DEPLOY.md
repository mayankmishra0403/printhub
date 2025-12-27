# 🚀 Auth0 Functions Deployment to Appwrite Console

**Time:** 5 minutes | **Difficulty:** Easy | **Status:** Ready to Deploy

---

## ⚡ Quick Links

1. **Appwrite Console:** https://cloud.appwrite.io
2. **Project ID:** `694ffb380028abb32fd2`
3. **Database:** `mcp_hub`
4. **Collection:** `auth0_projects`

---

## 🔑 Required Environment Variables

These are the **SAME for ALL 4 functions**. Set them once and copy-paste for each:

```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=694ffb380028abb32fd2
APPWRITE_API_KEY=[YOUR-API-KEY-HERE]
REDIRECT_URI=http://localhost:3000/api/auth/callback
NODE_ENV=development
```

⚠️ **Replace** `[YOUR-API-KEY-HERE]` with your actual Appwrite API Key from:
→ Settings → API Keys → Copy your key

---

## 📋 Deployment Checklist

### Function 1️⃣: `auth0-login`

**Name:** `auth0-login`  
**Runtime:** Node.js 18.0

**Code:**
```javascript
const { Client, Databases } = require('node-appwrite');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get Auth0 config from database
    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');
    
    const { code, state } = JSON.parse(req.payload || '{}');

    if (!code) {
      // Generate authorization URL
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

    // Exchange code for token
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
            if (tokens.access_token) {
              resolve(res.json({
                success: true,
                accessToken: tokens.access_token,
                idToken: tokens.id_token,
                refreshToken: tokens.refresh_token,
                expiresIn: tokens.expires_in,
                tokenType: tokens.token_type
              }));
            } else {
              resolve(res.json({ error: 'Token exchange failed' }, 401));
            }
          } catch (e) {
            resolve(res.json({ error: 'Parse error' }, 500));
          }
        });
      });

      authReq.on('error', (e) => {
        resolve(res.json({ error: e.message }, 500));
      });

      authReq.write(tokenData);
      authReq.end();
    });

  } catch (error) {
    return res.json({ error: error.message }, 500);
  }
};
```

✅ **Steps:**
1. Go to Appwrite Console → **Functions**
2. Click **Create Function**
3. Name: `auth0-login`
4. Runtime: **Node.js 18.0**
5. Click **Create**
6. **Paste the code above** in the editor
7. Go to **Settings** tab
8. Add the environment variables (copy from above)
9. Click **Deploy** ✅

---

### Function 2️⃣: `auth0-signup`

**Name:** `auth0-signup`  
**Runtime:** Node.js 18.0

**Code:**
```javascript
const { Client, Databases } = require('node-appwrite');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { email, password, firstName, lastName } = JSON.parse(req.payload || '{}');

    if (!email || !password) {
      return res.json({ error: 'Email and password required' }, 400);
    }

    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');

    // Get Management API token
    const https = require('https');
    const m2mData = JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: config.managementApiEndpoint + '/',
      grant_type: 'client_credentials'
    });

    return new Promise((resolve) => {
      const m2mOptions = {
        hostname: config.domain,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': m2mData.length
        }
      };

      const m2mReq = https.request(m2mOptions, (m2mRes) => {
        let m2mBody = '';
        m2mRes.on('data', chunk => m2mBody += chunk);
        m2mRes.on('end', () => {
          try {
            const m2m = JSON.parse(m2mBody);
            const mgmtToken = m2m.access_token;

            // Create user
            const userData = JSON.stringify({
              email: email,
              password: password,
              connection: 'Username-Password-Authentication',
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
                'Authorization': `Bearer ${mgmtToken}`,
                'Content-Type': 'application/json',
                'Content-Length': userData.length
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
                  resolve(res.json({ error: 'Failed to parse user response' }, 500));
                }
              });
            });

            userReq.on('error', (e) => {
              resolve(res.json({ error: e.message }, 500));
            });

            userReq.write(userData);
            userReq.end();

          } catch (e) {
            resolve(res.json({ error: 'Failed to get M2M token' }, 500));
          }
        });
      });

      m2mReq.on('error', (e) => {
        resolve(res.json({ error: e.message }, 500));
      });

      m2mReq.write(m2mData);
      m2mReq.end();
    });

  } catch (error) {
    return res.json({ error: error.message }, 500);
  }
};
```

✅ **Steps:**
1. Click **Create Function**
2. Name: `auth0-signup`
3. Runtime: **Node.js 18.0**
4. Click **Create**
5. **Paste the code above**
6. Go to **Settings** tab
7. Add the **same environment variables**
8. Click **Deploy** ✅

---

### Function 3️⃣: `auth0-password-reset`

**Name:** `auth0-password-reset`  
**Runtime:** Node.js 18.0

**Code:**
```javascript
const { Client, Databases } = require('node-appwrite');

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { email } = JSON.parse(req.payload || '{}');

    if (!email) {
      return res.json({ error: 'Email required' }, 400);
    }

    const config = await databases.getDocument('mcp_hub', 'auth0_projects', 'printHub');

    const https = require('https');
    const m2mData = JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: config.managementApiEndpoint + '/',
      grant_type: 'client_credentials'
    });

    return new Promise((resolve) => {
      const m2mOptions = {
        hostname: config.domain,
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': m2mData.length
        }
      };

      const m2mReq = https.request(m2mOptions, (m2mRes) => {
        let m2mBody = '';
        m2mRes.on('data', chunk => m2mBody += chunk);
        m2mRes.on('end', () => {
          try {
            const m2m = JSON.parse(m2mBody);
            const mgmtToken = m2m.access_token;

            // Send password reset email
            const resetData = JSON.stringify({
              client_id: config.clientId,
              email: email,
              connection: 'Username-Password-Authentication'
            });

            const resetOptions = {
              hostname: config.domain,
              path: '/api/v2/tickets/password-change',
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${mgmtToken}`,
                'Content-Type': 'application/json',
                'Content-Length': resetData.length
              }
            };

            const resetReq = https.request(resetOptions, (resetRes) => {
              let resetBody = '';
              resetRes.on('data', chunk => resetBody += chunk);
              resetRes.on('end', () => {
                resolve(res.json({
                  success: true,
                  message: 'Password reset email sent',
                  email: email
                }));
              });
            });

            resetReq.on('error', (e) => {
              resolve(res.json({ error: e.message }, 500));
            });

            resetReq.write(resetData);
            resetReq.end();

          } catch (e) {
            resolve(res.json({ error: 'Failed to get M2M token' }, 500));
          }
        });
      });

      m2mReq.on('error', (e) => {
        resolve(res.json({ error: e.message }, 500));
      });

      m2mReq.write(m2mData);
      m2mReq.end();
    });

  } catch (error) {
    return res.json({ error: error.message }, 500);
  }
};
```

✅ **Steps:**
1. Click **Create Function**
2. Name: `auth0-password-reset`
3. Runtime: **Node.js 18.0**
4. Click **Create**
5. **Paste the code above**
6. Go to **Settings** tab
7. Add the **same environment variables**
8. Click **Deploy** ✅

---

### Function 4️⃣: `auth0-profile`

**Name:** `auth0-profile`  
**Runtime:** Node.js 18.0

**Code:**
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
    const https = require('https');

    if (req.method === 'GET') {
      // Get user profile
      const { userId, email } = JSON.parse(req.payload || '{}');

      if (!userId && !email) {
        return res.json({ error: 'userId or email required' }, 400);
      }

      // Get M2M token
      const m2mData = JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        audience: config.managementApiEndpoint + '/',
        grant_type: 'client_credentials'
      });

      return new Promise((resolve) => {
        const m2mOptions = {
          hostname: config.domain,
          path: '/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': m2mData.length
          }
        };

        const m2mReq = https.request(m2mOptions, (m2mRes) => {
          let m2mBody = '';
          m2mRes.on('data', chunk => m2mBody += chunk);
          m2mRes.on('end', () => {
            try {
              const m2m = JSON.parse(m2mBody);
              const mgmtToken = m2m.access_token;

              let path = userId ? `/api/v2/users/${userId}` : `/api/v2/users-by-email?email=${encodeURIComponent(email)}`;

              const userOptions = {
                hostname: config.domain,
                path: path,
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${mgmtToken}`
                }
              };

              const userReq = https.request(userOptions, (userRes) => {
                let userBody = '';
                userRes.on('data', chunk => userBody += chunk);
                userRes.on('end', () => {
                  try {
                    let user = JSON.parse(userBody);
                    if (Array.isArray(user)) user = user[0];
                    
                    resolve(res.json({
                      success: true,
                      user: user
                    }));
                  } catch (e) {
                    resolve(res.json({ error: 'Parse error' }, 500));
                  }
                });
              });

              userReq.on('error', (e) => {
                resolve(res.json({ error: e.message }, 500));
              });

              userReq.end();

            } catch (e) {
              resolve(res.json({ error: 'Failed to get M2M token' }, 500));
            }
          });
        });

        m2mReq.on('error', (e) => {
          resolve(res.json({ error: e.message }, 500));
        });

        m2mReq.write(m2mData);
        m2mReq.end();
      });

    } else if (req.method === 'PATCH') {
      // Update user profile
      const { userId, updates } = JSON.parse(req.payload || '{}');

      if (!userId || !updates) {
        return res.json({ error: 'userId and updates required' }, 400);
      }

      // Get M2M token
      const m2mData = JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        audience: config.managementApiEndpoint + '/',
        grant_type: 'client_credentials'
      });

      return new Promise((resolve) => {
        const m2mOptions = {
          hostname: config.domain,
          path: '/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': m2mData.length
          }
        };

        const m2mReq = https.request(m2mOptions, (m2mRes) => {
          let m2mBody = '';
          m2mRes.on('data', chunk => m2mBody += chunk);
          m2mRes.on('end', () => {
            try {
              const m2m = JSON.parse(m2mBody);
              const mgmtToken = m2m.access_token;

              const updateData = JSON.stringify(updates);

              const updateOptions = {
                hostname: config.domain,
                path: `/api/v2/users/${userId}`,
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${mgmtToken}`,
                  'Content-Type': 'application/json',
                  'Content-Length': updateData.length
                }
              };

              const updateReq = https.request(updateOptions, (updateRes) => {
                let updateBody = '';
                updateRes.on('data', chunk => updateBody += chunk);
                updateRes.on('end', () => {
                  try {
                    const user = JSON.parse(updateBody);
                    resolve(res.json({
                      success: true,
                      user: user,
                      message: 'User updated successfully'
                    }));
                  } catch (e) {
                    resolve(res.json({ error: 'Parse error' }, 500));
                  }
                });
              });

              updateReq.on('error', (e) => {
                resolve(res.json({ error: e.message }, 500));
              });

              updateReq.write(updateData);
              updateReq.end();

            } catch (e) {
              resolve(res.json({ error: 'Failed to get M2M token' }, 500));
            }
          });
        });

        m2mReq.on('error', (e) => {
          resolve(res.json({ error: e.message }, 500));
        });

        m2mReq.write(m2mData);
        m2mReq.end();
      });
    }

  } catch (error) {
    return res.json({ error: error.message }, 500);
  }
};
```

✅ **Steps:**
1. Click **Create Function**
2. Name: `auth0-profile`
3. Runtime: **Node.js 18.0**
4. Click **Create**
5. **Paste the code above**
6. Go to **Settings** tab
7. Add the **same environment variables**
8. Click **Deploy** ✅

---

## ✅ Verification Checklist

After deploying all 4 functions:

- [ ] `auth0-login` deployed ✅
- [ ] `auth0-signup` deployed ✅
- [ ] `auth0-password-reset` deployed ✅
- [ ] `auth0-profile` deployed ✅
- [ ] All have environment variables set
- [ ] All show "Deployed" status in console
- [ ] Can see function URLs

---

## 🔗 Function URLs (After Deployment)

```
auth0-login:
https://fra.cloud.appwrite.io/v1/functions/auth0-login

auth0-signup:
https://fra.cloud.appwrite.io/v1/functions/auth0-signup

auth0-password-reset:
https://fra.cloud.appwrite.io/v1/functions/auth0-password-reset

auth0-profile:
https://fra.cloud.appwrite.io/v1/functions/auth0-profile
```

---

## 🎯 Next Steps

After deployment:

1. **Test Functions** (5 min)
   - See: `TESTING_QUICK.md`
   - Run curl commands to verify

2. **Integrate with Frontend** (5 min)
   - See: `APPWRITE_INTEGRATE.md`
   - Copy API routes

---

## 🆘 Troubleshooting

**Function won't deploy?**
- Check environment variables are set
- Verify Appwrite API Key is correct
- Check console logs for errors

**Can't get Appwrite API Key?**
- Go to Appwrite Console → Settings → API Keys
- Click "Create New API Key"
- Copy and paste into function settings

**Still having issues?**
- Check `TESTING_QUICK.md` for common errors
- Verify Auth0 credentials in `mcp_hub/auth0_projects/printHub`

---

**Status:** ✅ Ready to Deploy  
**Time:** ~5 minutes  
**Difficulty:** Easy  
**Updated:** Dec 27, 2024
