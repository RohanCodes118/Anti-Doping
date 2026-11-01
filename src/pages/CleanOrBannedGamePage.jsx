import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { cleanOrBannedScenarios, gameRules } from '../data/cleanOrBannedData';
import { ProgressBar } from '../components/ProgressBar';
import {
  CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw,
  Sparkles, Trophy, Flame, Coins, Shield, HelpCircle, ArrowLeft,
  ChevronRight, Award, Zap, BookOpen, ExternalLink
} from 'lucide-react';

const categoryColors = {
  'Over-the-Counter': { bg: 'rgba(0, 212, 255, 0.12)', text: '#00d4ff', border: 'rgba(0, 212, 255, 0.25)' },
  'Supplements': { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
  'Prescription / Anabolics': { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
  'Respiratory / Inhalers': { bg: 'rgba(124, 58, 237, 0.12)', text: '#a78bfa', border: 'rgba(124, 58, 237, 0.25)' },
  'Methods / Medical': { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.25)' },
  'Prescription / Endocrine': { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
  'Prescription / Weight Management': { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
  'Everyday Foods & Drinks': { bg: 'rgba(0, 212, 255, 0.12)', text: '#00d4ff', border: 'rgba(0, 212, 255, 0.25)' },
};

const choiceOptions = [
  {
    id: 'allowed',
    label: 'Clean / Allowed',
    subtext: 'Permitted at all times',
    icon: CheckCircle,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.3)',
    activeBg: 'rgba(16, 185, 129, 0.2)',
  },
  {
    id: 'prohibited',
    label: 'Banned / Prohibited',
    subtext: 'Violates WADA Prohibited List',
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    activeBg: 'rgba(239, 68, 68, 0.2)',
  },
  {
    id: 'check_first',
    label: 'Check / Verify First',
    subtext: 'Conditional, threshold, or TUE required',
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.3)',
    activeBg: 'rgba(245, 158, 11, 0.2)',
  },
];

export default function CleanOrBannedGamePage() {
  const { user, recordGameAttempt } = useAuthContext();
  const navigate = useNavigate();

  // Game state
  const [scenarios, setScenarios] = useState(cleanOrBannedScenarios);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const isLastQuestion = currentIndex === scenarios.length - 1;
  const catStyle = categoryColors[currentScenario?.category] || categoryColors['Over-the-Counter'];

  const handleSelectChoice = (choiceId) => {
    if (isAnswered) return;

    setSelectedChoice(choiceId);
    setIsAnswered(true);

    const isCorrect = choiceId === currentScenario.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const newStreak = isCorrect ? currentStreak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);

    setScore(newScore);
    setCurrentStreak(newStreak);
    setBestStreak(newBestStreak);

    setAnswersLog(prev => [
      ...prev,
      {
        scenarioId: currentScenario.id,
        scenarioTitle: currentScenario.title,
        userChoice: choiceId,
        correctChoice: currentScenario.correctAnswer,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      finishGame();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
      setIsAnswered(false);
      setShowDetails(false);
    }
  };

  const finishGame = () => {
    const total = scenarios.length;
    const finalScore = score;
    const accuracy = Math.round((finalScore / total) * 100);

    // Calculate XP and Clean Coins reward
    let calculatedXp = finalScore * gameRules.baseXpPerCorrect + (bestStreak * gameRules.streakBonusXp);
    let calculatedCoins = finalScore * gameRules.baseCoinsPerCorrect;

    // Bonus for high score
    if (accuracy >= 80) {
      calculatedXp += gameRules.firstCompletionBonusXp;
      calculatedCoins += gameRules.firstCompletionBonusCoins;
    }

    const gameAttemptRecord = {
      id: 'gam_cob_' + Date.now(),
      gameId: 'clean_or_banned',
      gameTitle: 'Clean or Banned?',
      score: finalScore,
      totalQuestions: total,
      accuracyPercentage: accuracy,
      bestStreak,
      xpEarned: calculatedXp,
      coinsEarned: calculatedCoins,
      completedAt: new Date().toISOString(),
    };

    // Save to Supabase and update user state
    const result = recordGameAttempt(gameAttemptRecord);

    setResultsData({
      ...gameAttemptRecord,
      xpAwarded: result?.xpAwarded ?? calculatedXp,
      coinsAwarded: result?.coinsAwarded ?? calculatedCoins,
      leveledUp: result?.leveledUp ?? false,
      newLevel: result?.newLevel,
      isFirstTime: result?.isFirstTime ?? true,
      totalCoins: result?.totalCoins ?? ((user?.cleanCoins || 0) + calculatedCoins),
    });

    setIsCompleted(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsAnswered(false);
    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setAnswersLog([]);
    setIsCompleted(false);
    setResultsData(null);
    setShowDetails(false);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RESULTS VIEW
  // ═════════════════════════════════════════════════════════════════════════════
  if (isCompleted && resultsData) {
    const accuracy = resultsData.accuracyPercentage;
    let badgeText = 'Elite Clean Sport Master! 👑';
    let badgeColor = '#10b981';
    let performanceDesc = 'Outstanding anti-doping awareness! You accurately differentiated between permitted, prohibited, and conditional substances.';

    if (accuracy < 60) {
      badgeText = 'Good Training Run! 🌱';
      badgeColor = '#f59e0b';
      performanceDesc = 'Anti-doping rules have strict nuances. Review the scenarios below to understand when TUEs or batch testing are mandatory.';
    } else if (accuracy < 90) {
      badgeText = 'Sharp Athlete Instincts! ⚡';
      badgeColor = '#00d4ff';
      performanceDesc = 'Solid performance! Keep practicing to master conditional substances, threshold rules, and supplement risks.';
    }

    return (
      <DashboardLayout>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'rgba(19, 25, 41, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}>
            {/* Background Glow */}
            <div style={{
              position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
              width: '300px', height: '300px',
              background: `radial-gradient(circle, ${badgeColor}25 0%, transparent 70%)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '50px',
              background: `${badgeColor}18`, border: `1px solid ${badgeColor}40`,
              color: badgeColor, fontSize: '13px', fontWeight: 700,
              marginBottom: '16px',
            }}>
              <Trophy size={15} /> {badgeText}
            </div>

            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 900, marginBottom: '8px',
            }}>
              Game Complete!
            </h1>

            <p style={{
              fontSize: '14px', color: 'var(--color-text-secondary)',
              maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.6,
            }}>
              {performanceDesc}
            </p>

            {/* Score & Metrics Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px', marginBottom: '28px',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '16px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Final Score</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: '#00d4ff' }}>
                  {resultsData.score} / {resultsData.totalQuestions}
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '16px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Accuracy</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: badgeColor }}>
                  {resultsData.accuracyPercentage}%
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '16px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Best Streak</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>
                  {resultsData.bestStreak} 🔥
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(124, 58, 237, 0.12))',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '18px',
              padding: '20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(0, 212, 255, 0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>⚡</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>XP Awarded</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#00d4ff' }}>
                    +{resultsData.xpAwarded} XP
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>🪙</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Clean Coins</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>
                    +{resultsData.coinsAwarded} Coins
                  </div>
                </div>
              </div>

              {resultsData.leveledUp && (
                <div style={{
                  padding: '6px 14px', borderRadius: '50px',
                  background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                  color: 'white', fontWeight: 700, fontSize: '12px',
                }}>
                  🎉 LEVEL UP: Lv. {resultsData.newLevel}!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRestart}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={15} /> Play Again
              </button>

              <Link
                to="/games"
                className="btn-secondary"
                style={{
                  padding: '12px 24px', fontSize: '14px', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <ArrowLeft size={15} /> Back to Games Arcade
              </Link>
            </div>
          </div>

          {/* Scenario Debrief List */}
          <div style={{
            background: 'rgba(19, 25, 41, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Scenario Debrief & Key Learnings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {answersLog.map((log, i) => {
                const sc = scenarios.find(s => s.id === log.scenarioId);
                const correctOpt = choiceOptions.find(o => o.id === sc.correctAnswer);
                return (
                  <div
                    key={log.scenarioId}
                    style={{
                      padding: '16px',
                      background: log.isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                      border: `1px solid ${log.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {log.isCorrect ? (
                          <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                        ) : (
                          <XCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                          {i + 1}. {sc.title}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '50px',
                        color: correctOpt.color, background: correctOpt.bg, border: `1px solid ${correctOpt.border}`,
                      }}>
                        {correctOpt.label}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>
                      {sc.shortExplanation}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      💡 Tip: {sc.actionTip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // ACTIVE GAMEPLAY VIEW
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Top Game Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
        }}>
          <Link
            to="/games"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--color-text-secondary)', textDecoration: 'none',
              fontSize: '13px', fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Exit Game
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Streak Counter */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '50px',
              background: currentStreak > 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${currentStreak > 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: currentStreak > 1 ? '#f59e0b' : 'var(--color-text-muted)',
              fontSize: '12px', fontWeight: 700,
              transition: 'all 0.3s ease',
            }}>
              <Flame size={14} style={{ color: currentStreak > 1 ? '#f59e0b' : 'var(--color-text-muted)' }} />
              {currentStreak} Streak
            </div>

            {/* Score */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '50px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              color: '#00d4ff', fontSize: '13px', fontWeight: 700,
            }}>
              <Trophy size={14} /> Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}
            </div>

            {/* Clean Coins balance */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '50px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#f59e0b', fontSize: '12px', fontWeight: 700,
            }}>
              <Coins size={14} /> {user?.cleanCoins ?? 100}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Scenario {currentIndex + 1} of {scenarios.length}
            </span>
            <span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 600 }}>
              {Math.round(((currentIndex + 1) / scenarios.length) * 100)}%
            </span>
          </div>
          <ProgressBar value={((currentIndex + 1) / scenarios.length) * 100} color="cyan" height={6} />
        </div>

        {/* Main Scenario Card */}
        <div style={{
          background: 'rgba(19, 25, 41, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '32px 28px',
          marginBottom: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {/* Category Tag & Icon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '50px',
              background: catStyle.bg, border: `1px solid ${catStyle.border}`,
              color: catStyle.text, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            }}>
              <span>{currentScenario.icon}</span> {currentScenario.category}
            </div>

            <span style={{
              fontSize: '11px', color: 'var(--color-text-muted)',
              padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)',
            }}>
              {currentScenario.difficulty}
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(20px, 3vw, 24px)',
            fontWeight: 800, marginBottom: '14px', lineHeight: 1.3,
          }}>
            {currentScenario.title}
          </h2>

          <p style={{
            fontSize: '15px', color: 'var(--color-text-primary)', lineHeight: 1.7,
            marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px',
            borderRadius: '14px', borderLeft: '3px solid #00d4ff',
          }}>
            "{currentScenario.scenario}"
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', color: 'var(--color-text-secondary)',
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Substance / Method involved:</span>
            <strong style={{ color: 'white' }}>{currentScenario.substance}</strong>
          </div>
        </div>

        {/* 3 Answer Choice Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {choiceOptions.map(option => {
            const Icon = option.icon;
            const isSelected = selectedChoice === option.id;
            const isCorrect = option.id === currentScenario.correctAnswer;

            let cardBg = option.bg;
            let cardBorder = option.border;
            let opacity = 1;

            if (isAnswered) {
              if (isCorrect) {
                cardBg = 'rgba(16, 185, 129, 0.2)';
                cardBorder = 'rgba(16, 185, 129, 0.6)';
              } else if (isSelected && !isCorrect) {
                cardBg = 'rgba(239, 68, 68, 0.2)';
                cardBorder = 'rgba(239, 68, 68, 0.6)';
              } else {
                opacity = 0.5;
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectChoice(option.id)}
                disabled={isAnswered}
                style={{
                  padding: '20px 16px',
                  borderRadius: '18px',
                  background: cardBg,
                  border: `2px solid ${cardBorder}`,
                  color: 'white',
                  cursor: isAnswered ? 'default' : 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  opacity,
                  position: 'relative',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  if (!isAnswered) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${option.color}25`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isAnswered) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${option.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} style={{ color: option.color }} />
                  </div>

                  {isAnswered && isCorrect && (
                    <span style={{
                      fontSize: '11px', fontWeight: 700, color: '#10b981',
                      padding: '2px 8px', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.2)',
                    }}>
                      CORRECT ANSWER
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {option.subtext}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback & Educational Explanation Section */}
        {isAnswered && (
          <div style={{
            background: selectedChoice === currentScenario.correctAnswer
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(19, 25, 41, 0.9))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(19, 25, 41, 0.9))',
            border: `1px solid ${selectedChoice === currentScenario.correctAnswer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedChoice === currentScenario.correctAnswer ? (
                  <>
                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, color: '#10b981' }}>
                      Correct! +{gameRules.baseXpPerCorrect} XP
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} style={{ color: '#ef4444' }} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, color: '#ef4444' }}>
                      Not Quite!
                    </span>
                  </>
                )}
              </div>

              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {currentScenario.ruleReference}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {currentScenario.shortExplanation}
            </p>

            {/* Expandable detailed medical explanation */}
            {showDetails ? (
              <div style={{
                padding: '14px', background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6,
                marginBottom: '14px',
              }}>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }}>Deep Dive Context:</div>
                {currentScenario.detailedExplanation}
              </div>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  background: 'none', border: 'none', color: '#00d4ff', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '4px', padding: 0, marginBottom: '14px',
                }}
              >
                <BookOpen size={13} /> View full regulatory context
              </button>
            )}

            {/* Actionable tip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)',
              padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '18px',
            }}>
              <span>💡</span>
              <span><strong>Athlete Action:</strong> {currentScenario.actionTip}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center', padding: '14px',
                fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {isLastQuestion ? (
                <>View Final Results <Trophy size={16} /></>
              ) : (
                <>Next Scenario <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
