import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { getBadgesWithProgress } from '../data/badgeDefinitions';
import { ProgressBar } from '../components/ProgressBar';
import { X, Award, Lock } from 'lucide-react';

const colorMap = {
  cyan: { bg: 'rgba(0, 212, 255, 0.15)', border: 'rgba(0, 212, 255, 0.3)', text: '#00d4ff' },
  purple: { bg: 'rgba(124, 58, 237, 0.2)', border: 'rgba(124, 58, 237, 0.3)', text: '#a78bfa' },
  green: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
  orange: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
};

export default function BadgesPage() {
  const { user } = useAuthContext();
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badges = useMemo(() => getBadgesWithProgress(user), [user]);
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px' }}>🏅</span>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
                Badges & Achievements
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
              Badges unlock automatically as you complete quizzes, modules, and challenges. Click any badge to see its requirements.
            </p>
          </div>

          <div style={{
            padding: '10px 16px', background: 'rgba(19, 25, 41, 0.8)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Unlocked</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#00d4ff' }}>
              {earnedCount} / {badges.length}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {badges.map(badge => {
            const c = colorMap[badge.color] || colorMap.cyan;
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  padding: '22px 14px',
                  background: 'var(--color-bg-card)',
                  border: `1px solid ${badge.earned ? c.border : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  opacity: badge.earned ? 1 : 0.55,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = c.border; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = badge.earned ? c.border : 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: badge.earned ? `linear-gradient(135deg, ${c.bg}, rgba(124,58,237,0.15))` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${badge.earned ? c.border : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                  filter: badge.earned ? 'none' : 'grayscale(1)',
                }}>
                  {badge.earned ? badge.icon : <Lock size={22} style={{ color: 'var(--color-text-muted)' }} />}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{badge.name}</div>
                {!badge.earned && (
                  <div style={{ width: '100%' }}>
                    <ProgressBar value={(badge.progress / badge.target) * 100} color={badge.color} height={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail modal */}
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <div onClick={e => e.stopPropagation()} style={{
              background: 'rgba(19, 25, 41, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center',
              position: 'relative',
            }}>
              <button onClick={() => setSelectedBadge(null)} style={{
                position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none',
                color: 'var(--color-text-muted)', cursor: 'pointer',
              }}>
                <X size={18} />
              </button>

              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 16px',
                background: selectedBadge.earned
                  ? `linear-gradient(135deg, ${(colorMap[selectedBadge.color] || colorMap.cyan).bg}, rgba(124,58,237,0.2))`
                  : 'rgba(255,255,255,0.04)',
                border: `3px solid ${selectedBadge.earned ? (colorMap[selectedBadge.color] || colorMap.cyan).border : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px',
                filter: selectedBadge.earned ? 'none' : 'grayscale(1)',
              }}>
                {selectedBadge.earned ? selectedBadge.icon : <Lock size={32} style={{ color: 'var(--color-text-muted)' }} />}
              </div>

              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                {selectedBadge.name}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
                {selectedBadge.description}
              </p>

              {selectedBadge.earned ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '50px', color: '#10b981', fontSize: '13px', fontWeight: 700,
                }}>
                  <Award size={14} /> Unlocked
                </div>
              ) : (
                <div>
                  <ProgressBar value={(selectedBadge.progress / selectedBadge.target) * 100} color={selectedBadge.color} height={6} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    {selectedBadge.progressLabel}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
