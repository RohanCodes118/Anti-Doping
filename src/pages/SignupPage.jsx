import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ChevronDown, Mail } from 'lucide-react';

const sports = [
  'Athletics', 'Swimming', 'Cycling', 'Gymnastics', 'Weightlifting',
  'Boxing', 'Wrestling', 'Rowing', 'Triathlon', 'Basketball',
  'Football', 'Tennis', 'Volleyball', 'Judo', 'Taekwondo',
  'Archery', 'Shooting', 'Equestrian', 'Sailing', 'Other',
];

const passwordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { level: 3, label: 'Good', color: '#00d4ff' };
  return { level: 4, label: 'Strong', color: '#10b981' };
};

const benefits = [
  'Free anti-doping education',
  'Daily personalized challenges',
  'Global leaderboard access',
  'Achievement badges & certificates',
  'WADA-aligned curriculum',
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', sport: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { signup, loading, error, setError } = useAuthContext();
  const navigate = useNavigate();

  const pwdStrength = passwordStrength(form.password);

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError('Please agree to the terms.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    const result = await signup(form.name, form.email, form.password, form.sport);
    if (result === true) {
      navigate('/dashboard');
    } else if (result?.requiresEmailConfirmation) {
      setConfirmationSent(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      display: 'flex',
    }}>
      {/* Left panel – benefits */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(145deg, #0f1629 0%, #0a0e1a 100%)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left-panel">
        <div style={{
          position: 'absolute', width: '450px', height: '450px',
          top: '-80px', right: '-100px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          bottom: '-60px', left: '-60px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size="md" />

          <div style={{ marginTop: '40px', marginBottom: '36px' }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '36px', fontWeight: 900, lineHeight: 1.15, marginBottom: '14px',
            }}>
              Start your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                clean sport
              </span>{' '}
              journey.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Join a global community of athletes committed to fair play and clean competition.
            </p>
          </div>

          {/* Benefits list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div style={{
            padding: '20px',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: '16px',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '12px' }}>
              "Clean Quest transformed how I think about anti-doping. The gamification makes it addictive — in the best possible way."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '13px', color: 'white',
              }}>J</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Jordan Chen</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sprint Athlete · Level 22</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: '#f59e0b', fontSize: '12px' }}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '440px', paddingTop: '20px', paddingBottom: '40px' }}>
          <div style={{ marginBottom: '24px', display: 'none' }} className="mobile-logo">
            <Logo size="md" />
          </div>

          {confirmationSent ? (
            <div style={{
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(0, 212, 255, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Mail size={28} style={{ color: '#00d4ff' }} />
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
                Check your email
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                We've sent a verification link to <strong style={{ color: 'white' }}>{form.email}</strong>. Please confirm your email address to complete your registration and sign in.
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%', padding: '12px' }}>
                Go to Sign In <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
                  Create your account
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--color-accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full name */}
                <div>
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    className="form-input"
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="form-label">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Sport */}
                <div>
                  <label htmlFor="sport" className="form-label">Your Sport <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="sport"
                      value={form.sport}
                      onChange={update('sport')}
                      style={{
                        width: '100%',
                        padding: '14px 40px 14px 16px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        color: form.sport ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--color-accent-cyan)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="" style={{ background: '#131929' }}>Select your sport</option>
                      {sports.map(s => (
                        <option key={s} value={s} style={{ background: '#131929' }}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)', pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      className="form-input"
                      placeholder="Min. 8 characters"
                      required
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {form.password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: level <= pwdStrength.level ? pwdStrength.color : 'rgba(255,255,255,0.08)',
                            transition: 'background 0.3s ease',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: pwdStrength.color, fontWeight: 500 }}>
                        {pwdStrength.label} password
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      className="form-input"
                      placeholder="Repeat your password"
                      required
                      style={{
                        paddingRight: '48px',
                        borderColor: form.confirmPassword && form.password !== form.confirmPassword
                          ? 'rgba(239, 68, 68, 0.5)' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <CheckCircle size={12} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '11px', color: '#10b981' }}>Passwords match</span>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}>
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    style={{
                      width: '16px', height: '16px', marginTop: '2px',
                      accentColor: 'var(--color-accent-cyan)', cursor: 'pointer', flexShrink: 0,
                    }}
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#" style={{ color: 'var(--color-accent-cyan)', textDecoration: 'none' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" style={{ color: 'var(--color-accent-cyan)', textDecoration: 'none' }}>Privacy Policy</a>.
                    I understand that Clean Quest content is educational only.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={loading || !agreed}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '14px',
                    fontSize: '15px',
                    marginTop: '4px',
                    opacity: (loading || !agreed) ? 0.65 : 1,
                    cursor: (loading || !agreed) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
