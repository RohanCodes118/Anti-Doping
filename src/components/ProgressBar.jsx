import React from 'react';

/**
 * XP Progress Bar
 */
export function XPBar({ current, total, showLabel = true, height = 8 }) {
  const percent = Math.min((current / total) * 100, 100);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}>
          <span>{current.toLocaleString()} XP</span>
          <span>{total.toLocaleString()} XP</span>
        </div>
      )}
      <div style={{
        height: `${height}px`,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '100px',
        overflow: 'visible',
        position: 'relative',
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #00d4ff)',
          borderRadius: '100px',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          minWidth: percent > 0 ? '16px' : '0',
        }}>
          {percent > 0 && (
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: height + 4,
              height: height + 4,
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.8)',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Standard Progress Bar (green for completion)
 */
export function ProgressBar({ value, color = 'cyan', height = 6 }) {
  const percent = Math.min(value, 100);
  const gradients = {
    cyan: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
    green: 'linear-gradient(90deg, #10b981, #00d4ff)',
    orange: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    purple: 'linear-gradient(90deg, #7c3aed, #ec4899)',
  };

  return (
    <div style={{
      height: `${height}px`,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '100px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${percent}%`,
        height: '100%',
        background: gradients[color] || gradients.cyan,
        borderRadius: '100px',
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}
