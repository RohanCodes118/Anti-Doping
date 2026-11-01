import { mockBadges } from './mockData';
import { quizzes, quizCategories } from './quizData';

// Extra badges to round out the set the spec calls out by name
// (First Steps / Quiz Master / Knowledge Explorer / 7-Day Warrior / Clean Sport Champion).
// "Clean Start" and "Week Warrior" already cover First Steps / 7-Day Warrior.
const extraBadgeInfo = [
  { id: 'bdg_007', name: 'Quiz Master', description: 'Complete every quiz in the Quiz Center', icon: '🎯', color: 'orange' },
  { id: 'bdg_008', name: 'Knowledge Explorer', description: 'Complete quizzes from at least 4 different categories', icon: '🧭', color: 'cyan' },
  { id: 'bdg_009', name: 'Clean Sport Champion', description: 'Reach Level 15', icon: '👑', color: 'purple' },
];

// Base badge info (name/description/icon/color) without the static earned flags —
// earned status is now computed live from the user's real activity.
export const badgeInfo = [
  ...mockBadges.map(({ earned: _earned, earnedDate: _earnedDate, ...rest }) => rest),
  ...extraBadgeInfo,
];

/**
 * Compute earned status + progress for every badge based on the user's
 * actual activity (quiz history, streak, learning progress, community
 * interactions, level). Returns the full badge list merged with live status.
 */
export function getBadgesWithProgress(user) {
  const history = user?.quizHistory || [];
  const learningProgress = user?.learningProgress || {};
  const communityInteractions = user?.communityInteractions || 0;
  const streak = user?.streak || 0;
  const level = user?.level || 1;

  const highScoreCount = history.filter(a => a.scorePercentage >= 90).length;
  const distinctCategories = new Set(history.map(a => a.categoryId)).size;
  const distinctQuizzesCompleted = new Set(history.map(a => a.quizId)).size;
  const ethicsModuleDone = learningProgress['mod_003']?.completed || false;
  const totalLessonsCompleted = Object.values(learningProgress)
    .reduce((sum, m) => sum + (m.completedLessonIds?.length || 0), 0);

  const statusById = {
    bdg_001: {
      earned: history.length >= 1,
      progress: Math.min(history.length, 1),
      target: 1,
      progressLabel: `${Math.min(history.length, 1)}/1 quiz completed`,
    },
    bdg_002: {
      earned: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
      progressLabel: `${Math.min(streak, 7)}/7 day streak`,
    },
    bdg_003: {
      earned: highScoreCount >= 5,
      progress: Math.min(highScoreCount, 5),
      target: 5,
      progressLabel: `${Math.min(highScoreCount, 5)}/5 quizzes scored 90%+`,
    },
    bdg_004: {
      earned: ethicsModuleDone,
      progress: ethicsModuleDone ? 1 : 0,
      target: 1,
      progressLabel: ethicsModuleDone ? 'Module complete' : 'Complete the Ethics & Fair Play module',
    },
    bdg_005: {
      earned: totalLessonsCompleted >= 5,
      progress: Math.min(totalLessonsCompleted, 5),
      target: 5,
      progressLabel: `${Math.min(totalLessonsCompleted, 5)}/5 lessons completed`,
    },
    bdg_006: {
      earned: communityInteractions >= 10,
      progress: Math.min(communityInteractions, 10),
      target: 10,
      progressLabel: `${Math.min(communityInteractions, 10)}/10 community interactions`,
    },
    bdg_007: {
      earned: distinctQuizzesCompleted >= quizzes.length,
      progress: Math.min(distinctQuizzesCompleted, quizzes.length),
      target: quizzes.length,
      progressLabel: `${Math.min(distinctQuizzesCompleted, quizzes.length)}/${quizzes.length} quizzes completed`,
    },
    bdg_008: {
      earned: distinctCategories >= 4,
      progress: Math.min(distinctCategories, 4),
      target: 4,
      progressLabel: `${Math.min(distinctCategories, Math.min(4, quizCategories.length))}/4 categories explored`,
    },
    bdg_009: {
      earned: level >= 15,
      progress: Math.min(level, 15),
      target: 15,
      progressLabel: `Level ${Math.min(level, 15)}/15`,
    },
  };

  return badgeInfo.map(b => ({
    ...b,
    earned: statusById[b.id]?.earned || false,
    progress: statusById[b.id]?.progress || 0,
    target: statusById[b.id]?.target || 1,
    progressLabel: statusById[b.id]?.progressLabel || '',
  }));
}
