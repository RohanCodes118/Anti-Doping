import React from 'react';

/**
 * Reusable Badge component for achievements and status
 */
export function Badge({ icon, name, description, earned = true, size = 'md' }) {
  const sizes = {
    sm: { outer: 56, inner: 32, text: 11 },
    md: { outer: 72, inner: 40, text: 12 },
    lg: { outer: 90, inner: 52, text: 13 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      title={description}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 10px',
        background: 'var(--color-bg-card)',
        border: `1px solid ${earned ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '14px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        opacity: earned ? 1 : 0.4,
        filter: earned ? 'none' : 'grayscale(1)',
      }}
      onMouseEnter={e => {
        if (earned) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.35)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = earned ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.05)';
      }}
    >
      <div style={{
        width: s.outer,
        height: s.outer,
        borderRadius: '50%',
        background: earned
          ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.2))'
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${earned ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.inner * 0.6,
        boxShadow: earned ? '0 4px 16px rgba(0, 212, 255, 0.2)' : 'none',
      }}>
        {earned ? icon : '🔒'}
      </div>
      <span style={{
        fontSize: s.text,
        fontWeight: 600,
        color: earned ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: '80px',
      }}>
        {name}
      </span>
    </div>
  );
}

/**
 * Compact inline badge/tag
 */
export function Tag({ children, color = 'cyan' }) {
  const colors = {
    cyan: { bg: 'rgba(0, 212, 255, 0.1)', text: 'var(--color-accent-cyan)', border: 'rgba(0, 212, 255, 0.2)' },
    purple: { bg: 'rgba(124, 58, 237, 0.15)', text: '#a78bfa', border: 'rgba(124, 58, 237, 0.3)' },
    green: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-accent-green)', border: 'rgba(16, 185, 129, 0.2)' },
    orange: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-accent-orange)', border: 'rgba(245, 158, 11, 0.2)' },
    pink: { bg: 'rgba(236, 72, 153, 0.1)', text: 'var(--color-accent-pink)', border: 'rgba(236, 72, 153, 0.2)' },
  };
  const c = colors[color] || colors.cyan;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '50px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.3px',
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  );
}
