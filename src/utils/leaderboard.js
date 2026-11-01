// Computes live leaderboard rankings, merging the current user's real XP
// into the mock leaderboard and supporting weekly/monthly/all-time views.
// Mock athletes don't have real per-period history, so their weekly/monthly
// figures are derived as a plausible fraction of their all-time XP — this is
// purely illustrative for the prototype.

function periodXPFromHistory(user, days) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const history = user?.quizHistory || [];

  return history
    .filter(a => new Date(a.completedAt).getTime() >= since)
    .reduce((sum, a) => sum + (a.xpEarned || 0), 0);
}

function badgeForRank(rank) {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

/**
 * @param {'weekly'|'monthly'|'allTime'} period
 */
export function getLiveLeaderboard(user, mockLeaderboard, period = 'allTime') {
  const others = mockLeaderboard.filter(e => !e.isCurrentUser);

  const scaleFor = (allTimeXp) => {
    if (period === 'weekly') return Math.round(allTimeXp * 0.015);
    if (period === 'monthly') return Math.round(allTimeXp * 0.06);
    return allTimeXp;
  };

  const currentUserXp = period === 'weekly'
    ? periodXPFromHistory(user, 7)
    : period === 'monthly'
      ? periodXPFromHistory(user, 30)
      : (user?.totalXp || 0);

  const combined = [
    ...others.map(e => ({ ...e, periodXp: scaleFor(e.xp) })),
    ...(user ? [{
      rank: 0,
      name: user.name,
      username: user.username,
      xp: user.totalXp || 0,
      periodXp: currentUserXp,
      level: user.level || 1,
      sport: user.sport || 'Athlete',
      country: '🌍',
      avatar: null,
      isCurrentUser: true,
    }] : []),
  ].sort((a, b) => b.periodXp - a.periodXp);

  return combined.map((e, i) => ({ ...e, rank: i + 1, badge: badgeForRank(i + 1) }));
}
