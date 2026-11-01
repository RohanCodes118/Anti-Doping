import { handleVerifyRegistration } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const hostname = hostHeader.split(':')[0];
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${hostHeader}`;

  try {
    const { user, response, deviceName, challenge } = req.body || {};

    if (!user?.id || !response) {
      return res.status(400).json({ error: 'Invalid registration payload.' });
    }

    if (challenge) response.challenge = challenge;

    const result = await handleVerifyRegistration({
      user,
      response,
      deviceName: deviceName || 'Personal Device',
      expectedOrigin: origin,
      expectedRPID: hostname,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('WebAuthn register-verify error:', err);
    return res.status(400).json({ error: err.message || 'Passkey registration verification failed.' });
  }
}

