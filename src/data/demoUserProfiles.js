/**
 * Complete Demo User Profiles & Local Isolation Engine.
 * Provides pre-seeded, rich realistic states for the 3 demo athletes:
 * 1. Sam Rivera (Beginner, Level 1, 0 XP)
 * 2. Maya Lin (Active Learner, Level 8, 4.2k XP, 3 quizzes)
 * 3. Elena Rostova (Champion, Level 18, 28.9k XP, 6 quizzes, 8 badges)
 *
 * Automatically persists changes to localStorage so each demo account
 * maintains completely separate, persistent progression even offline.
 */

const DEMO_PROFILES = {
  'beginner@cleanquest.io': {
    id: 'demo_beginner',
    name: 'Sam Rivera',
    email: 'beginner@cleanquest.io',
    username: 'sam_rivera',
    sport: 'Athletics',
    country: 'USA',
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
  },
  'learner@cleanquest.io': {
    id: 'demo_learner',
    name: 'Maya Lin',
    email: 'learner@cleanquest.io',
    username: 'maya_lin',
    sport: 'Swimming',
    country: 'Canada',
    rank: 'Contender',
    level: 8,
    xp: 850,
    xpToNext: 1500,
    totalXp: 4200,
    cleanCoins: 250,
    streak: 5,
    completedChallenges: 3,
    communityInteractions: 4,
    settings: { notifications: true, soundEffects: true },
    learningProgress: {
      mod_001: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'], progress: 100, completed: true },
      mod_002: { completedLessonIds: ['l1', 'l2', 'l3', 'l4'], progress: 33, completed: false },
      mod_003: { completedLessonIds: ['l1', 'l2'], progress: 33, completed: false },
    },
    challengeProgress: {
      chl_001: { status: 'completed', progress: 100, lastCompletedDate: 'Today' },
      chl_002: { status: 'completed', progress: 100 },
      chl_003: { status: 'completed', progress: 100 },
      chl_004: { status: 'in_progress', progress: 45 },
    },
    gameProgress: {},
    quizHistory: [
      {
        id: 'att_demo_l1',
        quizId: 'qz_001',
        quizTitle: 'Introduction to Clean Sport & WADA',
        categoryId: 'cat_basics',
        categoryName: 'Anti-Doping Basics',
        difficulty: 'Beginner',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 50,
        timeSpentSeconds: 140,
        completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_l2',
        quizId: 'qz_002',
        quizTitle: 'Strict Liability & Medication Checking',
        categoryId: 'cat_responsibilities',
        categoryName: 'Athlete Responsibilities',
        difficulty: 'Beginner',
        score: 4,
        totalQuestions: 5,
        scorePercentage: 80,
        xpEarned: 40,
        timeSpentSeconds: 190,
        completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_l3',
        quizId: 'qz_003',
        quizTitle: 'WADA Prohibited List & Categories',
        categoryId: 'cat_substances',
        categoryName: 'Prohibited Substances',
        difficulty: 'Intermediate',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 100,
        timeSpentSeconds: 220,
        completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    gameAttempts: [
      {
        id: 'gm_demo_l1',
        gameId: 'clean_or_banned',
        gameTitle: 'Clean or Banned?',
        score: 8,
        totalQuestions: 10,
        accuracyPercentage: 80,
        bestStreak: 5,
        xpEarned: 80,
        coinsEarned: 25,
        completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  },
  'champion@cleanquest.io': {
    id: 'demo_champion',
    name: 'Elena Rostova',
    email: 'champion@cleanquest.io',
    username: 'elena_r',
    sport: 'Cycling',
    country: 'Germany',
    rank: 'Elite Athlete',
    level: 18,
    xp: 2400,
    xpToNext: 4800,
    totalXp: 28900,
    cleanCoins: 850,
    streak: 14,
    completedChallenges: 6,
    communityInteractions: 12,
    settings: { notifications: true, soundEffects: true },
    learningProgress: {
      mod_001: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'], progress: 100, completed: true },
      mod_002: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12'], progress: 100, completed: true },
      mod_003: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'], progress: 100, completed: true },
      mod_004: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10'], progress: 100, completed: true },
    },
    challengeProgress: {
      chl_001: { status: 'completed', progress: 100, lastCompletedDate: 'Today' },
      chl_002: { status: 'completed', progress: 100 },
      chl_003: { status: 'completed', progress: 100 },
      chl_004: { status: 'completed', progress: 100 },
      chl_005: { status: 'completed', progress: 100 },
      chl_006: { status: 'completed', progress: 100 },
    },
    gameProgress: {},
    quizHistory: [
      {
        id: 'att_demo_c1',
        quizId: 'qz_001',
        quizTitle: 'Introduction to Clean Sport & WADA',
        categoryId: 'cat_basics',
        categoryName: 'Anti-Doping Basics',
        difficulty: 'Beginner',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 50,
        timeSpentSeconds: 115,
        completedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c2',
        quizId: 'qz_002',
        quizTitle: 'Strict Liability & Medication Checking',
        categoryId: 'cat_responsibilities',
        categoryName: 'Athlete Responsibilities',
        difficulty: 'Beginner',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 50,
        timeSpentSeconds: 130,
        completedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c3',
        quizId: 'qz_003',
        quizTitle: 'WADA Prohibited List & Categories',
        categoryId: 'cat_substances',
        categoryName: 'Prohibited Substances',
        difficulty: 'Intermediate',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 100,
        timeSpentSeconds: 180,
        completedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c4',
        quizId: 'qz_004',
        quizTitle: 'Therapeutic Use Exemptions (TUE) Deep Dive',
        categoryId: 'cat_tue',
        categoryName: 'TUE & Exemptions',
        difficulty: 'Advanced',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 150,
        timeSpentSeconds: 210,
        completedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c5',
        quizId: 'qz_005',
        quizTitle: 'Doping Control Testing Procedures & Athlete Rights',
        categoryId: 'cat_testing',
        categoryName: 'Testing Procedures',
        difficulty: 'Intermediate',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 100,
        timeSpentSeconds: 195,
        completedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c6',
        quizId: 'qz_006',
        quizTitle: 'Values, Ethics & Fair Play in Sports',
        categoryId: 'cat_ethics',
        categoryName: 'Ethics & Integrity',
        difficulty: 'Intermediate',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 100,
        timeSpentSeconds: 160,
        completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    gameAttempts: [
      {
        id: 'gm_demo_c1',
        gameId: 'clean_or_banned',
        gameTitle: 'Clean or Banned?',
        score: 10,
        totalQuestions: 10,
        accuracyPercentage: 100,
        bestStreak: 10,
        xpEarned: 150,
        coinsEarned: 50,
        completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ],
  },
};

export function isDemoEmail(email) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return Boolean(DEMO_PROFILES[normalized]);
}

export function getDemoIdFromEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  return DEMO_PROFILES[normalized]?.id || null;
}

export function loadDemoUserProfile(emailOrId) {
  if (!emailOrId) return null;

  let key = emailOrId.toLowerCase().trim();
  let baseProfile = DEMO_PROFILES[key];

  if (!baseProfile) {
    // Check by id
    const found = Object.values(DEMO_PROFILES).find(p => p.id === key);
    if (found) baseProfile = found;
  }

  if (!baseProfile) return null;

  // Check if modified version exists in localStorage
  const storageKey = `cleanquest_demo_${baseProfile.id}`;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to load demo profile from localStorage:', err);
  }

  // Return cloned initial profile
  return JSON.parse(JSON.stringify(baseProfile));
}

export function saveDemoUserProfile(user) {
  if (!user || !user.id) return;
  const storageKey = `cleanquest_demo_${user.id}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save demo profile to localStorage:', err);
  }
}
