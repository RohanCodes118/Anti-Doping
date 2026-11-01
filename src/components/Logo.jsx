import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Clean Quest Brand Logo Component
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'|number} props.size - size preset or height in px
 * @param {boolean} props.showText - whether to render text alongside image if needed
 * @param {string} props.to - link destination (defaults to /dashboard)
 * @param {Object} props.style - custom style overrides
 * @param {string} props.className - optional class names
 */
export default function Logo({
  size = 'md',
  showText = true,
  to = '/dashboard',
  style = {},
  className = '',
  onClick,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const sizeSpecs = {
    sm: { height: 36, text: '16px', gap: '8px' },
    md: { height: 44, text: '20px', gap: '10px' },
    lg: { height: 60, text: '26px', gap: '12px' },
    xl: { height: 96, text: '34px', gap: '16px' },
  };

  const currentSize = typeof size === 'number'
    ? { height: size, text: `${Math.round(size * 0.5)}px`, gap: '8px' }
    : (sizeSpecs[size] || sizeSpecs.md);

  const targetPath = to || '/dashboard';

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    // If already on target path (or /dashboard), smooth scroll to top
    if (location.pathname === targetPath || (targetPath === '/dashboard' && location.pathname === '/dashboard')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link
      to={targetPath}
      onClick={handleClick}
      className={`cq-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        textDecoration: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.04)';
        e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.45))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter = 'drop-shadow(0 0 0px transparent)';
      }}
    >
      <img
        src="/main-logo.png"
        alt="Clean Quest – Fair Play. Real Performance."
        style={{
          height: `${currentSize.height}px`,
          width: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '8px',
        }}
      />
    </Link>
  );
}

