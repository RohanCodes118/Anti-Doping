import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { demoAccounts, DEMO_PASSWORD } from '../data/demoAccounts';
import {
  Eye, EyeOff, ArrowRight, Shield, Trophy, Zap,
  AlertCircle, Sparkles, Users, Fingerprint, Key, ShieldCheck
} from 'lucide-react';

const socialProofItems = [
  { icon: '🏆', text: '50,000+ athletes trained' },
  { icon: '🔥', text: 'Average 12-day streak' },
  { icon: '⭐', text: '4.9/5 athlete rating' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [demoSigningIn, setDemoSigningIn] = useState(null);
  const [passkeyAuthenticating, setPasskeyAuthenticating] = useState(false);

  const { login, loginWithPasskey, biometricsAvailable, deviceBiometrics, loading, error, setError } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  const handlePasskeyLogin = async () => {
    setPasskeyAuthenticating(true);
    setError(null);
    const success = await loginWithPasskey();
    setPasskeyAuthenticating(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleQuickDemoLogin = async (demoAccount) => {
    setDemoSigningIn(demoAccount.id);
    setError(null);
    setEmail(demoAccount.email);
    setPassword(DEMO_PASSWORD);

    const success = await login(demoAccount.email, DEMO_PASSWORD);
    if (success) {
      navigate('/dashboard');
    }
    setDemoSigningIn(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      display: 'flex',
    }}>
      {/* Left panel – branding */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(145deg, #0f1629 0%, #0a0e1a 100%)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left-panel">
        {/* Background decorations */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          top: '-100px', left: '-100px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          bottom: '-80px', right: '-80px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size="md" style={{ marginBottom: '48px' }} />

          <div style={{ marginBottom: '40px', marginTop: '32px' }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '36px', fontWeight: 900, lineHeight: 1.15,
              marginBottom: '16px',
            }}>
              Welcome back,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>champion.</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Your learning streak is waiting. Sign in to continue your clean sport journey.
            </p>
          </div>

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon: Zap, text: 'Daily challenges keep your knowledge sharp', color: '#00d4ff' },
              { icon: Trophy, text: 'Earn XP and climb the global leaderboard', color: '#f59e0b' },
              { icon: Shield, text: 'WADA-aligned content you can trust', color: '#10b981' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: `${item.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', gap: '20px', flexWrap: 'wrap',
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {socialProofItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: '28px', display: 'none' }} className="mobile-logo">
            <Logo size="md" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '28px', fontWeight: 800, marginBottom: '6px',
            }}>
              Sign in to Clean Quest
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--color-accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* ══════════════ QUICK DEMO ACCOUNTS BAR ══════════════ */}
          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#00d4ff' }}>
                <Sparkles size={13} /> Quick Demo Accounts:
              </div>
              <Link
                to="/accounts"
                style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600 }}
              >
                View all details →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {demoAccounts.map(acc => {
                const isLoggingIn = demoSigningIn === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={loading}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      background: isLoggingIn ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isLoggingIn ? acc.accentColor : 'rgba(255, 255, 255, 0.08)'}`,
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.background = `${acc.accentColor}18`;
                        e.currentTarget.style.borderColor = acc.accentColor;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!loading) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{acc.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                      {acc.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '10px', color: acc.accentColor, fontWeight: 600 }}>
                      Lv.{acc.level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══════════════ BIOMETRIC / PASSKEY SIGN IN ══════════════ */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              id="passkey-signin-btn"
              onClick={handlePasskeyLogin}
              disabled={loading || passkeyAuthenticating}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(124, 58, 237, 0.12))',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: 'white',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: loading || passkeyAuthenticating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(0, 212, 255, 0.08)',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!loading && !passkeyAuthenticating) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.22), rgba(124, 58, 237, 0.22))';
                  e.currentTarget.style.borderColor = '#00d4ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (!loading && !passkeyAuthenticating) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(124, 58, 237, 0.12))';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {passkeyAuthenticating ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', border: '2px solid rgba(0,212,255,0.3)',
                    borderTopColor: '#00d4ff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Authenticating with Biometrics...
                </>
              ) : (
                <>
                  <Fingerprint size={18} style={{ color: '#00d4ff' }} />
                  Sign in with Passkey / Biometrics
                </>
              )}
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 4px 0 4px',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}>
              <span>Face ID • Touch ID • Windows Hello</span>
              <span style={{ color: biometricsAvailable ? '#10b981' : 'var(--color-text-muted)' }}>
                {biometricsAvailable ? '🟢 Biometric Device Ready' : '⚪ WebAuthn Ready'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Or sign in with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                className="form-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="password" className="form-label" style={{ margin: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '15px',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
            By signing in, you agree to our{' '}
            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
