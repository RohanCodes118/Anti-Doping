import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { demoAccounts, DEMO_PASSWORD } from '../data/demoAccounts';
import {
  Users, ArrowRight, Shield, Zap, Trophy, Flame,
  CheckCircle, Sparkles, LogIn, UserPlus, AlertCircle, Fingerprint
} from 'lucide-react';

export default function AccountSelectPage() {
  const { login, loading: authLoading, error: authError } = useAuthContext();
  const navigate = useNavigate();
  const [selectedDemoId, setSelectedDemoId] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSelectDemo = async (demoAccount) => {
    setSelectedDemoId(demoAccount.id);
    setLoggingIn(true);
    setErrorMsg(null);

    try {
      const success = await login(demoAccount.email, DEMO_PASSWORD);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMsg('Failed to sign in to demo account. Please try again.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setErrorMsg('An unexpected error occurred during demo sign in.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary, #0a0e1a)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow accents */}
      <div style={{
        position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Top Navbar */}
      <header style={{
        padding: '24px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              color: '#00d4ff', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            <Fingerprint size={14} /> Passkey Login
          </Link>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-secondary)', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            <LogIn size={14} /> Email Login
          </Link>
          <Link
            to="/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              color: 'white', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            <UserPlus size={14} /> Create Account
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '48px 24px',
        position: 'relative',
        zIndex: 10,
        width: '100%',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 14px', borderRadius: '50px',
            background: 'rgba(0, 212, 255, 0.12)', border: '1px solid rgba(0, 212, 255, 0.25)',
            color: '#00d4ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px',
            marginBottom: '14px',
          }}>
            <Sparkles size={13} /> SELECT ACCOUNT / DEMO PROFILES
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 900,
            marginBottom: '12px',
          }}>
            Switch Account or Test Live Profiles
          </h1>
          <p style={{
            fontSize: '15px', color: 'var(--color-text-secondary)',
            maxWidth: '620px', margin: '0 auto', lineHeight: 1.6,
          }}>
            Select a verified demo athlete below to test Clean Quest at different progression stages, or sign in with your own custom account.
          </p>
        </div>

        {/* Error Alert if any */}
        {(errorMsg || authError) && (
          <div style={{
            maxWidth: '600px', margin: '0 auto 28px',
            padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg || authError}</span>
          </div>
        )}

        {/* 3 Demo Athlete Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}>
          {demoAccounts.map(acc => {
            const isCurrentSelected = selectedDemoId === acc.id && loggingIn;

            return (
              <div
                key={acc.id}
                style={{
                  background: 'rgba(19, 25, 41, 0.85)',
                  border: `1px solid ${selectedDemoId === acc.id ? acc.accentColor : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '24px',
                  padding: '30px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedDemoId === acc.id
                    ? `0 12px 36px ${acc.accentColor}25`
                    : '0 8px 24px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = `${acc.accentColor}60`;
                  e.currentTarget.style.boxShadow = `0 12px 32px ${acc.accentColor}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = selectedDemoId === acc.id ? acc.accentColor : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = selectedDemoId === acc.id ? `0 12px 36px ${acc.accentColor}25` : '0 8px 24px rgba(0,0,0,0.3)';
                }}
              >
                {/* Accent line top */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: acc.avatarGradient,
                }} />

                <div>
                  {/* Card Header: Avatar + Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '54px', height: '54px', borderRadius: '16px',
                        background: acc.avatarGradient, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', flexShrink: 0,
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: `0 4px 16px ${acc.accentColor}30`,
                      }}>
                        {acc.icon}
                      </div>
                      <div>
                        <h3 style={{
                          fontFamily: "'Outfit', sans-serif", fontSize: '20px',
                          fontWeight: 800, color: 'white', marginBottom: '2px',
                        }}>
                          {acc.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {acc.sport} · {acc.country}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '3px 10px', borderRadius: '50px',
                      background: `${acc.accentColor}18`, border: `1px solid ${acc.accentColor}35`,
                      color: acc.accentColor, fontSize: '11px', fontWeight: 700,
                    }}>
                      Lv. {acc.level}
                    </span>
                  </div>

                  {/* Role Tag Banner */}
                  <div style={{
                    padding: '6px 12px', borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '12px', fontWeight: 600, color: acc.accentColor,
                    marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span>🏷️</span> {acc.roleTag}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px', color: 'var(--color-text-secondary)',
                    lineHeight: 1.6, marginBottom: '20px', minHeight: '60px',
                  }}>
                    {acc.description}
                  </p>

                  {/* Highlights Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                    {acc.highlights.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-primary)' }}>
                        <CheckCircle size={13} style={{ color: acc.accentColor, flexShrink: 0 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  onClick={() => handleSelectDemo(acc)}
                  disabled={loggingIn}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '14px',
                    background: isCurrentSelected ? 'rgba(255,255,255,0.1)' : acc.avatarGradient,
                    border: 'none',
                    color: 'white',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loggingIn ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 16px ${acc.accentColor}30`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!loggingIn) e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    if (!loggingIn) e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isCurrentSelected ? (
                    <>
                      <div style={{
                        width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                      <span>Authenticating as {acc.name}...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter as {acc.name.split(' ')[0]}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Database Isolation Note */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '18px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={22} style={{ color: '#00d4ff', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>
                Real Supabase Database Isolation & Security
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Each demo account authenticates against real Supabase Auth with Row Level Security (RLS). Progress made in one account never bleeds into another.
              </div>
            </div>
          </div>

          <Link
            to="/login"
            style={{
              padding: '10px 18px', borderRadius: '10px',
              background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.25)',
              color: '#00d4ff', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
            }}
          >
            Custom Account Login →
          </Link>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
