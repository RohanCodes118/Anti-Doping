import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Gamepad2, Trophy, Flame, Play, Star, Sparkles, Coins,
  Clock, Shield, ArrowRight, CheckCircle, Lock, Target, Zap
} from 'lucide-react';

export default function GamesPage() {
  const auth = useAuthContext();
  const user = auth?.user || null;
  const displayUser = user || { name: 'Athlete', cleanCoins: 100, xp: 0, level: 1, streak: 0 };
  const navigate = useNavigate();

  let bestCobScore = null;
  try {
    const gameAttempts = Array.isArray(displayUser?.gameAttempts) ? displayUser.gameAttempts : [];
    const cobAttempts = gameAttempts.filter(g => g && g.gameId === 'clean_or_banned');
    const validScores = cobAttempts.map(g => (typeof g?.score === 'number' ? g.score : 0));
    bestCobScore = validScores.length > 0 ? Math.max(...validScores) : null;
  } catch (e) {
    console.error('Error computing game attempts:', e);
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>🎮</span>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
                Clean Quest Arcade
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '580px' }}>
              Test your split-second anti-doping decisions, compete in interactive scenarios, and earn XP and Clean Coins.
            </p>
          </div>

          {/* Clean Coins & Stats pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 18px',
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            }}>
              🪙
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Clean Coins</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#f59e0b' }}>
                {displayUser?.cleanCoins ?? 100}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ FEATURED GAME: CLEAN OR BANNED? ══════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: '24px',
          padding: '32px 28px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 12px 32px rgba(0, 212, 255, 0.08)',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '240px', height: '240px',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '50px',
            background: 'rgba(0, 212, 255, 0.15)', border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            marginBottom: '16px',
          }}>
            <Sparkles size={12} /> FEATURED MINI-GAME
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ maxWidth: '580px' }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3.5vw, 32px)',
                fontWeight: 900, marginBottom: '10px',
              }}>
                Clean or Banned?
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                Face 10 realistic athletic scenarios: OTC medications, supplements, emergency treatments, and dietary choices. Choose whether each is <strong>Clean (Allowed)</strong>, <strong>Banned (Prohibited)</strong>, or requires <strong>Checking & Verifying First</strong>.
              </p>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>5-8 mins</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} style={{ color: '#00d4ff' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>10 Scenarios</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={15} style={{ color: '#00d4ff' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#00d4ff' }}>+150 XP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={15} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>+50 Coins</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to="/games/clean-or-banned"
                  className="btn-primary"
                  style={{
                    padding: '14px 28px', fontSize: '15px', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)',
                  }}
                >
                  <Play size={16} fill="white" /> Play "Clean or Banned?"
                </Link>

                {bestCobScore !== null && (
                  <span style={{
                    fontSize: '13px', color: '#10b981', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    <CheckCircle size={15} /> Best Score: {bestCobScore}/10
                  </span>
                )}
              </div>
            </div>

            {/* Visual game card preview */}
            <div style={{
              background: 'rgba(10, 14, 26, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '300px',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px', fontWeight: 600 }}>
                Answer Format Preview
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <CheckCircle size={15} /> Allowed (Clean)
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '14px' }}>🚫</span> Prohibited (Banned)
                </div>

                <div style={{
                  padding: '10px 14px', borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '14px' }}>⚠️</span> Check / Verify First
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ UPCOMING ARCADE GAMES TEASERS ══════════════ */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
            More Mini-Games
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              {
                title: 'Doping Control Room Simulator',
                desc: 'Step into the shoes of an athlete selected for doping control. Make the right sample collection choices.',
                icon: '🧪',
                color: 'purple',
                badge: 'Coming Soon',
              },
              {
                title: 'Whereabouts 60-Minute Rush',
                desc: 'Manage filing windows, sudden schedule changes, and travel updates under time pressure without missing tests.',
                icon: '📍',
                color: 'pink',
                badge: 'Coming Soon',
              },
              {
                title: 'Supplement Label Detective',
                desc: 'Analyze real supplement labels to identify hidden prohibited stimulants, proprietary blends, and warning signs.',
                icon: '🔍',
                color: 'orange',
                badge: 'Coming Soon',
              },
            ].map((game, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(19, 25, 41, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '18px',
                  padding: '24px',
                  opacity: 0.75,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '32px' }}>{game.icon}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: '50px',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)',
                    fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Lock size={10} /> {game.badge}
                  </span>
                </div>

                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                  {game.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {game.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
