import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { mockChallenges } from '../data/mockData';
import { challengeToQuizMap, difficultyUnlockLevel } from '../data/challengeQuizMap';
import { ProgressBar } from '../components/ProgressBar';
import {
  Clock, Lock, CheckCircle, Play, ArrowRight, Flame, RotateCcw,
} from 'lucide-react';

const difficultyColor = {
  Beginner: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  Advanced: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const iconColor = {
  cyan: { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff' },
  purple: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  green: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  orange: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  pink: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
};

export default function ChallengesPage() {
  const { user, startChallenge } = useAuthContext();
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const level = user?.level || 1;
  const progressMap = user?.challengeProgress || {};

  const getStatus = (challenge) => {
    const entry = progressMap[challenge.id];
    const isDailyDoneToday = challenge.repeatable && entry?.lastCompletedDate === new Date().toDateString();
    const isLocked = level < (difficultyUnlockLevel[challenge.difficulty] || 1);

    if (isLocked) return 'locked';
    if (entry?.status === 'completed' && (!challenge.repeatable || isDailyDoneToday)) return 'completed';
    if (entry?.status === 'in_progress') return 'in_progress';
    return 'not_started';
  };

  const filteredChallenges = useMemo(() => {
    return mockChallenges.filter(c => selectedDifficulty === 'All' || c.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const completedCount = mockChallenges.filter(c => getStatus(c) === 'completed').length;

  const handleStart = (challenge) => {
    startChallenge(challenge.id);
    const quizId = challengeToQuizMap[challenge.id];
    if (quizId) navigate(`/quiz/${quizId}`);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
                Challenges
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
              Complete themed challenges to earn bonus XP on top of your quiz progress. New challenges unlock as you level up.
            </p>
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Completed</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#00d4ff' }}>
              {completedCount} / {mockChallenges.length}
            </div>
          </div>
        </div>

        {/* Difficulty tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
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
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {diff === 'All' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>

        {/* Challenges grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filteredChallenges.map(challenge => {
            const status = getStatus(challenge);
            const ic = iconColor[challenge.color] || iconColor.cyan;
            const dc = difficultyColor[challenge.difficulty] || difficultyColor.Beginner;
            const entry = progressMap[challenge.id];
            const progress = status === 'completed' ? 100 : (entry?.progress || 0);

            return (
              <div key={challenge.id} style={{
                background: 'rgba(19, 25, 41, 0.85)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                opacity: status === 'locked' ? 0.55 : 1,
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { if (status !== 'locked') { e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '14px',
                      background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                    }}>
                      {challenge.icon}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {challenge.isDaily && (
                        <span style={{
                          padding: '3px 8px', borderRadius: '50px', fontSize: '10px', fontWeight: 700,
                          background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                          display: 'flex', alignItems: 'center', gap: '3px',
                        }}>
                          <Flame size={10} /> DAILY
                        </span>
                      )}
                      <span style={{
                        padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 600,
                        background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                      }}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                    {challenge.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {challenge.description}
                  </p>

                  {status !== 'locked' && status !== 'not_started' && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Progress</span>
                        <span style={{ fontSize: '11px', color: ic.color, fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <ProgressBar value={progress} color={challenge.color} height={4} />
                    </div>
                  )}
                </div>

                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {challenge.timeEstimate}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#00d4ff' }}>+{challenge.xpReward} XP</span>
                  </div>

                  {status === 'locked' && (
                    <div style={{
                      width: '100%', padding: '11px', borderRadius: '50px', textAlign: 'center',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <Lock size={13} /> Unlocks at Level {difficultyUnlockLevel[challenge.difficulty]}
                    </div>
                  )}

                  {status === 'completed' && (
                    <div style={{
                      width: '100%', padding: '11px', borderRadius: '50px', textAlign: 'center',
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10b981', fontSize: '13px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <CheckCircle size={14} /> {challenge.repeatable ? 'Completed Today' : 'Completed'}
                    </div>
                  )}

                  {status === 'not_started' && (
                    <button onClick={() => handleStart(challenge)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px' }}>
                      <Play size={14} fill="white" /> Start Challenge
                    </button>
                  )}

                  {status === 'in_progress' && (
                    <button onClick={() => handleStart(challenge)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px' }}>
                      <ArrowRight size={14} /> Continue Challenge
                    </button>
                  )}

                  {status === 'completed' && challenge.repeatable && (
                    <button onClick={() => handleStart(challenge)} style={{
                      width: '100%', marginTop: '8px', padding: '9px', borderRadius: '50px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}>
                      <RotateCcw size={12} /> Come back tomorrow
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
