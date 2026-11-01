import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { XPBar, ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/BadgeComponent';
import {
  mockChallenges, mockModules, mockLeaderboard
} from '../data/mockData';
import { getBadgesWithProgress } from '../data/badgeDefinitions';
import { getLiveLeaderboard } from '../utils/leaderboard';
import { challengeToQuizMap } from '../data/challengeQuizMap';
import {
  Flame, Clock,
  ChevronRight, Trophy, Zap, Star, CheckCircle,
  Play, Gamepad2, Coins, Sparkles,
} from 'lucide-react';

const difficultyColor = {
  Beginner: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  Advanced: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const challengeIconColor = {
  cyan: { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff' },
  purple: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  green: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  orange: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  pink: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
};

export default function DashboardPage() {
  const { user, startChallenge } = useAuthContext();
  const navigate = useNavigate();
  const u = user || {};

  const dailyChallenge = mockChallenges.find(c => c.isDaily);

  // Compute live user badges
  const liveBadges = getBadgesWithProgress(u);
  const earnedBadges = liveBadges.filter(b => b.earned);

  // Compute live leaderboard rankings
  const liveLeaderboard = getLiveLeaderboard(u, mockLeaderboard, 'allTime');
  const userRank = liveLeaderboard.find(l => l.isCurrentUser);

  // Compute live in-progress challenges
  const challengeProgress = u.challengeProgress || {};
  const inProgressChallenges = mockChallenges.filter(c => {
    const entry = challengeProgress[c.id];
    return entry && entry.status === 'in_progress';
  });

  // Display daily challenge or fallback if no in-progress
  const displayChallenges = inProgressChallenges.length > 0
    ? inProgressChallenges
    : mockChallenges.filter(c => !challengeProgress[c.id] || challengeProgress[c.id]?.status !== 'completed').slice(0, 2);

  // Compute dynamic recent activity from quizHistory
  const recentAttempts = (u.quizHistory || []).slice(0, 4);
  const recentActivities = recentAttempts.length > 0
    ? recentAttempts.map(att => ({
        id: att.id,
        text: `Completed "${att.quizTitle}" (${att.score}/${att.totalQuestions})`,
        xp: att.xpEarned,
        time: new Date(att.completedAt).toLocaleDateString(),
        icon: att.scorePercentage >= 80 ? '🎯' : '📝',
      }))
    : [
        { id: 'act_init', text: 'Welcome to Clean Quest! Take your first quiz to earn XP.', xp: null, time: 'Just now', icon: '🌱' }
      ];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const handleStartDailyChallenge = () => {
    if (dailyChallenge) {
      startChallenge(dailyChallenge.id);
      const quizId = challengeToQuizMap[dailyChallenge.id] || 'qz_001';
      navigate(`/quiz/${quizId}`);
    }
  };

  const handleChallengeClick = (ch) => {
    startChallenge(ch.id);
    const quizId = challengeToQuizMap[ch.id] || 'qz_001';
    navigate(`/quiz/${quizId}`);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ══════════════ WELCOME HEADER ══════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800, marginBottom: '4px',
            }}>
              {greeting}, {u.name?.split(' ')[0] || 'Athlete'} 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              You're on a{' '}
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                <Flame size={13} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
                {u.streak || 1}-day streak
              </span>
              ! Keep it up — today's challenge is ready.
            </p>
          </div>
          {userRank && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '50px',
            }}>
              <Trophy size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>
                Rank #{userRank.rank} Globally
              </span>
            </div>
          )}
        </div>

        {/* ══════════════ STAT CARDS ══════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            {
              label: 'Current XP',
              value: (u.xp || 0).toLocaleString(),
              sub: `${Math.round(((u.xp || 0) / (u.xpToNext || 500)) * 100)}% to Level ${(u.level || 1) + 1}`,
              icon: Zap,
              color: { bg: 'rgba(0,212,255,0.12)', text: '#00d4ff' },
              accent: '#00d4ff',
            },
            {
              label: 'Current Level',
              value: `Lv. ${u.level || 1}`,
              sub: u.rank || 'Rookie',
              icon: Star,
              color: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
              accent: '#f59e0b',
            },
            {
              label: 'Daily Streak',
              value: `${u.streak || 1} Days`,
              sub: '🔥 On fire!',
              icon: Flame,
              color: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
              accent: '#ef4444',
            },
            {
              label: 'Clean Coins',
              value: (u.cleanCoins ?? 100).toLocaleString(),
              sub: '🪙 Arcade & Rewards',
              icon: Coins,
              color: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
              accent: '#f59e0b',
            },
            {
              label: 'Quizzes / Activities',
              value: `${(u.quizHistory || []).length + (u.gameAttempts || []).length}`,
              sub: `completed activities`,
              icon: CheckCircle,
              color: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
              accent: '#10b981',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} style={{
                background: 'rgba(19, 25, 41, 0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${stat.accent}30`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${stat.accent}12`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: stat.color.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <Icon size={18} style={{ color: stat.color.text }} />
                </div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '26px', fontWeight: 800, marginBottom: '4px', color: stat.accent,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ══════════════ XP PROGRESS BAR ══════════════ */}
        <div style={{
          background: 'rgba(19, 25, 41, 0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(124, 58, 237, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>⚡</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Level {u.level || 1} → Level {(u.level || 1) + 1}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{(u.totalXp || 0).toLocaleString()} total XP earned</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px', color: '#00d4ff' }}>
                {(u.xp || 0).toLocaleString()} / {(u.xpToNext || 500).toLocaleString()} XP
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {Math.max(0, (u.xpToNext || 500) - (u.xp || 0)).toLocaleString()} XP to next level
              </div>
            </div>
          </div>
          <XPBar current={u.xp || 0} total={u.xpToNext || 500} showLabel={false} height={10} />
        </div>

        {/* ══════════════ MAIN GRID ══════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '28px',
        }} className="dashboard-grid">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Today's Challenge */}
            {dailyChallenge && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.08))',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px',
                  width: '200px', height: '200px',
                  background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
                  borderRadius: '50%', pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{
                    padding: '3px 12px', borderRadius: '50px',
                    background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    <Flame size={10} /> TODAY'S CHALLENGE
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'rgba(0, 212, 255, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', flexShrink: 0,
                  }}>
                    {dailyChallenge.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                      {dailyChallenge.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                      {dailyChallenge.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{dailyChallenge.timeEstimate}</span>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: '#00d4ff',
                      }}>+{dailyChallenge.xpReward} XP</span>
                      <button
                        onClick={handleStartDailyChallenge}
                        style={{
                          marginLeft: 'auto',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                          color: 'white', border: 'none',
                          fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                          fontSize: '13px', borderRadius: '50px', cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,255,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,212,255,0.3)'; }}
                      >
                        <Play size={12} /> Start Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clean or Banned? Mini-Game Spotlight */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'rgba(0, 212, 255, 0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0,
                  }}>
                    🎮
                  </div>
                  <div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '11px', fontWeight: 700, color: '#00d4ff',
                      background: 'rgba(0, 212, 255, 0.12)', padding: '2px 8px', borderRadius: '50px',
                      marginBottom: '4px',
                    }}>
                      <Sparkles size={10} /> MINI-GAME SPOTLIGHT
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '2px' }}>
                      Clean or Banned?
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      Test your anti-doping instincts across 10 real-world scenarios. Win up to +150 XP & +50 Clean Coins!
                    </p>
                  </div>
                </div>

                <Link
                  to="/games/clean-or-banned"
                  className="btn-primary"
                  style={{
                    padding: '10px 20px', fontSize: '13px', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.25)',
                  }}
                >
                  <Play size={13} fill="white" /> Play Game
                </Link>
              </div>
            </div>

            {/* Clean Quest AI Assistant Spotlight */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(124, 58, 237, 0.1) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.22)',
              borderRadius: '20px',
              padding: '22px 24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.25))',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '11px', fontWeight: 700, color: '#00d4ff',
                      background: 'rgba(0, 212, 255, 0.12)', padding: '2px 8px', borderRadius: '50px',
                      marginBottom: '4px',
                    }}>
                      <Sparkles size={10} /> CLEAN QUEST AI
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '2px' }}>
                      Have a medicine or supplement question?
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Scan product packages or inspect active ingredients with AI-assisted anti-doping guidance.
                    </p>
                  </div>
                </div>

                <Link
                  to="/ai-assistant"
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    color: 'white',
                    borderRadius: '50px',
                    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.25)',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 212, 255, 0.25)';
                  }}
                >
                  Scan / Ask AI →
                </Link>
              </div>
            </div>

            {/* In-Progress / Recommended Challenges */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700 }}>
                  Featured Challenges
                </h2>
                <Link to="/challenges" style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', color: '#00d4ff', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayChallenges.map(ch => {
                  const ic = challengeIconColor[ch.color] || challengeIconColor.cyan;
                  const dc = difficultyColor[ch.difficulty] || difficultyColor.Beginner;
                  const chProg = challengeProgress[ch.id]?.progress || 0;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleChallengeClick(ch)}
                      style={{
                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                        padding: '14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '14px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = `${ic.color}30`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: ic.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                      }}>
                        {ch.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ fontWeight: 600, fontSize: '14px', marginRight: '8px' }}>{ch.title}</h4>
                          <span style={{
                            fontSize: '12px', fontWeight: 700, color: ic.color, whiteSpace: 'nowrap',
                          }}>+{ch.xpReward} XP</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '50px', fontSize: '10px', fontWeight: 600,
                            background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                          }}>{ch.difficulty}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> {ch.timeEstimate}
                          </span>
                        </div>
                        {chProg > 0 && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Progress</span>
                              <span style={{ fontSize: '11px', color: ic.color, fontWeight: 600 }}>{chProg}%</span>
                            </div>
                            <ProgressBar value={chProg} color={ch.color} height={4} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Modules */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700 }}>
                  Learning Paths
                </h2>
                <Link to="/learn" style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', color: '#00d4ff', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Browse All <ChevronRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="module-grid">
                {mockModules.map(mod => {
                  const ic = challengeIconColor[mod.color] || challengeIconColor.cyan;
                  const modProgress = u.learningProgress?.[mod.id]?.progress || 0;
                  const isDone = u.learningProgress?.[mod.id]?.completed || modProgress === 100;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => navigate('/learn')}
                      style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '14px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = `${ic.color}30`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{mod.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', lineHeight: 1.3 }}>{mod.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                        {mod.lessons} lessons · {mod.duration}
                      </div>
                      <ProgressBar value={modProgress} color={mod.color} height={4} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{modProgress}%</span>
                        {isDone && (
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={10} /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Live Badges */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 700 }}>
                  Your Badges
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {earnedBadges.length}/{liveBadges.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {liveBadges.slice(0, 6).map(b => (
                  <Badge key={b.id} icon={b.icon} name={b.name} description={b.description} earned={b.earned} size="sm" />
                ))}
              </div>
              <Link to="/badges" style={{
                width: '100%', marginTop: '12px',
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: 'var(--color-text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}>
                View All Badges <ChevronRight size={12} />
              </Link>
            </div>

            {/* Activity Feed */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '20px',
            }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
                Recent Activity
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {recentActivities.map((act) => (
                  <div key={act.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '10px',
                    borderRadius: '10px',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px',
                    }}>{act.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{act.text}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{act.time}</div>
                    </div>
                    {act.xp && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                        +{act.xp} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 700 }}>
                  Leaderboard
                </h2>
                <Link to="/leaderboard" style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', color: '#00d4ff', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Full Leaderboard <ChevronRight size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {liveLeaderboard.slice(0, 5).map((entry, i) => (
                  <div key={entry.rank} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px',
                    background: entry.isCurrentUser ? 'rgba(0, 212, 255, 0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${entry.isCurrentUser ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '12px',
                  }}>
                    <div style={{
                      width: '22px', textAlign: 'center',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700, fontSize: '13px',
                      color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b87333' : 'var(--color-text-muted)',
                    }}>
                      {entry.badge || `#${entry.rank}`}
                    </div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${entry.rank * 47}, 70%, 50%), hsl(${entry.rank * 47 + 60}, 70%, 60%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '11px', color: 'white', flexShrink: 0,
                    }}>{entry.name?.charAt(0) || 'A'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px', fontWeight: entry.isCurrentUser ? 700 : 500,
                        color: entry.isCurrentUser ? '#00d4ff' : 'var(--color-text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {entry.name} {entry.isCurrentUser ? '(You)' : entry.country}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Lv. {entry.level}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                      {entry.periodXp > 999 ? `${(entry.periodXp / 1000).toFixed(1)}k` : entry.periodXp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .module-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
