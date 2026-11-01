import { handleGenerateRegistrationOptions } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const hostname = hostHeader.split(':')[0];

  try {
    const user = req.body?.user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Authentication required for passkey registration.' });
    }

    const options = await handleGenerateRegistrationOptions({
      user,
      rpName: 'Clean Quest',
      rpID: hostname,
    });

    return res.status(200).json(options);
  } catch (err) {
    console.error('WebAuthn register-options error:', err);
    return res.status(400).json({ error: err.message || 'Failed to generate registration options.' });
  }
}
