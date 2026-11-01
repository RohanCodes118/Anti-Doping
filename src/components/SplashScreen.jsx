import React, { useState, useEffect } from 'react';

/**
 * Clean Quest Premium Opening / Splash Screen Animation
 * Displays on initial load per browser session, then smoothly fades out.
 */
export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(() => {
    // Check if splash has already been shown in this session
    try {
      return !sessionStorage.getItem('cq_splash_seen');
    } catch {
      return true;
    }
  });

  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Smooth progress bar animation
    const startTime = Date.now();
    const duration = 2000; // 2 seconds progress fill

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressInterval);
      }
    }, 20);

    // Fade out phase after progress completes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    // Complete and remove from view
    const removeTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('cq_splash_seen', 'true');
      } catch (e) {
        // Storage fallback
      }
      if (onComplete) onComplete();
    }, 2600);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#070a14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fadeOut ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Glow Elements */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(40px)',
          animation: 'splashPulse 3s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -40%)',
          filter: 'blur(50px)',
          animation: 'splashPulse 3s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 20px',
          maxWidth: '480px',
        }}
      >
        {/* Animated Brand Logo */}
        <div
          style={{
            position: 'relative',
            marginBottom: '32px',
            animation: 'splashLogoIntro 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Logo Glow Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '24px',
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 70%)',
              filter: 'blur(16px)',
              animation: 'logoGlowPulse 2s ease-in-out infinite alternate',
            }}
          />

          <img
            src="/main-logo.png"
            alt="Clean Quest Logo"
            style={{
              height: '140px',
              width: 'auto',
              maxHeight: '22vh',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 10px 30px rgba(0, 212, 255, 0.35))',
              position: 'relative',
              zIndex: 2,
            }}
          />
        </div>

        {/* Loading Progress Bar Container */}
        <div
          style={{
            width: '240px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50px',
            overflow: 'hidden',
            marginBottom: '18px',
            position: 'relative',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            animation: 'splashFadeIn 0.6s ease forwards 0.3s',
            opacity: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed, #10b981)',
              borderRadius: '50px',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 12px rgba(0, 212, 255, 0.8)',
            }}
          />
        </div>

        {/* Progress Text */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '0.4px',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'splashFadeIn 0.6s ease forwards 0.4s',
            opacity: 0,
          }}
        >
          <span>Preparing your clean performance...</span>
          <span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 600 }}>
            {progress}%
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            animation: 'splashFadeIn 0.6s ease forwards 0.5s',
            opacity: 0,
          }}
        >
          Fair Play · Real Performance
        </div>
      </div>

      <style>{`
        @keyframes splashLogoIntro {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(12px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        @keyframes splashFadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes splashPulse {
          0% {
            transform: translate(-50%, -60%) scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -60%) scale(1.1);
            opacity: 1;
          }
        }
        @keyframes logoGlowPulse {
          0% {
            opacity: 0.5;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
