import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        top: '10%', left: '20%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        bottom: '10%', right: '15%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Logo size="md" style={{ marginBottom: '40px' }} />

        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(80px, 15vw, 140px)',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(124,58,237,0.3))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
        }}>404</div>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '24px', fontWeight: 700, marginBottom: '12px',
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-secondary)',
          lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 32px',
        }}>
          Looks like this page went out of bounds. Let's get you back to clean competition.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary">← Back to Home</Link>
          <Link to="/dashboard" className="btn-secondary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
