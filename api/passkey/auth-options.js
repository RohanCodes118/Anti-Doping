import { handleGenerateAuthOptions } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const hostname = hostHeader.split(':')[0];

  try {
    const options = await handleGenerateAuthOptions({
      rpID: hostname,
    });

    return res.status(200).json(options);
  } catch (err) {
    console.error('WebAuthn auth-options error:', err);
    return res.status(400).json({ error: err.message || 'Failed to generate authentication options.' });
  }
}
