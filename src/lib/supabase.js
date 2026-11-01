import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided (not the default placeholder)
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon')
  );
};

// Create a singleton Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Fetch full profile, quiz history, and game attempts for a given authenticated user ID.
 */
export async function loadUserDataFromDb(authUser) {
  if (!authUser || !authUser.id) return null;

  try {
    // 1. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile from Supabase:', profileError);
    }

    // 2. Fetch Quiz Attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', authUser.id)
      .order('completed_at', { ascending: false });

    if (attemptsError) {
      console.error('Error fetching quiz attempts from Supabase:', attemptsError);
    }

    const quizHistory = (attempts || []).map(att => ({
      id: att.id,
      quizId: att.quiz_id,
      quizTitle: att.quiz_title,
      categoryId: att.category_id,
      categoryName: att.category_name,
      difficulty: att.difficulty,
      score: att.score,
      totalQuestions: att.total_questions,
      scorePercentage: att.score_percentage,
      xpEarned: att.xp_earned,
      timeSpentSeconds: att.time_spent_seconds,
      completedAt: att.completed_at,
    }));

    // 3. Fetch Game Attempts (Clean or Banned, etc.)
    let gameAttempts = [];
    try {
      const { data: gAttempts, error: gError } = await supabase
        .from('game_attempts')
        .select('*')
        .eq('user_id', authUser.id)
        .order('completed_at', { ascending: false });

      if (!gError && gAttempts) {
        gameAttempts = gAttempts.map(g => ({
          id: g.id,
          gameId: g.game_id,
          gameTitle: g.game_title,
          score: g.score,
          totalQuestions: g.total_questions,
          accuracyPercentage: g.accuracy_percentage,
          bestStreak: g.best_streak,
          xpEarned: g.xp_earned,
          coinsEarned: g.coins_earned,
          completedAt: g.completed_at,
        }));
      }
    } catch (err) {
      console.warn('Game attempts table not yet initialized in Supabase:', err);
    }

    if (profile) {
      return {
        id: profile.id,
        name: profile.name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
        email: authUser.email || profile.email,
        username: profile.username || authUser.email?.split('@')[0],
        sport: profile.sport || authUser.user_metadata?.sport || 'General',
        country: profile.country || '',
        rank: profile.rank || 'Rookie',
        level: profile.level ?? 1,
        xp: profile.xp ?? 0,
        xpToNext: profile.xp_to_next ?? 500,
        totalXp: profile.total_xp ?? 0,
        cleanCoins: profile.clean_coins ?? 100,
        streak: profile.streak ?? 1,
        completedChallenges: profile.completed_challenges ?? 0,
        communityInteractions: profile.community_interactions ?? 0,
        settings: profile.settings || { notifications: true, soundEffects: true },
        learningProgress: profile.learning_progress || {},
        challengeProgress: profile.challenge_progress || {},
        gameProgress: profile.game_progress || {},
        quizHistory,
        gameAttempts,
      };
    }

    // If profile row doesn't exist yet (e.g. trigger didn't run), create it
    const newProfile = {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
      email: authUser.email,
      username: authUser.email?.split('@')[0],
      sport: authUser.user_metadata?.sport || 'General',
      country: '',
      rank: 'Rookie',
      level: 1,
      xp: 0,
      xp_to_next: 500,
      total_xp: 0,
      clean_coins: 100,
      streak: 1,
      completed_challenges: 0,
      community_interactions: 0,
      settings: { notifications: true, soundEffects: true },
      learning_progress: {},
      challenge_progress: {},
      game_progress: {},
    };

    await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });

    return {
      ...newProfile,
      cleanCoins: 100,
      xpToNext: 500,
      quizHistory: [],
      gameAttempts: [],
    };
  } catch (err) {
    console.error('loadUserDataFromDb exception:', err);
    return null;
  }
}

/**
 * Save user profile state to Supabase.
 */
export async function saveUserProfileToDb(user) {
  if (!user || !user.id || !isSupabaseConfigured()) return;

  try {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      sport: user.sport,
      country: user.country,
      rank: user.rank,
      level: user.level,
      xp: user.xp,
      xp_to_next: user.xpToNext,
      total_xp: user.totalXp,
      clean_coins: user.cleanCoins ?? 100,
      streak: user.streak,
      completed_challenges: user.completedChallenges,
      community_interactions: user.communityInteractions,
      settings: user.settings,
      learning_progress: user.learningProgress,
      challenge_progress: user.challengeProgress,
      game_progress: user.gameProgress || {},
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Error saving profile to Supabase:', error);
    }
  } catch (err) {
    console.error('saveUserProfileToDb exception:', err);
  }
}

/**
 * Save a new quiz attempt to Supabase and update user profile stats.
 */
export async function saveQuizAttemptToDb(userId, attemptData, updatedProfile) {
  if (!userId || !attemptData) return;

  try {
    // 1. Insert into quiz_attempts
    const attemptPayload = {
      id: attemptData.id,
      user_id: userId,
      quiz_id: attemptData.quizId,
      quiz_title: attemptData.quizTitle,
      category_id: attemptData.categoryId,
      category_name: attemptData.categoryName,
      difficulty: attemptData.difficulty,
      score: attemptData.score,
      total_questions: attemptData.totalQuestions,
      score_percentage: attemptData.scorePercentage,
      xp_earned: attemptData.xpEarned,
      time_spent_seconds: attemptData.timeSpentSeconds || 0,
      completed_at: attemptData.completedAt || new Date().toISOString(),
    };

    const { error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert(attemptPayload);

    if (attemptError) {
      console.error('Error saving quiz attempt to Supabase:', attemptError);
    }

    // 2. Update profile with new XP, level, etc.
    if (updatedProfile) {
      await saveUserProfileToDb(updatedProfile);
    }
  } catch (err) {
    console.error('saveQuizAttemptToDb exception:', err);
  }
}

/**
 * Save a new mini-game attempt to Supabase and update user profile.
 */
export async function saveGameAttemptToDb(userId, gameData, updatedProfile) {
  if (!userId || !gameData) return;

  try {
    const gamePayload = {
      id: gameData.id,
      user_id: userId,
      game_id: gameData.gameId || 'clean_or_banned',
      game_title: gameData.gameTitle || 'Clean or Banned?',
      score: gameData.score,
      total_questions: gameData.totalQuestions,
      accuracy_percentage: gameData.accuracyPercentage,
      best_streak: gameData.bestStreak || 0,
      xp_earned: gameData.xpEarned,
      coins_earned: gameData.coinsEarned,
      completed_at: gameData.completedAt || new Date().toISOString(),
    };

    const { error: gameError } = await supabase
      .from('game_attempts')
      .insert(gamePayload);

    if (gameError) {
      console.error('Error saving game attempt to Supabase:', gameError);
    }

    if (updatedProfile) {
      await saveUserProfileToDb(updatedProfile);
    }
  } catch (err) {
    console.error('saveGameAttemptToDb exception:', err);
  }
}

/**
 * Reset all progress in Supabase for a given user.
 */
export async function resetUserProgressInDb(user) {
  if (!user || !user.id) return;

  try {
    // Delete all quiz attempts
    await supabase
      .from('quiz_attempts')
      .delete()
      .eq('user_id', user.id);

    // Delete all game attempts
    try {
      await supabase
        .from('game_attempts')
        .delete()
        .eq('user_id', user.id);
    } catch {
      // ignore if table doesn't exist yet
    }

    // Reset profile progress
    const resetPayload = {
      id: user.id,
      level: 1,
      xp: 0,
      xp_to_next: 500,
      total_xp: 0,
      clean_coins: 100,
      streak: 1,
      completed_challenges: 0,
      community_interactions: 0,
      learning_progress: {},
      challenge_progress: {},
      game_progress: {},
      updated_at: new Date().toISOString(),
    };

    const { error: profError } = await supabase
      .from('profiles')
      .update(resetPayload)
      .eq('id', user.id);

    if (profError) {
      console.error('Error resetting profile in Supabase:', profError);
    }
  } catch (err) {
    console.error('resetUserProgressInDb exception:', err);
  }
}

/**
 * ==============================================================================
 * PASSKEY / BIOMETRIC AUTHENTICATION HELPERS
 * ==============================================================================
 */

const DEVICE_PASSKEYS_KEY = 'cleanquest_device_passkeys';

/**
 * Get all registered passkeys stored on this local device.
 */
export function getDevicePasskeysFromStorage() {
  try {
    const raw = localStorage.getItem(DEVICE_PASSKEYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save or update a registered passkey in the local device storage.
 */
export function saveDevicePasskeyToStorage(passkeyRecord) {
  if (!passkeyRecord || !passkeyRecord.credentialId) return false;
  try {
    const list = getDevicePasskeysFromStorage();
    const filtered = list.filter(p => p.credentialId !== passkeyRecord.credentialId);
    filtered.unshift(passkeyRecord);
    localStorage.setItem(DEVICE_PASSKEYS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error saving passkey to device storage:', err);
    return false;
  }
}

/**
 * Remove a registered passkey from local device storage.
 */
export function removeDevicePasskeyFromStorage(credentialId) {
  try {
    const list = getDevicePasskeysFromStorage();
    const filtered = list.filter(p => p.credentialId !== credentialId);
    localStorage.setItem(DEVICE_PASSKEYS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error removing passkey from device storage:', err);
    return false;
  }
}

/**
 * Save user passkey metadata to Supabase (in `user_passkeys` and `profiles.settings.passkeys`).
 */
export async function saveUserPasskeyToDb(userId, passkeyData) {
  if (!userId || !passkeyData) return;

  // 1. Save to local device vault
  saveDevicePasskeyToStorage({
    credentialId: passkeyData.credentialId,
    userId,
    userEmail: passkeyData.userEmail,
    userName: passkeyData.userName,
    deviceName: passkeyData.deviceName,
    biometricType: passkeyData.biometricType,
    createdAt: passkeyData.createdAt || new Date().toISOString(),
    authSignatureToken: passkeyData.authSignatureToken || null,
  });

  if (!isSupabaseConfigured()) return;

  try {
    // 2. Try inserting into user_passkeys table
    try {
      await supabase.from('user_passkeys').upsert({
        user_id: userId,
        credential_id: passkeyData.credentialId,
        credential_name: passkeyData.deviceName || 'Personal Device',
        authenticator_attachment: passkeyData.authenticatorAttachment || 'platform',
        created_at: passkeyData.createdAt || new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      }, { onConflict: 'user_id,credential_id' });
    } catch {
      // Table might not exist yet if remote migration isn't run, fallback to profile settings
    }

    // 3. Also sync into profiles settings JSON
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const currentSettings = profile.settings || {};
      const currentPasskeys = Array.isArray(currentSettings.passkeys) ? currentSettings.passkeys : [];
      const updatedPasskeys = [
        ...currentPasskeys.filter(p => p.credentialId !== passkeyData.credentialId),
        {
          credentialId: passkeyData.credentialId,
          deviceName: passkeyData.deviceName,
          biometricType: passkeyData.biometricType,
          createdAt: passkeyData.createdAt || new Date().toISOString(),
        },
      ];

      await supabase.from('profiles').update({
        settings: {
          ...currentSettings,
          passkeys: updatedPasskeys,
        },
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    }
  } catch (err) {
    console.error('saveUserPasskeyToDb exception:', err);
  }
}

/**
 * Fetch all registered passkeys for a user from Supabase and local storage.
 */
export async function getUserPasskeysFromDb(userId) {
  if (!userId) return [];

  const localPasskeys = getDevicePasskeysFromStorage().filter(p => String(p.userId) === String(userId));

  const combinedMap = new Map();
  localPasskeys.forEach(k => combinedMap.set(k.credentialId, k));

  if (!isSupabaseConfigured()) return Array.from(combinedMap.values());

  try {
    // Try user_passkeys table first
    const { data: dbKeys, error } = await supabase
      .from('user_passkeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && dbKeys && dbKeys.length > 0) {
      dbKeys.forEach(k => {
        const existing = combinedMap.get(k.credential_id) || {};
        combinedMap.set(k.credential_id, {
          credentialId: k.credential_id,
          deviceName: k.credential_name || existing.deviceName || 'Personal Device',
          biometricType: existing.biometricType || 'Biometric / Platform Key',
          createdAt: k.created_at || existing.createdAt,
          lastUsedAt: k.last_used_at,
          ...existing,
        });
      });
      return Array.from(combinedMap.values());
    }

    // Fallback to profiles.settings.passkeys
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.settings?.passkeys && Array.isArray(profile.settings.passkeys)) {
      profile.settings.passkeys.forEach(k => {
        const existing = combinedMap.get(k.credentialId) || {};
        combinedMap.set(k.credentialId, { ...existing, ...k });
      });
    }

    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn('getUserPasskeysFromDb error:', err);
    return Array.from(combinedMap.values());
  }
}

/**
 * Delete a passkey by credential ID for a user from Supabase and local device storage.
 */
export async function deleteUserPasskeyFromDb(userId, credentialId) {
  if (!credentialId) return;

  // 1. Remove from local device storage
  removeDevicePasskeyFromStorage(credentialId);

  if (!userId || !isSupabaseConfigured()) return;

  try {
    // 2. Remove from user_passkeys table
    try {
      await supabase
        .from('user_passkeys')
        .delete()
        .eq('user_id', userId)
        .eq('credential_id', credentialId);
    } catch {
      // ignore table error
    }

    // 3. Remove from profile settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.settings?.passkeys) {
      const updated = profile.settings.passkeys.filter(p => p.credentialId !== credentialId);
      await supabase.from('profiles').update({
        settings: {
          ...profile.settings,
          passkeys: updated,
        },
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    }
  } catch (err) {
    console.error('deleteUserPasskeyFromDb exception:', err);
  }
}

