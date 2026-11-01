import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import {
  User, Bell, Volume2, LogOut, RotateCcw, CheckCircle, AlertTriangle, X,
  Fingerprint, Key, ShieldCheck, Trash2, Plus, Lock,
} from 'lucide-react';

const sports = [
  'Athletics', 'Swimming', 'Cycling', 'Gymnastics', 'Weightlifting',
  'Boxing', 'Wrestling', 'Rowing', 'Triathlon', 'Basketball',
  'Football', 'Tennis', 'Volleyball', 'Judo', 'Taekwondo',
  'Archery', 'Shooting', 'Equestrian', 'Sailing', 'General', 'Other',
];

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={{
      background: 'rgba(19, 25, 41, 0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '18px',
      padding: '24px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'rgba(0, 212, 255, 0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: '#00d4ff' }} />
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px', borderRadius: '50px', border: 'none', cursor: 'pointer',
        background: checked ? 'linear-gradient(90deg, #00d4ff, #7c3aed)' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', background: 'white',
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
        transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const {
    user, updateSettings, resetProgress, logout,
    biometricsAvailable, deviceBiometrics, passkeys, passkeysLoading,
    registerPasskey, deletePasskey,
  } = useAuthContext();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [sport, setSport] = useState(user?.sport || 'General');
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [soundEffects, setSoundEffects] = useState(user?.settings?.soundEffects ?? true);
  const [savedMessage, setSavedMessage] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Passkey state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [passkeyDeviceName, setPasskeyDeviceName] = useState('');
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState(null);
  const [passkeySuccess, setPasskeySuccess] = useState(null);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState(null);

  const avatarInitial = (displayName || user?.name || 'A').charAt(0).toUpperCase();

  const handleSaveProfile = () => {
    updateSettings({ displayName: displayName.trim() || user.name, sport });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleToggleNotifications = (val) => {
    setNotifications(val);
    updateSettings({ notifications: val });
  };

  const handleToggleSound = (val) => {
    setSoundEffects(val);
    updateSettings({ soundEffects: val });
  };

  const handleConfirmReset = () => {
    resetProgress();
    setConfirmReset(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRegisterPasskey = async () => {
    setRegisteringPasskey(true);
    setPasskeyError(null);
    setPasskeySuccess(null);

    const nameToUse = passkeyDeviceName.trim() || deviceBiometrics?.defaultDeviceName || 'Personal Device';
    const res = await registerPasskey(nameToUse);

    setRegisteringPasskey(false);
    if (res.success) {
      setShowRegisterForm(false);
      setPasskeyDeviceName('');
      setPasskeySuccess('Passkey registered successfully! You can now use biometrics to sign in.');
      setTimeout(() => setPasskeySuccess(null), 4000);
    } else {
      setPasskeyError(res.error || 'Failed to register passkey.');
    }
  };

  const handleDeletePasskey = async (credentialId) => {
    setDeletingPasskeyId(credentialId);
    const success = await deletePasskey(credentialId);
    setDeletingPasskeyId(null);
    if (success) {
      setPasskeySuccess('Passkey removed successfully.');
      setTimeout(() => setPasskeySuccess(null), 3000);
    }
  };


  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: '6px' }}>
            Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Manage your profile, preferences, and account.
          </p>
        </div>

        {/* Profile */}
        <SectionCard icon={User} title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '22px', color: 'white',
              flexShrink: 0,
            }}>
              {avatarInitial}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Your avatar uses the first letter of your display name.
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Display Name</label>
            <input
              className="form-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Sport</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)', borderRadius: '12px',
                color: 'var(--color-text-primary)', fontFamily: "'Inter', sans-serif",
                fontSize: '15px', outline: 'none', cursor: 'pointer',
              }}
            >
              {sports.map(s => <option key={s} value={s} style={{ background: '#131929' }}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '11px 22px', fontSize: '14px' }}>
              Save Changes
            </button>
            {savedMessage && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                <CheckCircle size={14} /> Saved
              </span>
            )}
          </div>
        </SectionCard>

        {/* Preferences */}
        <SectionCard icon={Bell} title="Preferences">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Notifications</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Daily challenge reminders and badge alerts</div>
            </div>
            <Toggle checked={notifications} onChange={handleToggleNotifications} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={13} /> Sound Effects
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Play sounds for correct answers and achievements</div>
            </div>
            <Toggle checked={soundEffects} onChange={handleToggleSound} />
          </div>
        </SectionCard>

        {/* Biometrics & Passkeys */}
        <SectionCard icon={Fingerprint} title="Biometrics & Passkeys">
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: biometricsAvailable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${biometricsAvailable ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
              marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: biometricsAvailable ? '#10b981' : '#00d4ff' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Device Authentication Status:
                </span>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: biometricsAvailable ? '#10b981' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: biometricsAvailable ? '#10b981' : '#f59e0b',
                  display: 'inline-block',
                }} />
                {biometricsAvailable
                  ? `${deviceBiometrics?.biometricName || 'Biometrics'} Supported`
                  : 'WebAuthn / Security Keys Supported'}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Sign in seamlessly using Face ID, Touch ID, or Windows Hello without typing passwords.
            </p>

            {/* Privacy note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <Lock size={15} style={{ color: '#00d4ff', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-secondary)' }}>Privacy Guarantee:</strong> Biometric verification occurs strictly in your device’s hardware enclave. Clean Quest never captures, transmits, or stores fingerprints, face scans, or camera video.
              </span>
            </div>

            {/* List of registered passkeys */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Registered Passkeys ({passkeys.length})
              </h3>

              {passkeysLoading && passkeys.length === 0 ? (
                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#00d4ff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Loading passkeys...
                </div>
              ) : passkeys.length === 0 ? (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                }}>
                  No passkeys registered yet on this device. Click below to add one.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {passkeys.map((pk) => {
                    const isDeleting = deletingPasskeyId === pk.credentialId;
                    const dateStr = pk.createdAt ? new Date(pk.createdAt).toLocaleDateString() : 'Active key';
                    return (
                      <div
                        key={pk.credentialId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#00d4ff',
                          }}>
                            <Key size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                              {pk.deviceName || 'Personal Device'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Added {dateStr} • {pk.biometricType || 'Biometric Key'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePasskey(pk.credentialId)}
                          disabled={isDeleting || passkeysLoading}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                          <Trash2 size={13} />
                          {isDeleting ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Registration Form / Action */}
            {showRegisterForm ? (
              <div style={{
                background: 'rgba(0, 212, 255, 0.04)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '10px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#00d4ff' }}>
                  Register Passkey for this Device
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Device Nickname</label>
                  <input
                    className="form-input"
                    value={passkeyDeviceName}
                    onChange={e => setPasskeyDeviceName(e.target.value)}
                    placeholder={deviceBiometrics?.defaultDeviceName || 'My Laptop / Phone'}
                    autoFocus
                  />
                </div>
                {passkeyError && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
                    {passkeyError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowRegisterForm(false); setPasskeyError(null); }}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterPasskey}
                    disabled={registeringPasskey}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    {registeringPasskey ? (
                      <>
                        <div style={{
                          width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white', borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                        Authenticating with Biometrics...
                      </>
                    ) : (
                      <>
                        <Fingerprint size={14} /> Verify & Register
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="register-passkey-btn"
                  onClick={() => {
                    setPasskeyDeviceName(deviceBiometrics?.defaultDeviceName || 'Personal Device');
                    setShowRegisterForm(true);
                    setPasskeyError(null);
                  }}
                  className="btn-primary"
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={15} />
                  <Fingerprint size={15} />
                  Register Passkey / Biometrics
                </button>

                {passkeySuccess && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                    <CheckCircle size={15} /> {passkeySuccess}
                  </span>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Account */}
        <SectionCard icon={User} title="Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '12px', color: '#f59e0b', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Reset Learning Progress
            </button>
            {resetDone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                <CheckCircle size={14} /> Progress has been reset
              </span>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/accounts');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                borderRadius: '12px', color: '#00d4ff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Switch Account / Demo
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px', color: '#ef4444', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </SectionCard>

        {/* Reset confirmation modal */}
        {confirmReset && (
          <div
            onClick={() => setConfirmReset(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <div onClick={e => e.stopPropagation()} style={{
              background: 'rgba(19, 25, 41, 0.98)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', position: 'relative',
            }}>
              <button onClick={() => setConfirmReset(false)} style={{
                position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none',
                color: 'var(--color-text-muted)', cursor: 'pointer',
              }}>
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700 }}>
                  Reset all progress?
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
                This will permanently clear your XP, level, quiz history, challenge progress, learning progress, and streak.
                Your account (name, email, sport) will be kept. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                    background: '#ef4444', color: 'white', fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600, fontSize: '13px',
                  }}
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
