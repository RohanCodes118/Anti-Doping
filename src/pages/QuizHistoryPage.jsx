import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { getAIRecommendation, quizzes } from '../data/quizData';
import {
  Trophy, Zap, CheckCircle, RotateCcw, Filter, Search,
  Calendar, Award, Sparkles, BookOpen, ChevronRight, BarChart2, Flame
} from 'lucide-react';

export default function QuizHistoryPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const attempts = user?.quizHistory || [];

  // Summary stats
  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { totalCount: 0, avgScore: 0, totalXp: 0, bestCategory: 'N/A' };
    }

    const totalCount = attempts.length;
    const avgScore = Math.round(attempts.reduce((sum, a) => sum + (a.scorePercentage || 0), 0) / totalCount);
    const totalXp = attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);

    // Find best category
    const categoryTotals = {};
    attempts.forEach(a => {
      if (!categoryTotals[a.categoryName]) categoryTotals[a.categoryName] = { totalPct: 0, count: 0 };
      categoryTotals[a.categoryName].totalPct += a.scorePercentage;
      categoryTotals[a.categoryName].count += 1;
    });

    let bestCat = 'Anti-Doping Basics';
    let highestAvg = 0;
    Object.keys(categoryTotals).forEach(cat => {
      const avg = categoryTotals[cat].totalPct / categoryTotals[cat].count;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestCat = cat;
      }
    });

    return { totalCount, avgScore, totalXp, bestCategory: bestCat };
  }, [attempts]);

  const aiRec = useMemo(() => getAIRecommendation(attempts), [attempts]);

  // Filter attempts
  const filteredAttempts = useMemo(() => {
    return attempts.filter(att => {
      const matchDiff = selectedDifficulty === 'All' || att.difficulty === selectedDifficulty;
      const matchSearch = searchQuery === '' ||
        att.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiff && matchSearch;
    });
  }, [attempts, selectedDifficulty, searchQuery]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ══════════════ HEADER ══════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
                My Learning & Quiz History
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
              Track your past quiz performances, review earned XP, and monitor your anti-doping mastery progression over time.
            </p>
          </div>

          <button
            onClick={() => navigate('/quizzes')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            Go to Quiz Center →
          </button>
        </div>

        {/* ══════════════ STATS CARDS GRID ══════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total Completed</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: '#00d4ff' }}>
              {stats.totalCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Quiz attempts logged</div>
          </div>

          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Average Accuracy</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
              {stats.avgScore}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Overall average score</div>
          </div>

          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Quiz XP Earned</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
              {stats.totalXp} XP
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Contributed to athlete level</div>
          </div>

          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Best Category</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 800, color: '#a78bfa', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.bestCategory}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Highest accuracy area</div>
          </div>
        </div>

        {/* ══════════════ AI RECOMMENDATION BANNER ══════════════ */}
        {aiRec && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(124, 58, 237, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '18px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#00d4ff', marginBottom: '4px' }}>
                <Sparkles size={12} /> AI ADAPTIVE LEARNING SUGGESTION
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {aiRec.reason}
              </p>
            </div>

            <button
              onClick={() => navigate(`/quiz/${aiRec.recommendedQuizId}`)}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '13px' }}
            >
              Take Recommended Quiz →
            </button>
          </div>
        )}

        {/* ══════════════ FILTERS & SEARCH ══════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px', marginBottom: '20px',
          background: 'rgba(19, 25, 41, 0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '14px 20px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: selectedDifficulty === diff ? 'rgba(0,212,255,0.3)' : 'transparent',
                  background: selectedDifficulty === diff ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: selectedDifficulty === diff ? '#00d4ff' : 'var(--color-text-secondary)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <Search size={13} style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
          </div>
        </div>

        {/* ══════════════ HISTORY ATTEMPTS LIST ══════════════ */}
        {filteredAttempts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(19, 25, 41, 0.6)',
            borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)',
          }}>
            <BookOpen size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No quiz attempts logged yet</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Take your first quiz in the Quiz Center to start tracking your learning progress!
            </p>
            <Link to="/quizzes" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
              Explore Quizzes Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAttempts.map(att => {
              const formattedDate = new Date(att.completedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });

              const isHigh = att.scorePercentage >= 80;

              return (
                <div
                  key={att.id}
                  style={{
                    background: 'rgba(19, 25, 41, 0.85)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '16px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.background = 'rgba(19, 25, 41, 0.95)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(19, 25, 41, 0.85)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '50px', fontSize: '10px', fontWeight: 600,
                        background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)',
                      }}>
                        {att.categoryName}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '50px', fontSize: '10px', fontWeight: 600,
                        background: att.difficulty === 'Beginner' ? 'rgba(16,185,129,0.1)' : att.difficulty === 'Intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: att.difficulty === 'Beginner' ? '#10b981' : att.difficulty === 'Intermediate' ? '#f59e0b' : '#ef4444',
                      }}>
                        {att.difficulty}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                      {att.quizTitle}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> Completed on {formattedDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* Score */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800,
                        color: isHigh ? '#10b981' : '#f59e0b',
                      }}>
                        {att.scorePercentage}%
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {att.score} / {att.totalQuestions} Correct
                      </div>
                    </div>

                    {/* XP */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                        +{att.xpEarned} XP
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Earned</div>
                    </div>

                    {/* Retake Action */}
                    <button
                      onClick={() => navigate(`/quiz/${att.quizId}`)}
                      style={{
                        padding: '8px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.color = '#00d4ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                    >
                      <RotateCcw size={12} /> Retake
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
