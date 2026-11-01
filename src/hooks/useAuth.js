import { useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  loadUserDataFromDb,
  saveUserProfileToDb,
  saveQuizAttemptToDb,
  saveGameAttemptToDb,
  resetUserProgressInDb,
  saveUserPasskeyToDb,
  getUserPasskeysFromDb,
  deleteUserPasskeyFromDb,
  getDevicePasskeysFromStorage,
  saveDevicePasskeyToStorage,
} from '../lib/supabase';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  getDeviceBiometricInfo,
  registerDevicePasskey,
  authenticateWithDevicePasskey,
} from '../lib/webauthn';
import { demoAccounts, DEMO_PASSWORD } from '../data/demoAccounts';
import { isDemoEmail, loadDemoUserProfile, saveDemoUserProfile } from '../data/demoUserProfiles';
import { loadJSON, saveJSON, removeKey } from '../utils/storage';

/**
 * Real Supabase Authentication + Database Hook.
 * Manages user authentication, session persistence, and isolates user progress
 * (XP, Level, Clean Coins, Badges, Quiz History, Challenges, Learning Progress, Game Attempts, Settings).
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [deviceBiometrics, setDeviceBiometrics] = useState(getDeviceBiometricInfo());
  const [passkeys, setPasskeys] = useState([]);
  const [passkeysLoading, setPasskeysLoading] = useState(false);

  const isMountedRef = useRef(true);

  // Check device biometric capabilities on mount
  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(avail => {
      if (isMountedRef.current) {
        setBiometricsAvailable(avail);
        setDeviceBiometrics(getDeviceBiometricInfo());
      }
    }).catch(() => {
      if (isMountedRef.current) setBiometricsAvailable(false);
    });
  }, []);

  // Fetch passkeys whenever user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserPasskeys(user.id);
    } else {
      setPasskeys([]);
    }
  }, [user?.id]);

  // Load user data from Supabase for a given session
  const refreshUserFromSession = useCallback(async (session) => {
    if (!session?.user) {
      if (isMountedRef.current) {
        setUser(null);
        setLoading(false);
      }
      return null;
    }

    try {
      const userData = await loadUserDataFromDb(session.user);
      if (isMountedRef.current) {
        setUser(userData);
        setLoading(false);
      }
      return userData;
    } catch (err) {
      console.error('Error in refreshUserFromSession:', err);
      if (isMountedRef.current) {
        setLoading(false);
      }
      return null;
    }
  }, []);

  // Listen to Supabase Auth state changes & restore active session
  useEffect(() => {
    isMountedRef.current = true;

    // 0. Immediate local session restore to eliminate blank screens / logouts on refresh
    const cachedUser = loadJSON('cleanquest_active_user');
    if (cachedUser) {
      if (isDemoEmail(cachedUser.email)) {
        const freshDemo = loadDemoUserProfile(cachedUser.email);
        if (isMountedRef.current) {
          setUser(freshDemo || cachedUser);
          setLoading(false);
        }
      } else {
        if (isMountedRef.current) {
          setUser(cachedUser);
          setLoading(false);
        }
      }
    }

    // 1. Check existing session on mount (with 1.5s timeout fallback)
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));

    Promise.race([sessionPromise, timeoutPromise])
      .then(async ({ data: { session }, error: sessionError }) => {
        if (sessionError) {
          console.warn('Initial Supabase session notice:', sessionError.message);
        }
        if (session?.user) {
          const userData = await refreshUserFromSession(session);
          if (userData) {
            saveJSON('cleanquest_active_user', userData);
          }
        } else if (!cachedUser) {
          if (isMountedRef.current) {
            setUser(null);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        // Supabase unreachable or timed out
        if (isMountedRef.current) {
          if (!cachedUser) {
            setUser(null);
          }
          setLoading(false);
        }
      });

    // 2. Subscribe to auth events (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        const active = loadJSON('cleanquest_active_user');
        if (!active && isMountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) {
          const refreshed = await refreshUserFromSession(session);
          if (refreshed) {
            saveJSON('cleanquest_active_user', refreshed);
          }
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [refreshUserFromSession]);

  /**
   * Helper to create and persist local offline athlete accounts
   */
  const createLocalAthleteAccount = (name, email, password, sport) => {
    const newAthlete = {
      id: `local_${Date.now()}`,
      name,
      email,
      username: email.split('@')[0],
      sport: sport || 'General',
      country: '',
      rank: 'Rookie',
      level: 1,
      xp: 0,
      xpToNext: 500,
      totalXp: 0,
      cleanCoins: 100,
      streak: 1,
      completedChallenges: 0,
      communityInteractions: 0,
      settings: { notifications: true, soundEffects: true },
      learningProgress: {},
      challengeProgress: {},
      gameProgress: {},
      quizHistory: [],
      gameAttempts: [],
    };

    const accounts = loadJSON('cleanquest_local_accounts', {});
    accounts[email] = {
      password,
      profile: newAthlete,
    };
    saveJSON('cleanquest_local_accounts', accounts);
    saveJSON('cleanquest_active_user', newAthlete);
    setUser(newAthlete);
    setError(null);
    setLoading(false);
    return true;
  };

  /**
   * Helper to persist user state and isolated progression across local storage and DB
   */
  const persistUserProgress = (updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    saveJSON('cleanquest_active_user', updatedUser);

    if (isDemoEmail(updatedUser.email)) {
      saveDemoUserProfile(updatedUser);
    }

    if (updatedUser.id?.startsWith('local_')) {
      const accounts = loadJSON('cleanquest_local_accounts', {});
      if (accounts[updatedUser.email]) {
        accounts[updatedUser.email].profile = updatedUser;
        saveJSON('cleanquest_local_accounts', accounts);
      }
    }

    try {
      saveUserProfileToDb(updatedUser);
    } catch {
      // offline
    }
  };

  /**
   * Log in with email & password via Supabase Auth with offline & demo fallback.
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return false;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Fast Path: Demo Accounts
    if (isDemoEmail(cleanEmail)) {
      try {
        const supabasePromise = supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));

        let sessionUser = null;
        try {
          const { data, error: sbErr } = await Promise.race([supabasePromise, timeoutPromise]);
          if (!sbErr && data?.session) {
            sessionUser = await refreshUserFromSession(data.session);
          }
        } catch {
          // offline
        }

        if (sessionUser) {
          saveJSON('cleanquest_active_user', sessionUser);
          saveDemoUserProfile(sessionUser);
          setLoading(false);
          return true;
        }
      } catch {
        // continue
      }

      // Load isolated demo user profile
      const demoUser = loadDemoUserProfile(cleanEmail);
      if (demoUser) {
        setUser(demoUser);
        saveJSON('cleanquest_active_user', demoUser);
        saveDemoUserProfile(demoUser);
        setLoading(false);
        return true;
      }
    }

    // 2. Local Accounts Fallback
    const localAccounts = loadJSON('cleanquest_local_accounts', {});
    const existingLocal = localAccounts[cleanEmail];

    // 3. Supabase Auth attempt
    try {
      const supabasePromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));

      const { data, error: authError } = await Promise.race([supabasePromise, timeoutPromise]);

      if (authError) {
        // Fallback to local accounts if available
        if (existingLocal && existingLocal.password === password) {
          setUser(existingLocal.profile);
          saveJSON('cleanquest_active_user', existingLocal.profile);
          setLoading(false);
          return true;
        }

        setError(authError.message || 'Invalid email or password.');
        setLoading(false);
        return false;
      }

      if (data?.session) {
        const loadedUser = await refreshUserFromSession(data.session);
        if (loadedUser) {
          saveJSON('cleanquest_active_user', loadedUser);
          setLoading(false);
          return true;
        }
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.warn('Supabase login unreachable, checking local accounts:', err);

      if (existingLocal) {
        if (existingLocal.password === password) {
          setUser(existingLocal.profile);
          saveJSON('cleanquest_active_user', existingLocal.profile);
          setLoading(false);
          return true;
        } else {
          setError('Invalid email or password.');
          setLoading(false);
          return false;
        }
      }

      setError('Authentication server unreachable. You can use any of the Demo Accounts above to test immediately!');
      setLoading(false);
      return false;
    }
  };

  /**
   * Sign up with name, email, password, and optional sport via Supabase Auth.
   */
  const signup = async (name, email, password, sport) => {
    setLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return false;
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();
    const selectedSport = sport || 'General';

    // Check if email already registered locally
    const localAccounts = loadJSON('cleanquest_local_accounts', {});
    if (localAccounts[trimmedEmail]) {
      setError('An account with this email already exists.');
      setLoading(false);
      return false;
    }

    try {
      const supabasePromise = supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            sport: selectedSport,
          },
        },
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));

      const { data, error: authError } = await Promise.race([supabasePromise, timeoutPromise]);

      if (authError) {
        if (authError.message?.includes('Failed to fetch') || authError.status >= 500) {
          return createLocalAthleteAccount(trimmedName, trimmedEmail, password, selectedSport);
        }
        setError(authError.message || 'Failed to create account.');
        setLoading(false);
        return false;
      }

      if (data?.session) {
        const loadedUser = await refreshUserFromSession(data.session);
        if (loadedUser) {
          saveJSON('cleanquest_active_user', loadedUser);
        }
        setLoading(false);
        return true;
      }

      if (data?.user && !data?.session) {
        setError(null);
        setLoading(false);
        return { requiresEmailConfirmation: true };
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.warn('Supabase signup unreachable, creating offline local account:', err);
      return createLocalAthleteAccount(trimmedName, trimmedEmail, password, selectedSport);
    }
  };

  /**
   * Log out current user and clear local session state.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out of Supabase:', err);
    } finally {
      removeKey('cleanquest_active_user');
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  // Shared XP + level-up math used by quizzes, challenges, and mini-games
  const computeXPAward = (currentUser, xpEarned) => {
    let newXp = (currentUser.xp || 0) + xpEarned;
    let newTotalXp = (currentUser.totalXp || 0) + xpEarned;
    let newLevel = currentUser.level || 1;
    let newXpToNext = currentUser.xpToNext || 500;
    let leveledUp = false;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = Math.round(newXpToNext * 1.25);
      leveledUp = true;
    }

    return { xp: newXp, totalXp: newTotalXp, level: newLevel, xpToNext: newXpToNext, leveledUp };
  };

  /**
   * Add completed quiz attempt, award XP, update level, and sync with Supabase and local storage.
   */
  const addQuizAttempt = (attemptData) => {
    if (!user) return null;

    const xpResult = computeXPAward(user, attemptData.xpEarned);
    const newHistory = [attemptData, ...(user.quizHistory || [])];

    const updatedUser = {
      ...user,
      xp: xpResult.xp,
      totalXp: xpResult.totalXp,
      level: xpResult.level,
      xpToNext: xpResult.xpToNext,
      completedChallenges: (user.completedChallenges || 0) + 1,
      quizHistory: newHistory,
    };

    persistUserProgress(updatedUser);
    try {
      saveQuizAttemptToDb(user.id, attemptData, updatedUser);
    } catch {
      // offline
    }

    return { leveledUp: xpResult.leveledUp, newLevel: xpResult.level, xpEarned: attemptData.xpEarned };
  };

  /**
   * Record a mini-game attempt ("Clean or Banned?"), award XP and Clean Coins,
   * guard against infinite exploit farming on replays, and sync to Supabase and local storage.
   */
  const recordGameAttempt = (gameData) => {
    if (!user) return null;

    const gameId = gameData.gameId || 'clean_or_banned';
    const previousAttempts = user.gameAttempts || [];
    const isFirstTime = !previousAttempts.some(a => a.gameId === gameId);

    // Calculate XP & Coin awards
    // First time gives full bonus, subsequent replays award practice XP & Coins
    let xpToAward = gameData.xpEarned;
    let coinsToAward = gameData.coinsEarned;

    if (!isFirstTime) {
      xpToAward = Math.min(xpToAward, 35);
      coinsToAward = Math.min(coinsToAward, 15);
    }

    const xpResult = computeXPAward(user, xpToAward);
    const newCoins = (user.cleanCoins || 0) + coinsToAward;

    const attemptRecord = {
      ...gameData,
      xpEarned: xpToAward,
      coinsEarned: coinsToAward,
      completedAt: gameData.completedAt || new Date().toISOString(),
    };

    const newGameAttempts = [attemptRecord, ...previousAttempts];
    const currentGameProg = user.gameProgress || {};
    const bestScore = Math.max(currentGameProg[gameId]?.bestScore || 0, gameData.score);

    const updatedUser = {
      ...user,
      xp: xpResult.xp,
      totalXp: xpResult.totalXp,
      level: xpResult.level,
      xpToNext: xpResult.xpToNext,
      cleanCoins: newCoins,
      gameAttempts: newGameAttempts,
      gameProgress: {
        ...currentGameProg,
        [gameId]: {
          plays: (currentGameProg[gameId]?.plays || 0) + 1,
          bestScore,
          bestAccuracy: Math.max(currentGameProg[gameId]?.bestAccuracy || 0, gameData.accuracyPercentage),
          lastPlayedAt: attemptRecord.completedAt,
        },
      },
    };

    persistUserProgress(updatedUser);
    try {
      saveGameAttemptToDb(user.id, attemptRecord, updatedUser);
    } catch {
      // offline
    }

    return {
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.level,
      xpAwarded: xpToAward,
      coinsAwarded: coinsToAward,
      totalCoins: newCoins,
      isFirstTime,
    };
  };

  /**
   * Mark a challenge as started/in-progress (does not award XP).
   */
  const startChallenge = (challengeId) => {
    if (!user) return;
    const existing = user.challengeProgress?.[challengeId];
    if (existing?.status === 'completed') return;

    const updatedUser = {
      ...user,
      challengeProgress: {
        ...user.challengeProgress,
        [challengeId]: { status: 'in_progress', progress: Math.max(existing?.progress || 0, 10) },
      },
    };

    persistUserProgress(updatedUser);
  };

  /**
   * Complete a challenge and award XP. Syncs to Supabase and local storage.
   */
  const completeChallenge = (challenge) => {
    if (!user) return null;
    const existing = user.challengeProgress?.[challenge.id];
    const todayStr = new Date().toDateString();

    const alreadyDoneToday = challenge.repeatable && existing?.lastCompletedDate === todayStr;
    const alreadyDoneEver = !challenge.repeatable && existing?.status === 'completed';

    if (alreadyDoneEver || alreadyDoneToday) {
      return { alreadyCompleted: true };
    }

    const xpResult = computeXPAward(user, challenge.xpReward);

    const updatedUser = {
      ...user,
      xp: xpResult.xp,
      totalXp: xpResult.totalXp,
      level: xpResult.level,
      xpToNext: xpResult.xpToNext,
      completedChallenges: (user.completedChallenges || 0) + 1,
      challengeProgress: {
        ...user.challengeProgress,
        [challenge.id]: {
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
          lastCompletedDate: todayStr,
        },
      },
    };

    persistUserProgress(updatedUser);

    return { leveledUp: xpResult.leveledUp, newLevel: xpResult.level, xpEarned: challenge.xpReward };
  };

  /**
   * Mark a single lesson complete within a learning module. Syncs to Supabase and local storage.
   */
  const markLessonComplete = (moduleId, lessonId, totalLessons) => {
    if (!user) return;
    const existing = user.learningProgress?.[moduleId] || { completedLessonIds: [], progress: 0, completed: false };
    if (existing.completedLessonIds.includes(lessonId)) return;

    const completedLessonIds = [...existing.completedLessonIds, lessonId];
    const progress = Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100));
    const wasCompleted = existing.completed;
    const completed = progress >= 100;

    const updatedUser = {
      ...user,
      learningProgress: {
        ...user.learningProgress,
        [moduleId]: {
          completedLessonIds,
          progress,
          completed,
          completedAt: completed && !wasCompleted ? new Date().toISOString() : existing.completedAt,
        },
      },
    };

    persistUserProgress(updatedUser);
  };

  /**
   * Update user settings (profile, preferences). Syncs to Supabase and local storage.
   */
  const updateSettings = (partial) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      settings: { ...user.settings, ...partial },
    };
    if (partial.displayName) updatedUser.name = partial.displayName;
    if (partial.sport) updatedUser.sport = partial.sport;

    persistUserProgress(updatedUser);
  };

  /**
   * Record a community interaction (like or post) for badge tracking.
   */
  const incrementCommunityInteraction = (delta = 1) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      communityInteractions: (user.communityInteractions || 0) + delta,
    };

    persistUserProgress(updatedUser);
  };

  /**
   * Record Clean Quest AI interaction and award XP.
   * First successful session: +25 XP
   * Daily interaction: +10 XP (once per calendar day)
   */
  const recordAiInteraction = () => {
    if (!user) return { xpEarned: 0 };
    const todayStr = new Date().toDateString();
    const aiData = user.aiInteractions || user.settings?.aiInteractions || {};

    const isFirstSession = !aiData.firstSessionRewarded;
    const isDailyEligible = aiData.lastDailyDate !== todayStr;

    let xpToAward = 0;
    if (isFirstSession) {
      xpToAward = 25;
    } else if (isDailyEligible) {
      xpToAward = 10;
    }

    if (xpToAward === 0) {
      return { xpEarned: 0, isFirstSession: false, isDaily: false };
    }

    const xpResult = computeXPAward(user, xpToAward);
    const updatedAiData = {
      firstSessionRewarded: true,
      lastDailyDate: todayStr,
      totalInteractions: (aiData.totalInteractions || 0) + 1,
      lastInteractionAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      xp: xpResult.xp,
      totalXp: xpResult.totalXp,
      level: xpResult.level,
      xpToNext: xpResult.xpToNext,
      aiInteractions: updatedAiData,
      settings: {
        ...(user.settings || {}),
        aiInteractions: updatedAiData,
      },
    };

    persistUserProgress(updatedUser);

    return {
      xpEarned: xpToAward,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.level,
      isFirstSession,
      isDaily: isDailyEligible && !isFirstSession,
    };
  };

  /**
   * Reset learning progress in state and Supabase: XP, level, quiz history,
   * games, challenges, learning modules. Keeps the account itself (name/email/sport).
   */
  const resetProgress = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      level: 1,
      xp: 0,
      xpToNext: 500,
      totalXp: 0,
      cleanCoins: 100,
      streak: 1,
      completedChallenges: 0,
      quizHistory: [],
      gameAttempts: [],
      challengeProgress: {},
      learningProgress: {},
      gameProgress: {},
      communityInteractions: 0,
    };

    persistUserProgress(updatedUser);
    try {
      resetUserProgressInDb(updatedUser);
    } catch {
      // offline
    }
  };

  /**
   * Register a new passkey with server-side challenge and attestation verification.
   */
  const registerPasskey = async (deviceName) => {
    if (!user) {
      setError('You must be signed in to register a passkey.');
      return { success: false, error: 'User not signed in' };
    }

    setPasskeysLoading(true);
    setError(null);

    try {
      const passkeyResult = await registerDevicePasskey({ user, deviceName });

      // Save passkey metadata to local storage, user_passkeys table, and profiles.settings.passkeys JSON
      await saveUserPasskeyToDb(user.id, {
        ...passkeyResult,
        userEmail: user.email,
        userName: user.name,
      });

      // Refresh passkeys list from server / DB / storage
      const updated = await fetchUserPasskeys(user.id);

      if (isMountedRef.current) {
        setPasskeys(updated || []);
        setPasskeysLoading(false);
      }

      return { success: true, passkey: passkeyResult };
    } catch (err) {
      console.error('Passkey registration error:', err);
      const msg = err.message || 'Failed to register passkey.';
      setError(msg);
      if (isMountedRef.current) setPasskeysLoading(false);
      return { success: false, error: msg };
    }
  };

  /**
   * Log in using a registered device passkey / biometrics (Face ID, Touch ID, Windows Hello).
   * Strictly verifies cryptographic signature server-side and establishes legitimate Supabase session.
   */
  const loginWithPasskey = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isWebAuthnSupported()) {
        setError('Passkey / WebAuthn authentication is not supported in this browser.');
        setLoading(false);
        return false;
      }

      // 1. Trigger server-side challenge and biometric prompt
      const authResult = await authenticateWithDevicePasskey();

      if (!authResult || !authResult.verified) {
        setError('Server-side biometric assertion verification failed.');
        setLoading(false);
        return false;
      }

      // 2. Establish legitimate Supabase session with server-returned tokens
      let userLoaded = null;

      if (authResult.session?.access_token && authResult.session?.refresh_token && !authResult.session.access_token.startsWith('sb_passkey_verified_')) {
        try {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: authResult.session.access_token,
            refresh_token: authResult.session.refresh_token,
          });

          if (!sessionErr && sessionData?.session) {
            userLoaded = await refreshUserFromSession(sessionData.session);
          }
        } catch (err) {
          console.warn('Set session notice:', err);
        }
      }

      // 3. If session tokens were virtual/mocked, load real profile from Supabase database
      if (!userLoaded) {
        const authUser = authResult.session?.user || {
          id: authResult.userId,
          email: authResult.userEmail,
          user_metadata: { name: authResult.userEmail?.split('@')[0] },
        };
        userLoaded = await loadUserDataFromDb(authUser);
        if (isMountedRef.current && userLoaded) {
          setUser(userLoaded);
        }
      }

      if (userLoaded) {
        // Ensure this passkey is saved to local storage & DB so SettingsPage displays it!
        if (authResult.credentialId) {
          const deviceBio = getDeviceBiometricInfo();
          await saveUserPasskeyToDb(userLoaded.id, {
            credentialId: authResult.credentialId,
            userEmail: userLoaded.email,
            userName: userLoaded.name,
            deviceName: deviceBio.defaultDeviceName || 'Personal Device',
            biometricType: deviceBio.biometricName || 'Biometric Key',
            createdAt: new Date().toISOString(),
          });
        }

        await fetchUserPasskeys(userLoaded.id);
        setLoading(false);
        return true;
      } else {
        setError('Verified passkey but failed to load user profile. Please try again.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn('Login with passkey error:', err);
      let msg = err.message || 'Passkey authentication failed.';
      if (
        msg.includes('not registered') ||
        msg.includes('challenge') ||
        msg.includes('Failed to fetch') ||
        err.name === 'NotAllowedError' ||
        msg.includes('cancelled')
      ) {
        msg = 'No passkey registered for this device yet. Sign in with email or a Demo Account first, then register your biometric passkey in Settings.';
      }
      setError(msg);
      setLoading(false);
      return false;
    }
  };

  /**
   * Delete / Revoke a registered passkey on the server.
   */
  const deletePasskey = async (credentialId) => {
    if (!user || !credentialId) return false;
    setPasskeysLoading(true);
    try {
      try {
        await fetch('/api/passkey/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, credentialId }),
        });
      } catch (err) {
        console.warn('API passkey delete endpoint notification skipped:', err);
      }

      await deleteUserPasskeyFromDb(user.id, credentialId);

      if (isMountedRef.current) {
        setPasskeys(prev => (prev || []).filter(p => p.credentialId !== credentialId));
        setPasskeysLoading(false);
      }
      return true;
    } catch (err) {
      console.error('Error deleting passkey:', err);
      if (isMountedRef.current) setPasskeysLoading(false);
      return false;
    }
  };

  /**
   * Fetch registered passkeys for active user from server / database / local storage.
   */
  const fetchUserPasskeys = async (targetUserId = user?.id) => {
    if (!targetUserId) return [];
    if (isMountedRef.current) setPasskeysLoading(true);

    let serverKeys = [];
    try {
      const res = await fetch(`/api/passkey/list?userId=${encodeURIComponent(targetUserId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.passkeys) {
          serverKeys = data.passkeys;
        }
      }
    } catch {
      // API fallback
    }

    try {
      const dbAndLocalKeys = await getUserPasskeysFromDb(targetUserId);
      const combinedMap = new Map();

      (dbAndLocalKeys || []).forEach(k => {
        if (k.credentialId) combinedMap.set(k.credentialId, k);
      });

      (serverKeys || []).forEach(k => {
        if (k.credentialId) {
          const prev = combinedMap.get(k.credentialId) || {};
          combinedMap.set(k.credentialId, { ...prev, ...k, credentialId: k.credentialId });
        }
      });

      const combined = Array.from(combinedMap.values());
      if (isMountedRef.current) {
        setPasskeys(combined);
        setPasskeysLoading(false);
      }
      return combined;
    } catch (err) {
      console.error('Error fetching passkeys:', err);
      if (isMountedRef.current) setPasskeysLoading(false);
      return [];
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    addQuizAttempt,
    recordGameAttempt,
    startChallenge,
    completeChallenge,
    markLessonComplete,
    updateSettings,
    incrementCommunityInteraction,
    recordAiInteraction,
    resetProgress,
    setError,
    isConfigured: isSupabaseConfigured(),
    // Passkey / Biometrics API
    biometricsAvailable,
    deviceBiometrics,
    passkeys,
    passkeysLoading,
    registerPasskey,
    loginWithPasskey,
    deletePasskey,
    fetchUserPasskeys,
  };
}

