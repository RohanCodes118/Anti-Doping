import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Persistent Floating Clean Quest Logo Navigation Button
 * Provides quick navigation back to /dashboard across all pages,
 * including immersive screens, quizzes, games, and mobile views.
 */
export default function PersistentLogoNavigation({ forceShow = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const path = location.pathname;

  // Pages with standard sidebar visible on desktop
  const isStandardSidebarRoute = [
    '/dashboard',
    '/quizzes',
    '/history',
    '/games',
    '/challenges',
    '/learn',
    '/badges',
    '/leaderboard',
    '/community',
    '/settings',
  ].includes(path);

  // Immersive routes that do not have standard navigation
  const isImmersiveRoute = path.startsWith('/quiz/') || path.startsWith('/games/') || path === '/404';

  // Determine visibility:
  // Automatically show on immersive routes (active quizzes, mini-games, 404),
  // forced views, or standalone routes where main navigation is absent.
  const shouldShow = forceShow || isImmersiveRoute || (!isStandardSidebarRoute && path !== '/');

  if (!shouldShow) return null;

  const handleClick = (e) => {
    e.preventDefault();
    if (path === '/dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '14px',
        left: isMobile ? '14px' : '20px',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none', // backdrop handles events
      }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Back to Dashboard"
        title="Back to Dashboard"
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px 6px 8px',
          background: isHovered
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: `1px solid ${isHovered ? 'rgba(0, 212, 255, 0.45)' : 'rgba(0, 212, 255, 0.2)'}`,
          borderRadius: '50px',
          boxShadow: isHovered
            ? '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 212, 255, 0.35)'
            : '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 8px rgba(0, 212, 255, 0.1)',
          cursor: 'pointer',
          transform: isHovered ? 'scale(1.05) translateY(-1px)' : 'scale(1)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        {/* Clean Quest Logo Image */}
        <img
          src="/main-logo.png"
          alt="Clean Quest Logo"
          style={{
            height: '28px',
            width: 'auto',
            objectFit: 'contain',
            borderRadius: '6px',
            filter: isHovered ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' : 'none',
            transition: 'filter 0.25s ease',
          }}
        />

        {/* Brand Text Badge */}
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            color: '#00d4ff',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
          }}
        >
          Clean Quest
        </span>
      </button>

      {/* Hover Tooltip Pill */}
      <div
        style={{
          pointerEvents: 'none',
          padding: '5px 10px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.3px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0) scale(1)' : 'translateX(-6px) scale(0.95)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        ← Back to Dashboard
      </div>
    </div>
  );
}
