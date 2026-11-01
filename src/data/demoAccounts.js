/**
 * Demo Accounts Configuration for Clean Quest
 * These accounts correspond to pre-seeded Supabase users with distinct progression.
 * For development & demo workflows, password defaults to standard demo credentials.
 */

export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'CleanSport#2026';

export const demoAccounts = [
  {
    id: 'demo_beginner',
    email: 'beginner@cleanquest.io',
    name: 'Sam Rivera',
    sport: 'Athletics',
    country: 'USA',
    roleTag: 'Beginner Athlete',
    level: 1,
    totalXp: 0,
    streak: 1,
    completedQuizzes: 0,
    unlockedBadges: 0,
    cleanCoins: 100,
    avatarGradient: 'linear-gradient(135deg, #10b981, #065f46)',
    icon: '🌱',
    accentColor: '#10b981',
    description: 'Fresh account with 0 XP and no completed quizzes. Perfect for demonstrating new user onboarding and first-time quiz flows.',
    highlights: ['Level 1 (Rookie)', '0 XP', 'Fresh Progress State', '100 Clean Coins'],
  },
  {
    id: 'demo_learner',
    email: 'learner@cleanquest.io',
    name: 'Maya Lin',
    sport: 'Swimming',
    country: 'Canada',
    roleTag: 'Active Learner',
    level: 8,
    totalXp: 4200,
    streak: 5,
    completedQuizzes: 3,
    unlockedBadges: 3,
    cleanCoins: 250,
    avatarGradient: 'linear-gradient(135deg, #00d4ff, #0284c7)',
    icon: '📚',
    accentColor: '#00d4ff',
    description: 'Mid-progress athlete with 3 completed quizzes, active learning module progress, 3 challenges completed, and a 5-day streak.',
    highlights: ['Level 8 (Contender)', '4,200 XP', '3 Quizzes Completed', '5-Day Streak 🔥'],
  },
  {
    id: 'demo_champion',
    email: 'champion@cleanquest.io',
    name: 'Elena Rostova',
    sport: 'Cycling',
    country: 'Germany',
    roleTag: 'Clean Sport Champion',
    level: 18,
    totalXp: 28900,
    streak: 14,
    completedQuizzes: 6,
    unlockedBadges: 8,
    cleanCoins: 850,
    avatarGradient: 'linear-gradient(135deg, #f59e0b, #7c3aed)',
    icon: '🏆',
    accentColor: '#f59e0b',
    description: 'Elite power user with 28,900 XP, 6 completed quizzes (100% scores), 8 unlocked badges, all learning paths finished, and high global leaderboard rank.',
    highlights: ['Level 18 (Elite Athlete)', '28,900 XP', '8 Badges Unlocked 🎖️', '14-Day Streak 🔥'],
  },
];
