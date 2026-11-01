import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { mockLeaderboard } from '../data/mockData';
import { getLiveLeaderboard } from '../utils/leaderboard';
import { Trophy } from 'lucide-react';

const tabs = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'allTime', label: 'All Time' },
];

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const [period, setPeriod] = useState('allTime');

  const rankings = useMemo(() => getLiveLeaderboard(user, mockLeaderboard, period), [user, period]);
  const currentUserEntry = rankings.find(r => r.isCurrentUser);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
              Leaderboard
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            See how you stack up against athletes worldwide.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setPeriod(t.key)}
              style={{
                padding: '8px 18px', borderRadius: '50px', border: '1px solid',
                borderColor: period === t.key ? 'rgba(0,212,255,0.3)' : 'transparent',
                background: period === t.key ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: period === t.key ? '#00d4ff' : 'var(--color-text-secondary)',
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Current user highlight bar */}
        {currentUserEntry && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))',
            border: '1px solid rgba(0,212,255,0.3)', borderRadius: '16px', marginBottom: '20px',
          }}>
            <Trophy size={20} style={{ color: '#f59e0b' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>You're ranked #{currentUserEntry.rank}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {tabs.find(t => t.key === period).label} · {currentUserEntry.periodXp.toLocaleString()} XP
              </div>
            </div>
          </div>
        )}

        {/* Rankings list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rankings.map((entry, i) => {
            const displayName = entry.name || entry.username || 'Athlete';
            const displayXp = (entry.periodXp || 0).toLocaleString();
            return (
              <div key={entry.username || entry.name || `entry-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                background: entry.isCurrentUser ? 'rgba(0, 212, 255, 0.08)' : 'rgba(19, 25, 41, 0.8)',
                border: `1px solid ${entry.isCurrentUser ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '14px',
              }}>
                <div style={{
                  width: '30px', textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '15px',
                  color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b87333' : 'var(--color-text-muted)',
                }}>
                  {entry.badge || `#${entry.rank}`}
                </div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${entry.rank * 47}, 70%, 50%), hsl(${entry.rank * 47 + 60}, 70%, 60%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', color: 'white', flexShrink: 0,
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: entry.isCurrentUser ? 700 : 500,
                    color: entry.isCurrentUser ? '#00d4ff' : 'var(--color-text-primary)',
                  }}>
                    {displayName} {entry.isCurrentUser ? '(You)' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Level {entry.level || 1} · {entry.sport || 'Athlete'}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                  {displayXp} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
