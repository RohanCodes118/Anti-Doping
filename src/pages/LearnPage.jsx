import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { mockModules } from '../data/mockData';
import { learningContent } from '../data/learningContent';
import { ProgressBar } from '../components/ProgressBar';
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle, Play, ArrowRight, Target,
} from 'lucide-react';

const iconColor = {
  cyan: { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff' },
  purple: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  green: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  orange: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

export default function LearnPage() {
  const { user, markLessonComplete } = useAuthContext();
  const navigate = useNavigate();
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);

  const progressMap = user?.learningProgress || {};

  const activeModule = mockModules.find(m => m.id === activeModuleId);
  const lessons = activeModule ? (learningContent[activeModule.id] || []) : [];
  const currentLesson = lessons[lessonIndex];
  const moduleProgress = activeModuleId ? (progressMap[activeModuleId]?.completedLessonIds || []) : [];

  const openModule = (moduleId) => {
    setActiveModuleId(moduleId);
    setLessonIndex(0);
  };

  const handleCompleteLesson = () => {
    if (!activeModule || !currentLesson) return;
    markLessonComplete(activeModule.id, currentLesson.id, lessons.length);
    if (lessonIndex < lessons.length - 1) {
      setLessonIndex(prev => prev + 1);
    }
  };

  // ═══════════════ MODULE READER VIEW ═══════════════
  if (activeModule) {
    const isLessonDone = moduleProgress.includes(currentLesson?.id);
    const allDone = progressMap[activeModule.id]?.completed;
    const ic = iconColor[activeModule.color] || iconColor.cyan;

    return (
      <DashboardLayout>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button
            onClick={() => setActiveModuleId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
              color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500, marginBottom: '20px',
            }}
          >
            <ChevronLeft size={16} /> Back to Learning Paths
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              {activeModule.icon}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800 }}>{activeModule.title}</h1>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Lesson {lessonIndex + 1} of {lessons.length}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <ProgressBar value={((lessonIndex + (isLessonDone ? 1 : 0)) / lessons.length) * 100} color={activeModule.color} height={6} />
          </div>

          <div style={{
            background: 'rgba(19, 25, 41, 0.9)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: ic.color, letterSpacing: '0.5px', marginBottom: '10px' }}>
              LESSON {lessonIndex + 1}
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
              {currentLesson?.title}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {currentLesson?.body}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setLessonIndex(prev => Math.max(0, prev - 1))}
              disabled={lessonIndex === 0}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '13px', opacity: lessonIndex === 0 ? 0.5 : 1, cursor: lessonIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {isLessonDone ? (
              lessonIndex < lessons.length - 1 ? (
                <button onClick={() => setLessonIndex(prev => prev + 1)} className="btn-primary" style={{ padding: '12px 24px', fontSize: '13px' }}>
                  Next Lesson <ChevronRight size={14} />
                </button>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '50px', color: '#10b981', fontSize: '13px', fontWeight: 700,
                }}>
                  <CheckCircle size={15} /> {allDone ? 'Module Complete!' : 'Lesson Complete'}
                </div>
              )
            ) : (
              <button onClick={handleCompleteLesson} className="btn-primary" style={{ padding: '12px 24px', fontSize: '13px' }}>
                <CheckCircle size={14} /> Mark Lesson Complete
              </button>
            )}
          </div>

          {allDone && (
            <div style={{
              marginTop: '24px', padding: '20px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.1))',
              border: '1px solid rgba(0,212,255,0.2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>Nice work finishing this module!</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Put it to the test in the Quiz Center.</div>
              </div>
              <button onClick={() => navigate('/quizzes')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                Take a Quiz <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ═══════════════ MODULE LIST VIEW ═══════════════
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>📖</span>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
              Learning Paths
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '560px' }}>
            Structured lessons covering everything from anti-doping basics to advanced testing procedures. Complete a module, then test yourself in the Quiz Center.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {mockModules.map(mod => {
            const ic = iconColor[mod.color] || iconColor.cyan;
            const entry = progressMap[mod.id];
            const progress = entry?.progress ?? 0;
            const totalLessons = (learningContent[mod.id] || []).length || mod.lessons;

            return (
              <div key={mod.id} style={{
                background: 'rgba(19, 25, 41, 0.85)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', transition: 'all 0.3s ease', cursor: 'pointer',
              }}
                onClick={() => openModule(mod.id)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                      {mod.icon}
                    </div>
                    {progress === 100 && (
                      <span style={{
                        padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
                        background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <CheckCircle size={11} /> Done
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{mod.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{mod.description}</p>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {totalLessons} lessons</span>
                    <span>{mod.duration}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '11px', color: ic.color, fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} color={mod.color} height={5} />
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px', marginTop: '14px' }}>
                    {progress === 0 ? <><Play size={13} fill="white" /> Start Module</> : progress === 100 ? <><Target size={13} /> Review Module</> : <><ArrowRight size={13} /> Continue Module</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
