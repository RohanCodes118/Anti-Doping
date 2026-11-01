import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuthContext } from '../contexts/AuthContext';
import { XPBar } from '../components/ProgressBar';
import {
  LayoutDashboard,
  Trophy,
  BookOpen,
  Target,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Star,
  HelpCircle,
  History,
  Gamepad2,
  Coins,
  ChevronDown,
  RefreshCw,
  User,
  Shield,
  Bot,
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Quiz Center', icon: HelpCircle, to: '/quizzes' },
  { label: 'Quiz History', icon: History, to: '/history' },
  { label: 'Mini-Games', icon: Gamepad2, to: '/games', badge: 'NEW' },
  { label: 'Challenges', icon: Target, to: '/challenges' },
  { label: 'Learn', icon: BookOpen, to: '/learn' },
  { label: 'Badges', icon: Award, to: '/badges' },
  { label: 'Leaderboard', icon: Trophy, to: '/leaderboard' },
  { label: 'Community', icon: Users, to: '/community' },
  { label: 'Clean Quest AI', icon: Bot, to: '/ai-assistant', badge: 'AI' },
];

const bottomLinks = [
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleSwitchAccount = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/accounts');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      background: 'var(--color-bg-primary)',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: isMobile ? (sidebarOpen ? 0 : '-260px') : 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transition: 'left 0.3s ease',
      }}
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo area */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size="md" to="/dashboard" />
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ display: isMobile ? 'block' : 'none', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            className="mobile-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* User profile mini */}
        {user && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '16px',
                color: 'white',
                flexShrink: 0,
                border: '2px solid rgba(0, 212, 255, 0.3)',
              }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Athlete'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={10} style={{ color: '#f59e0b' }} />
                  Level {user?.level || 1} · {user?.sport || 'Athlete'}
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <XPBar current={user.xp || 0} total={user.xpToNext || 500} showLabel={false} height={5} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{(user.xp || 0).toLocaleString()} XP</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>→ Lv.{(user.level || 1) + 1}</span>
            </div>

            {/* Quick Switch Button */}
            <button
              onClick={handleSwitchAccount}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(0, 212, 255, 0.08)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                color: '#00d4ff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.08)';
              }}
            >
              <RefreshCw size={11} /> Switch Account / Demo
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  background: isActive ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 212, 255, 0.15)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <Icon size={16} />
                {link.label}
                {link.badge && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '2px 6px',
                    borderRadius: '50px',
                    fontSize: '9px',
                    fontWeight: 700,
                    background: 'rgba(0, 212, 255, 0.15)',
                    color: '#00d4ff',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                  }}>
                    {link.badge}
                  </span>
                )}
                {isActive && !link.badge && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-cyan)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--color-border)' }}>
          {bottomLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              background: 'none',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 40,
          }}
        />
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px',
        width: isMobile ? '100%' : 'calc(100% - 260px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease, width 0.3s ease',
      }} className="dashboard-main">
        {/* Top bar */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          background: 'rgba(15, 22, 41, 0.8)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Mobile menu & brand logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                padding: '6px',
              }}
              className="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <div className="mobile-menu-logo" style={{ display: 'none' }}>
              <Logo size="sm" to="/dashboard" />
            </div>
          </div>

          {/* Page context */}
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Clean Coins */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '50px',
            }}>
              <Coins size={13} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
                {user?.cleanCoins ?? 100}
              </span>
            </div>

            {user?.streak > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '50px',
              }}>
                <Flame size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>
                  {user.streak}
                </span>
              </div>
            )}

            {/* Profile Dropdown Trigger */}
            {user && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 4px',
                    borderRadius: '50px',
                    background: profileDropdownOpen ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${profileDropdownOpen ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    color: 'white',
                  }}>
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(user?.name || 'Athlete').split(' ')[0]}
                  </span>

                  <ChevronDown size={14} style={{
                    color: 'var(--color-text-muted)',
                    transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '260px',
                    background: 'rgba(19, 25, 41, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px',
                    padding: '12px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                    animation: 'dropdownFade 0.2s ease',
                  }}>
                    {/* User info header */}
                    <div style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '8px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'white', marginBottom: '2px' }}>
                        {user?.name || 'Athlete'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', wordBreak: 'break-all', marginBottom: '6px' }}>
                        {user?.email || 'athlete@cleanquest.org'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: '#00d4ff',
                          background: 'rgba(0, 212, 255, 0.12)', padding: '2px 8px', borderRadius: '50px',
                        }}>
                          Level {user?.level || 1}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)',
                          background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '50px',
                        }}>
                          {user?.sport || 'Athlete'}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={handleSwitchAccount}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '10px',
                          background: 'rgba(0, 212, 255, 0.06)', border: '1px solid rgba(0, 212, 255, 0.15)',
                          color: '#00d4ff', fontSize: '13px', fontWeight: 600,
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.06)'}
                      >
                        <RefreshCw size={14} />
                        <span>Switch Account / Demo</span>
                      </button>

                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '10px',
                          color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500,
                          textDecoration: 'none', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                      >
                        <Settings size={14} />
                        <span>Account Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '10px',
                          background: 'none', border: 'none',
                          color: '#ef4444', fontSize: '13px', fontWeight: 500,
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content - centralized */}
        <main style={{
          flex: 1,
          padding: '28px',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .sidebar { left: -260px !important; }
          .sidebar.open { left: 0 !important; }
          .mobile-close-btn { display: block !important; }
          .dashboard-main { margin-left: 0 !important; width: 100% !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-menu-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
