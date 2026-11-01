import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../layouts/PublicNavbar';
import {
  Zap, Trophy, Target, Users, Shield,
  ChevronRight, Star, ArrowRight, CheckCircle, Flame, HelpCircle
} from 'lucide-react';
import { platformStats } from '../data/mockData';
import { quizCategories } from '../data/quizData';

/* ── decorative floating stat cards ── */
const floatCards = [
  { icon: '🏆', label: 'Top Scorer', value: 'Jordan C.', sub: '28,500 XP', color: '#f59e0b' },
  { icon: '🔥', label: 'Longest Streak', value: '42 Days', sub: 'Maria S.', color: '#ef4444' },
  { icon: '🎯', label: 'Quiz Mastered', value: '100% Score', sub: '+200 XP earned', color: '#10b981' },
];

const featureSections = [
  {
    icon: HelpCircle,
    title: 'Interactive Quiz Engine',
    description: 'Test your anti-doping knowledge with real-time feedback and detailed WADA rule explanations.',
    color: 'cyan',
    stat: 'Interactive Engine',
  },
  {
    icon: Target,
    title: 'Daily Challenges',
    description: 'Fresh anti-doping challenges every day to keep your knowledge sharp and your streak alive.',
    color: 'purple',
    stat: '200+ Challenges',
  },
  {
    icon: Zap,
    title: 'XP & Level Progress',
    description: 'Earn XP with every quiz completed. Level up your athlete profile and climb global ranks.',
    color: 'orange',
    stat: 'Infinite Progress',
  },
  {
    icon: Trophy,
    title: 'Badges & Achievements',
    description: 'Collect badges for mastering topics, maintaining streaks, and helping fellow athletes.',
    color: 'green',
    stat: '50+ Badges',
  },
  {
    icon: Users,
    title: 'Global Leaderboard',
    description: 'Compete with athletes worldwide. See where you stand in the clean sport community.',
    color: 'pink',
    stat: '50K+ Athletes',
  },
  {
    icon: Shield,
    title: 'WADA Aligned',
    description: 'All content is aligned with WADA\'s latest code and regulations for accuracy you can trust.',
    color: 'cyan',
    stat: '100% Accurate',
  },
];

const iconColors = {
  cyan: { bg: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff' },
  purple: { bg: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' },
  green: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
  orange: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  pink: { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' },
};

const testimonials = [
  {
    name: 'Sarah Mitchell',
    sport: 'Olympic Swimmer',
    country: '🇦🇺',
    quote: 'Clean Quest made anti-doping education actually enjoyable. I now feel fully confident about my responsibilities as an athlete.',
    xp: 15200,
    level: 14,
  },
  {
    name: 'Diego Alvarez',
    sport: 'Professional Cyclist',
    country: '🇪🇸',
    quote: 'The daily quizzes keep me consistent. I\'ve learned more in two months than I did in years of traditional training seminars.',
    xp: 22100,
    level: 18,
  },
  {
    name: 'Amara Osei',
    sport: 'Sprint Athlete',
    country: '🇬🇭',
    quote: 'Finally, an app that treats athletes like adults. The instant quiz feedback is comprehensive but never boring. 10/10 recommend!',
    xp: 9800,
    level: 10,
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      <PublicNavbar />

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px 60px',
      }}>
        {/* Background elements */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', width: '600px', height: '600px',
            top: '-100px', left: '-100px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', width: '500px', height: '500px',
            top: '20%', right: '-50px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }} className="hero-grid">
            {/* Left: text */}
            <div className="fade-in-up">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px',
                background: 'rgba(0, 212, 255, 0.08)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '50px',
                marginBottom: '24px',
              }}>
                <Shield size={12} style={{ color: '#00d4ff' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#00d4ff', letterSpacing: '0.5px' }}>
                  WADA-ALIGNED EDUCATION PLATFORM
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(40px, 5vw, 68px)',
                fontWeight: 900,
                lineHeight: 1.05,
                marginBottom: '24px',
                letterSpacing: '-1px',
              }}>
                Play Fair.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 60%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Learn Smart.
                </span>
                <br />
                Stay Clean.
              </h1>

              <p style={{
                fontSize: '18px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '36px',
                maxWidth: '480px',
              }}>
                The gamified anti-doping education platform built for athletes.
                Master clean sport principles through interactive quizzes, daily challenges, and XP rewards.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link to="/login" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  🔑 Sign In to Clean Quest <ArrowRight size={16} />
                </Link>
                <Link to="/accounts" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 24px', textDecoration: 'none' }}>
                  👥 Demo Athletes
                </Link>
              </div>

              {/* Trust indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {platformStats.map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating UI mockup */}
            <div style={{ position: 'relative', minHeight: '500px' }} className="hero-visual">
              <div style={{
                position: 'absolute', top: '20px', left: '10px', right: '10px',
                background: 'rgba(19, 25, 41, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)',
                animation: 'float 4s ease-in-out infinite',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '16px', color: 'white',
                  }}>A</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Alex Rivera</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      🌟 Level 12 · Gold Athlete
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{
                      fontSize: '11px', color: '#f59e0b', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Flame size={11} /> 7-day streak
                    </div>
                  </div>
                </div>

                {/* XP Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>XP Progress</span>
                    <span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 600 }}>3,450 / 4,000</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: '86%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #00d4ff)', borderRadius: '100px' }} />
                  </div>
                </div>

                {/* Mini quiz card */}
                <Link to="/quizzes" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: 'rgba(0, 212, 255, 0.06)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(0, 212, 255, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0,
                    }}>🎯</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
                        Anti-Doping Basics Quiz
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>5 Questions · +50 XP</div>
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: '50px',
                      background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                      color: 'white', fontWeight: 700, fontSize: '12px',
                    }}>
                      Start
                    </div>
                  </div>
                </Link>

                {/* Badges row */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    RECENT BADGES
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['🏅', '🔥', '📚', '⚖️'].map((b, i) => (
                      <div key={i} style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                      }}>{b}</div>
                    ))}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600,
                    }}>+12</div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              {floatCards.map((card, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  right: i === 0 ? '-20px' : i === 1 ? '-30px' : '20px',
                  top: i === 0 ? '60%' : i === 1 ? '20%' : undefined,
                  bottom: i === 2 ? '-20px' : undefined,
                  background: 'rgba(19, 25, 41, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${card.color}33`,
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  minWidth: '160px',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${card.color}22`,
                  animation: `float ${3.5 + i * 0.5}s ease-in-out ${i * 0.8}s infinite`,
                  zIndex: 2,
                }}>
                  <span style={{ fontSize: '20px' }}>{card.icon}</span>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{card.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            .hero-visual { display: none; }
          }
        `}</style>
      </section>

      {/* ════════════════════ INTERACTIVE QUIZ ENGINE SECTION ════════════════════ */}
      <section style={{
        padding: '90px 24px',
        background: 'linear-gradient(180deg, rgba(15, 22, 41, 0.6) 0%, rgba(10, 14, 26, 0.9) 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: '48px', flexWrap: 'wrap', gap: '20px',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.25)', borderRadius: '50px', marginBottom: '16px',
              }}>
                <HelpCircle size={14} style={{ color: '#00d4ff' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.5px' }}>
                  FEATURED QUIZ ENGINE
                </span>
              </div>

              <h2 className="section-title">
                Test Your Anti-Doping Knowledge
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', marginTop: '8px', maxWidth: '540px' }}>
                Pick a category below to test your understanding of clean sport principles, WADA regulations, and athlete rights.
              </p>
            </div>

            <Link to="/quizzes" className="btn-primary" style={{ fontSize: '15px', padding: '12px 28px' }}>
              Explore All Quizzes <ArrowRight size={16} />
            </Link>
          </div>

          {/* Category Preview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {quizCategories.slice(0, 6).map(cat => (
              <div
                key={cat.id}
                style={{
                  background: 'rgba(19, 25, 41, 0.85)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0, 212, 255, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'rgba(0, 212, 255, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', marginBottom: '16px',
                  }}>
                    {cat.icon}
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    {cat.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {cat.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {cat.totalQuizzes} Quizzes Available
                  </span>

                  <Link to="/quizzes" style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '13px', fontWeight: 700, color: '#00d4ff', textDecoration: 'none',
                  }}>
                    Take Quiz <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURES GRID ════════════════════ */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '50px', marginBottom: '16px',
            }}>
              <Zap size={12} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.5px' }}>PLATFORM FEATURES</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: '16px' }}>
              Everything You Need to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Compete Clean</span>
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
              Clean Quest combines cutting-edge gamification with expert anti-doping knowledge to create an experience athletes actually love.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {featureSections.map((feature, i) => {
              const Icon = feature.icon;
              const c = iconColors[feature.color] || iconColors.cyan;
              return (
                <div key={i} style={{
                  background: 'rgba(19, 25, 41, 0.8)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '28px',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${c.color}40`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 24px ${c.color}15`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: c.bg, color: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                    {feature.description}
                  </p>
                  <span style={{
                    display: 'inline-flex', padding: '4px 12px', borderRadius: '50px',
                    fontSize: '11px', fontWeight: 600, background: c.bg, color: c.color,
                    border: `1px solid ${c.color}33`,
                  }}>
                    {feature.stat}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTIMONIALS ════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">
              Trusted by{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981, #00d4ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Clean Athletes</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', marginTop: '12px' }}>
              Athletes from around the world love training with Clean Quest.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(19, 25, 41, 0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '28px',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `linear-gradient(135deg, hsl(${i * 120}, 70%, 50%), hsl(${i * 120 + 60}, 70%, 60%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '16px', color: 'white',
                  }}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name} {t.country}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.sport} · Level {t.level}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#00d4ff' }}>{t.xp.toLocaleString()} XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA SECTION ════════════════════ */}
      <section style={{
        padding: '100px 24px',
        background: 'rgba(15, 22, 41, 0.6)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            position: 'relative',
            padding: '60px 40px',
            background: 'rgba(19, 25, 41, 0.9)',
            borderRadius: '24px',
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 900, marginBottom: '16px', lineHeight: 1.15,
            }}>
              Ready to Champion{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Clean Sport?</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
              Join 50,000+ athletes already taking quizzes, competing, and staying clean.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <Link to="/quizzes" className="btn-primary" style={{ fontSize: '16px', padding: '14px 36px' }}>
                🎯 Take a Quiz Now <ArrowRight size={16} />
              </Link>
              <Link to="/signup" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 36px' }}>
                Create Account
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {['Free to join', 'No credit card', 'WADA aligned'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer style={{
        padding: '48px 24px 32px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    borderRadius: '30% 30% 50% 50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px',
                    background: 'linear-gradient(135deg, #00d4ff, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>Clean Quest</span>
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '220px' }}>
                Gamified anti-doping education for athletes who play fair, learn smart, and stay clean.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Quiz Center', 'Leaderboard', 'Badges', 'Learning Paths'] },
              { title: 'Resources', links: ['WADA Code', 'Prohibited List', 'TUE Guide', 'Athlete Rights'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {col.title}
                </div>
                {col.links.map(link => (
                  <Link key={link} to={link === 'Quiz Center' ? '/quizzes' : '#'} style={{
                    display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)',
                    marginBottom: '10px', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
                  >{link}</Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              © 2024 Clean Quest. All rights reserved. Aligned with WADA World Anti-Doping Code.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Cookies'].map(item => (
                <a key={item} href="#" style={{
                  fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--color-text-secondary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
                >{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
