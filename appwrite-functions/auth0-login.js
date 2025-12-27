const { Client, Databases } = require('node-appwrite');

// This function handles Auth0 login for PrintHub
// Triggered via HTTP POST request

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '694ffb380028abb32fd2')
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { email, password } = JSON.parse(req.payload || '{}');

    if (!email || !password) {
      return res.json(
        { error: 'Email and password required' },
        400
      );
    }

    // Get Auth0 config from Appwrite database
    const auth0Config = await databases.getDocument(
      'mcp_hub',
      'auth0_projects',
      'printHub'
    );

    // Call Auth0 login endpoint
    const https = require('https');
    
    const postData = JSON.stringify({
      client_id: auth0Config.clientId,
      client_secret: auth0Config.clientSecret,
      audience: auth0Config.managementApiEndpoint,
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      username: email,
      password: password,
      realm: 'Username-Password-Authentication',
      scope: 'openid profile email offline_access',
    });

    const options = {
      hostname: auth0Config.domain,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    };

    return new Promise((resolve) => {
      const req = https.request(options, (authRes) => {
        let data = '';
        authRes.on('data', chunk => data += chunk);
        authRes.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.access_token) {
              resolve(res.json({
                success: true,
                token: response.access_token,
                expiresIn: response.expires_in,
                tokenType: response.token_type,
              }));
            } else {
              resolve(res.json({
                error: 'Authentication failed',
                details: response,
              }, 401));
            }
          } catch (e) {
            resolve(res.json({
              error: 'Failed to parse Auth0 response',
            }, 500));
          }
        });
      });

      req.on('error', (error) => {
        resolve(res.json({
          error: 'Auth0 connection error',
          message: error.message,
        }, 500));
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    return res.json(
      { error: 'Internal server error', message: error.message },
      500
    );
  }
};
