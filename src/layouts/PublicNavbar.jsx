import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuthContext } from '../contexts/AuthContext';

const navLinks = [
  { label: 'Quiz Center', href: '/quizzes', isRoute: true },
  { label: 'Demo Athletes', href: '/accounts', isRoute: true },
  { label: 'Features', href: '/#features', isRoute: false },
  { label: 'Challenges', href: '/#challenges', isRoute: false },
  { label: 'Leaderboard', href: '/#leaderboard', isRoute: false },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '0 24px',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: scrolled
        ? 'rgba(10, 14, 26, 0.92)'
        : 'rgba(10, 14, 26, 0.4)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <Logo size="md" to={user ? "/dashboard" : "/"} />

      {/* Desktop Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}
        className="desktop-nav">
        {navLinks.map(link => (
          link.isRoute ? (
            <Link key={link.label} to={link.href} className="nav-link" style={{
              color: location.pathname === link.href ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'color 0.2s',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href} className="nav-link" style={{
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'color 0.2s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
            >
              {link.label}
            </a>
          )
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/login" style={{
          color: 'var(--color-text-secondary)',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'color 0.2s',
          textDecoration: 'none',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--color-accent-cyan)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
        >
          Sign In
        </Link>
        <Link to="/accounts" style={{
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'color 0.2s',
          textDecoration: 'none',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--color-text-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
        >
          Demo Athletes
        </Link>
        {user ? (
          <Link to="/dashboard" className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }}>
            Dashboard →
          </Link>
        ) : (
          <Link to="/signup" className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }}>
            Get Started
          </Link>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
