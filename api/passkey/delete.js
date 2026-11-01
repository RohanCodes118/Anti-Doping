import { getServerSupabaseClient, deleteUserPasskey } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, credentialId } = req.body || {};
    if (!userId || !credentialId) {
      return res.status(400).json({ error: 'Missing userId or credentialId.' });
    }

    const supabase = getServerSupabaseClient();
    await deleteUserPasskey(supabase, userId, credentialId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('WebAuthn delete error:', err);
    return res.status(400).json({ error: err.message || 'Failed to delete passkey.' });
  }
}
