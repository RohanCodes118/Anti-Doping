import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env
let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf-8');
} catch (e) {
  console.error('Could not read .env file');
  process.exit(1);
}

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connecting to Supabase at:', supabaseUrl);

const DEMO_ACCOUNTS = [
  {
    type: 'Beginner Athlete',
    email: 'beginner@cleanquest.io',
    password: 'CleanSport#2026',
    name: 'Sam Rivera',
    sport: 'Athletics',
    country: 'USA',
    rank: 'Rookie',
    level: 1,
    xp: 0,
    xpToNext: 500,
    totalXp: 0,
    streak: 1,
    completedChallenges: 0,
    communityInteractions: 0,
    learningProgress: {},
    challengeProgress: {},
    quizAttempts: [],
  },
  {
    type: 'Active Learner',
    email: 'learner@cleanquest.io',
    password: 'CleanSport#2026',
    name: 'Maya Lin',
    sport: 'Swimming',
    country: 'Canada',
    rank: 'Contender',
    level: 8,
    xp: 850,
    xpToNext: 1500,
    totalXp: 4200,
    streak: 5,
    completedChallenges: 3,
    communityInteractions: 4,
    learningProgress: {
      mod_001: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'], progress: 100, completed: true, completedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      mod_002: { completedLessonIds: ['l1', 'l2', 'l3', 'l4'], progress: 33, completed: false },
      mod_003: { completedLessonIds: ['l1', 'l2'], progress: 33, completed: false },
    },
    challengeProgress: {
      chl_001: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 3 * 86400000).toISOString(), lastCompletedDate: new Date().toDateString() },
      chl_002: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
      chl_003: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      chl_004: { status: 'in_progress', progress: 45 },
    },
    quizAttempts: [
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
        completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  },
  {
    type: 'Clean Sport Champion',
    email: 'champion@cleanquest.io',
    password: 'CleanSport#2026',
    name: 'Elena Rostova',
    sport: 'Cycling',
    country: 'Germany',
    rank: 'Elite Athlete',
    level: 18,
    xp: 2400,
    xpToNext: 4800,
    totalXp: 28900,
    streak: 14,
    completedChallenges: 6,
    communityInteractions: 12,
    learningProgress: {
      mod_001: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'], progress: 100, completed: true, completedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
      mod_002: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12'], progress: 100, completed: true, completedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      mod_003: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'], progress: 100, completed: true, completedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      mod_004: { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10'], progress: 100, completed: true, completedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    },
    challengeProgress: {
      chl_001: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 1 * 86400000).toISOString(), lastCompletedDate: new Date().toDateString() },
      chl_002: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
      chl_003: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      chl_004: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
      chl_005: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      chl_006: { status: 'completed', progress: 100, completedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    },
    quizAttempts: [
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
        quizTitle: 'Step-by-Step Doping Control Process',
        categoryId: 'cat_testing',
        categoryName: 'Testing Procedures',
        difficulty: 'Intermediate',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 100,
        timeSpentSeconds: 195,
        completedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c5',
        quizId: 'qz_005',
        quizTitle: 'Therapeutic Use Exemptions (TUE) Masterclass',
        categoryId: 'cat_tue',
        categoryName: 'Therapeutic Use Exemptions',
        difficulty: 'Advanced',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 200,
        timeSpentSeconds: 240,
        completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'att_demo_c6',
        quizId: 'qz_006',
        quizTitle: 'Ethics, Fair Play & Spirit of Sport',
        categoryId: 'cat_ethics',
        categoryName: 'Ethics & Values',
        difficulty: 'Beginner',
        score: 5,
        totalQuestions: 5,
        scorePercentage: 100,
        xpEarned: 50,
        timeSpentSeconds: 120,
        completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
];

async function seed() {
  console.log('--- Registering Demo Accounts via Supabase Auth ---');

  for (const acc of DEMO_ACCOUNTS) {
    console.log(`\nCreating account for ${acc.type} (${acc.email})...`);
    const { data, error } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: {
          name: acc.name,
          sport: acc.sport,
        },
      },
    });

    if (error) {
      console.log(`Note for ${acc.email}: ${error.message}`);
    } else {
      console.log(`✓ Auth user registered with ID: ${data?.user?.id || 'pending'}`);
    }
  }

  console.log('\n======================================================');
  console.log('✅ Demo accounts registered in Supabase Auth!');
  console.log('======================================================');
}

seed().catch(err => {
  console.error('Seed error:', err);
});
