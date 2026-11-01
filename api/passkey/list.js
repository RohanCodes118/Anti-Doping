import { getServerSupabaseClient, getUserPasskeys } from '../../src/server/webauthnService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter.' });
    }

    const supabase = getServerSupabaseClient();
    const keys = await getUserPasskeys(supabase, userId);
    return res.status(200).json({ passkeys: keys });
  } catch (err) {
    console.error('WebAuthn list error:', err);
    return res.status(400).json({ error: err.message || 'Failed to list passkeys.' });
  }
}

