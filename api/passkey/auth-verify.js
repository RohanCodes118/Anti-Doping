import { handleVerifyAuthentication } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const hostname = hostHeader.split(':')[0];
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${hostHeader}`;

  try {
    const { response, challenge } = req.body || {};

    if (!response) {
      return res.status(400).json({ error: 'Missing assertion response.' });
    }

    if (challenge) response.challenge = challenge;

    const result = await handleVerifyAuthentication({
      response,
      expectedOrigin: origin,
      expectedRPID: hostname,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('WebAuthn auth-verify error:', err);
    return res.status(400).json({ error: err.message || 'Passkey authentication verification failed.' });
  }
}
