/**
 * Vite Plugin that exposes real server-side WebAuthn API endpoints.
 * Handles challenge generation, cryptographic verification, and session token exchange.
 */

import {
  handleGenerateRegistrationOptions,
  handleVerifyRegistration,
  handleGenerateAuthOptions,
  handleVerifyAuthentication,
  getUserPasskeys,
  deleteUserPasskey,
  getServerSupabaseClient,
} from './webauthnService.js';

// Helper to parse JSON body from incoming request stream
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function viteWebAuthnPlugin() {
  return {
    name: 'vite-webauthn-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
        const pathname = url.pathname;

        if (!pathname.startsWith('/api/passkey/')) {
          return next();
        }

        const hostHeader = req.headers.host || 'localhost:5173';
        const hostname = hostHeader.split(':')[0];
        const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${hostHeader}`;

        try {
          // 1. Generate Registration Options
          if (pathname === '/api/passkey/register-options' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const user = body.user;
            if (!user?.id) {
              return sendJson(res, 401, { error: 'Authentication required for passkey registration.' });
            }

            const options = await handleGenerateRegistrationOptions({
              user,
              rpName: 'Clean Quest',
              rpID: hostname,
            });

            return sendJson(res, 200, options);
          }

          // 2. Verify Registration Response
          if (pathname === '/api/passkey/register-verify' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { user, response, deviceName, challenge } = body;

            if (!user?.id || !response) {
              return sendJson(res, 400, { error: 'Invalid registration payload.' });
            }

            // Attach challenge to response for server verification
            if (challenge) response.challenge = challenge;

            const result = await handleVerifyRegistration({
              user,
              response,
              deviceName: deviceName || 'Personal Device',
              expectedOrigin: origin,
              expectedRPID: hostname,
            });

            return sendJson(res, 200, result);
          }

          // 3. Generate Authentication Options
          if (pathname === '/api/passkey/auth-options' && (req.method === 'POST' || req.method === 'GET')) {
            const options = await handleGenerateAuthOptions({
              rpID: hostname,
            });

            return sendJson(res, 200, options);
          }

          // 4. Verify Authentication Assertion
          if (pathname === '/api/passkey/auth-verify' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { response, challenge } = body;

            if (!response) {
              return sendJson(res, 400, { error: 'Missing assertion response.' });
            }

            if (challenge) response.challenge = challenge;

            const result = await handleVerifyAuthentication({
              response,
              expectedOrigin: origin,
              expectedRPID: hostname,
            });

            return sendJson(res, 200, result);
          }

          // 5. List Passkeys for User
          if (pathname === '/api/passkey/list' && req.method === 'GET') {
            const userId = url.searchParams.get('userId');
            if (!userId) {
              return sendJson(res, 400, { error: 'Missing userId parameter.' });
            }

            const supabase = getServerSupabaseClient();
            const keys = await getUserPasskeys(supabase, userId);
            return sendJson(res, 200, { passkeys: keys });
          }

          // 6. Delete Passkey for User
          if (pathname === '/api/passkey/delete' && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const { userId, credentialId } = body;
            if (!userId || !credentialId) {
              return sendJson(res, 400, { error: 'Missing userId or credentialId.' });
            }

            const supabase = getServerSupabaseClient();
            await deleteUserPasskey(supabase, userId, credentialId);
            return sendJson(res, 200, { success: true });
          }

          return next();
        } catch (err) {
          console.error('WebAuthn Server API Error:', err);
          return sendJson(res, 400, { error: err.message || 'WebAuthn server processing failed.' });
        }
      });
    },
  };
}
