import React from 'react';

/**
 * Reusable Card component with glass morphism styling
 */
export default function Card({ children, className = '', style = {}, hover = true, glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(19, 25, 41, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        boxShadow: glow
          ? '0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(0, 212, 255, 0.15)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={className}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(0, 212, 255, 0.15)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = glow
          ? '0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(0, 212, 255, 0.15)'
          : '0 4px 24px rgba(0,0,0,0.4)';
      } : undefined}
    >
      {children}
    </div>
  );
}
