import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { quizCategories, quizzes, getAIRecommendation } from '../data/quizData';
import { Tag } from '../components/BadgeComponent';
import {
  Sparkles, Target, Zap, Clock, Trophy, Search, Filter,
  CheckCircle, Play, ArrowRight, BookOpen, Flame, HelpCircle,
  Star, Award, RotateCcw
} from 'lucide-react';

const difficultyBadges = {
  Beginner: { color: 'green', xp: 50 },
  Intermediate: { color: 'orange', xp: 100 },
  Advanced: { color: 'pink', xp: 200 },
};

const categoryIconColors = {
  cat_basics: { bg: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff' },
  cat_substances: { bg: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' },
  cat_responsibilities: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
  cat_testing: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  cat_tue: { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' },
  cat_ethics: { bg: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff' },
};

export default function QuizCenterPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const attempts = user?.quizHistory || [];
  const aiRecommendation = useMemo(() => getAIRecommendation(attempts), [attempts]);

  // Map of completed quizzes with best score
  const completedMap = useMemo(() => {
    const map = {};
    attempts.forEach(att => {
      if (!map[att.quizId] || att.scorePercentage > map[att.quizId].scorePercentage) {
        map[att.quizId] = att;
      }
    });
    return map;
  }, [attempts]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      const matchCat = selectedCategory === 'All' || q.categoryId === selectedCategory;
      const matchSearch = searchQuery === '' ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiff && matchCat && matchSearch;
    });
  }, [selectedDifficulty, selectedCategory, searchQuery]);

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
              <span style={{ fontSize: '20px' }}>🎯</span>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
                Quiz Center
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
              Test your anti-doping knowledge, earn XP, unlock achievements, and sharpen your understanding of clean sport rules.
            </p>
          </div>

          {/* User Quiz Quick Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Quizzes Done</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#00d4ff' }}>
                {Object.keys(completedMap).length} / {quizzes.length}
              </div>
            </div>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(19, 25, 41, 0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Quiz XP</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#f59e0b' }}>
                {attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0)} XP
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ AI COACH RECOMMENDATION ══════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(0, 212, 255, 0.12) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '220px', height: '220px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              padding: '4px 12px', borderRadius: '50px',
              background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              <Sparkles size={12} /> AI COACH RECOMMENDATION
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {aiRecommendation.badgeText}
            </span>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '20px',
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                {aiRecommendation.recommendedQuiz?.title || 'Next Recommended Quiz'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                "{aiRecommendation.reason}"
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                  background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
                }}>
                  {aiRecommendation.difficulty}
                </span>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#00d4ff', marginTop: '4px' }}>
                  +{aiRecommendation.recommendedQuiz?.xpReward} XP
                </div>
              </div>

              <button
                onClick={() => navigate(`/quiz/${aiRecommendation.recommendedQuizId}`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                  color: 'white', border: 'none',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                  fontSize: '14px', borderRadius: '50px', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 212, 255, 0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 212, 255, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.35)'; }}
              >
                <Play size={15} fill="white" /> Start Quiz Now
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ CATEGORY OVERVIEW CARDS ══════════════ */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Categories
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
          }}>
            {quizCategories.map(cat => {
              const style = categoryIconColors[cat.id] || categoryIconColors.cat_basics;
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat.id)}
                  style={{
                    background: isSelected ? 'rgba(0, 212, 255, 0.08)' : 'rgba(19, 25, 41, 0.8)',
                    border: `1px solid ${isSelected ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: style.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px', marginBottom: '10px',
                  }}>
                    {cat.icon}
                  </div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>
                    {cat.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {cat.totalQuizzes} Quizzes
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════ FILTERS & SEARCH ══════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px', marginBottom: '24px',
          background: 'rgba(19, 25, 41, 0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px 20px',
        }}>
          {/* Difficulty Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: selectedDifficulty === diff ? 'rgba(0,212,255,0.3)' : 'transparent',
                  background: selectedDifficulty === diff ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: selectedDifficulty === diff ? '#00d4ff' : 'var(--color-text-secondary)',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {diff === 'All' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <Search size={14} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
          </div>
        </div>

        {/* ══════════════ QUIZ CARDS GRID ══════════════ */}
        {filteredQuizzes.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(19, 25, 41, 0.6)',
            borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)',
          }}>
            <HelpCircle size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No quizzes match your filter</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Try clearing your search or switching difficulty filters.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {filteredQuizzes.map(quiz => {
              const catStyle = categoryIconColors[quiz.categoryId] || categoryIconColors.cat_basics;
              const prevAttempt = completedMap[quiz.id];

              return (
                <div
                  key={quiz.id}
                  style={{
                    background: 'rgba(19, 25, 41, 0.85)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '18px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0, 212, 255, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '14px',
                        background: catStyle.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '22px',
                      }}>
                        {quiz.icon}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 600,
                          background: quiz.difficulty === 'Beginner' ? 'rgba(16,185,129,0.1)' : quiz.difficulty === 'Intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: quiz.difficulty === 'Beginner' ? '#10b981' : quiz.difficulty === 'Intermediate' ? '#f59e0b' : '#ef4444',
                          border: `1px solid ${quiz.difficulty === 'Beginner' ? 'rgba(16,185,129,0.2)' : quiz.difficulty === 'Intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                          {quiz.difficulty}
                        </span>

                        {prevAttempt && (
                          <span style={{
                            padding: '3px 8px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                            display: 'flex', alignItems: 'center', gap: '3px',
                          }}>
                            <CheckCircle size={10} /> {prevAttempt.scorePercentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: catStyle.color, fontWeight: 600, marginBottom: '4px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                      {quiz.categoryName}
                    </div>

                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
                      {quiz.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                      {quiz.description}
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookOpen size={13} /> {quiz.questions.length} Questions
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {Math.round(quiz.timeLimitSeconds / 60)} min
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#00d4ff' }}>
                        +{quiz.xpReward} XP
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        padding: '11px',
                        fontSize: '14px',
                      }}
                    >
                      {prevAttempt ? (
                        <><RotateCcw size={14} /> Retake Quiz</>
                      ) : (
                        <><Play size={14} fill="white" /> Start Quiz</>
                      )}
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
