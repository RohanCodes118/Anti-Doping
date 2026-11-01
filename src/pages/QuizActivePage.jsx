import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { quizzes, getAIRecommendation } from '../data/quizData';
import { mockChallenges } from '../data/mockData';
import { getChallengeIdsForQuiz } from '../data/challengeQuizMap';
import { ProgressBar } from '../components/ProgressBar';
import {
  CheckCircle, XCircle, Clock, Trophy, ArrowRight, RotateCcw,
  Sparkles, HelpCircle, ArrowLeft, Shield, Zap, ChevronDown, ChevronUp,
  Award, Star, Flame, Eye
} from 'lucide-react';

export default function QuizActivePage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user, addQuizAttempt, completeChallenge } = useAuthContext();

  const quiz = quizzes.find(q => q.id === quizId) || quizzes[0];
  const questions = quiz.questions;

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // array of { questionId, selectedIndex, isCorrect }

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.timeLimitSeconds);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Results & Mode state
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const timerRef = useRef(null);

  // Countdown Timer
  useEffect(() => {
    if (!isQuizCompleted && isTimerActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuizAuto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isQuizCompleted, isTimerActive, secondsRemaining]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Handle Option Select
  const handleSelectOption = (index) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
  };

  // Handle Submit Answer
  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;

    const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;
    setIsAnswerSubmitted(true);

    const answerRecord = {
      questionId: currentQuestion.id,
      selectedOptionIndex,
      isCorrect,
    };

    setUserAnswers(prev => [...prev, answerRecord]);
  };

  // Handle Next Question
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    }
  };

  // Auto finish when time expires
  const finishQuizAuto = () => {
    finishQuiz();
  };

  // Calculate results & update user state
  const finishQuiz = () => {
    clearInterval(timerRef.current);
    setIsQuizCompleted(true);

    // Calculate score
    const total = questions.length;
    let correctCount = userAnswers.filter(a => a.isCorrect).length;

    // Handle last question if submitted
    if (isAnswerSubmitted && userAnswers.length < questions.length) {
      const lastAnswer = userAnswers[userAnswers.length - 1];
      if (lastAnswer && lastAnswer.isCorrect) {
        // already counted
      }
    }

    const scorePercentage = Math.round((correctCount / total) * 100);
    const timeSpentSeconds = quiz.timeLimitSeconds - secondsRemaining;

    // Calculate XP earned based on percentage
    const baseXP = quiz.xpReward;
    const xpEarned = Math.round((scorePercentage / 100) * baseXP);

    const attemptData = {
      id: 'att_' + Date.now(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      categoryId: quiz.categoryId,
      categoryName: quiz.categoryName,
      difficulty: quiz.difficulty,
      score: correctCount,
      totalQuestions: total,
      scorePercentage,
      xpEarned,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
    };

    // Save attempt to user state and get level up info
    const levelResult = addQuizAttempt(attemptData);

    // If this quiz is the "associated activity" for one or more in-progress
    // challenges, completing it here also completes those challenges and
    // awards their bonus XP (guarded against repeat farming in useAuth).
    let bonusChallengeXP = 0;
    let challengeLeveledUp = false;
    let challengeFinalLevel = levelResult?.newLevel;
    const linkedChallengeIds = getChallengeIdsForQuiz(quiz.id);
    linkedChallengeIds.forEach(challengeId => {
      const challenge = mockChallenges.find(c => c.id === challengeId);
      if (!challenge) return;
      const isInProgress = user?.challengeProgress?.[challengeId]?.status === 'in_progress';
      if (!isInProgress) return;
      const result = completeChallenge(challenge);
      if (result && !result.alreadyCompleted) {
        bonusChallengeXP += result.xpEarned || 0;
        if (result.leveledUp) {
          challengeLeveledUp = true;
          challengeFinalLevel = result.newLevel;
        }
      }
    });

    setQuizResults({
      correctCount,
      totalQuestions: total,
      scorePercentage,
      xpEarned,
      bonusChallengeXP,
      timeSpentSeconds,
      attemptData,
    });

    if (levelResult?.leveledUp || challengeLeveledUp) {
      setLevelUpData({ leveledUp: true, newLevel: challengeFinalLevel });
    }
  };

  // Reset for Retry
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setSecondsRemaining(quiz.timeLimitSeconds);
    setIsQuizCompleted(false);
    setQuizResults(null);
    setIsReviewMode(false);
    setLevelUpData(null);
  };

  // Performance message generator
  const getPerformanceFeedback = (pct) => {
    if (pct === 100) return { title: 'Perfect Score! 🏆', sub: 'Flawless execution! You are a true Clean Sport Champion.', color: '#10b981' };
    if (pct >= 80) return { title: 'Excellent Work! 🚀', sub: 'Outstanding anti-doping knowledge! You understand the rules thoroughly.', color: '#00d4ff' };
    if (pct >= 60) return { title: 'Great Progress! 💪', sub: 'Solid performance! A little more practice and you will master this topic.', color: '#f59e0b' };
    return { title: 'Keep Learning! 📚', sub: 'Good effort! Review the explanations below and try again to boost your score.', color: '#ef4444' };
  };

  // Next recommended quiz for results screen
  const aiNext = getAIRecommendation(user?.quizHistory || []);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VIEW 1: ACTIVE QUIZ VIEW                                  */}
        {/* ═════════════════════════════════════════════════════════ */}
        {!isQuizCompleted && (
          <div>
            {/* Header / Stepper Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            }}>
              <button
                onClick={() => navigate('/quizzes')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                }}
              >
                <ArrowLeft size={16} /> Exit Quiz
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Timer */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px',
                  background: secondsRemaining < 60 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${secondsRemaining < 60 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '50px',
                  color: secondsRemaining < 60 ? '#ef4444' : 'var(--color-text-primary)',
                  fontSize: '13px', fontWeight: 700,
                }}>
                  <Clock size={14} /> {formatTime(secondsRemaining)}
                </div>

                <div style={{
                  fontSize: '13px', fontWeight: 700, color: '#00d4ff',
                  padding: '6px 14px', background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '50px', border: '1px solid rgba(0, 212, 255, 0.2)',
                }}>
                  +{quiz.xpReward} XP Possible
                </div>
              </div>
            </div>

            {/* Quiz Progress Bar */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Question <span style={{ color: '#00d4ff' }}>{currentQuestionIndex + 1}</span> of {questions.length}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <ProgressBar value={((currentQuestionIndex + 1) / questions.length) * 100} color="cyan" height={8} />
            </div>

            {/* Question Card */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              marginBottom: '24px',
            }}>
              {/* Category & difficulty tag */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 600,
                  background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)',
                }}>
                  {quiz.categoryName}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 600,
                  background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)',
                }}>
                  {quiz.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(18px, 2.5vw, 22px)',
                fontWeight: 700,
                lineHeight: 1.4,
                marginBottom: '28px',
                color: 'var(--color-text-primary)',
              }}>
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = selectedOptionIndex === optIdx;
                  const isCorrectOption = optIdx === currentQuestion.correctIndex;

                  let border = '1px solid rgba(255,255,255,0.08)';
                  let bg = 'rgba(255,255,255,0.03)';
                  let color = 'var(--color-text-primary)';
                  let letterBg = 'rgba(255,255,255,0.06)';

                  if (isSelected && !isAnswerSubmitted) {
                    border = '1px solid #00d4ff';
                    bg = 'rgba(0, 212, 255, 0.08)';
                    letterBg = '#00d4ff';
                  }

                  if (isAnswerSubmitted) {
                    if (isCorrectOption) {
                      border = '1px solid #10b981';
                      bg = 'rgba(16, 185, 129, 0.12)';
                      letterBg = '#10b981';
                    } else if (isSelected && !isCorrectOption) {
                      border = '1px solid #ef4444';
                      bg = 'rgba(239, 68, 68, 0.12)';
                      letterBg = '#ef4444';
                    }
                  }

                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border, background: bg, color,
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isAnswerSubmitted && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isAnswerSubmitted && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: letterBg, color: isSelected || (isAnswerSubmitted && (isCorrectOption || isSelected)) ? 'white' : 'var(--color-text-secondary)',
                        fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {letter}
                      </div>

                      <div style={{ flex: 1, fontSize: '15px', lineHeight: 1.5 }}>
                        {optionText}
                      </div>

                      {/* Result Check/Cross icon */}
                      {isAnswerSubmitted && isCorrectOption && (
                        <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrectOption && (
                        <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Answer button */}
              {!isAnswerSubmitted && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOptionIndex === null}
                  className="btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px',
                    opacity: selectedOptionIndex === null ? 0.5 : 1,
                    cursor: selectedOptionIndex === null ? 'not-allowed' : 'pointer',
                  }}
                >
                  Submit Answer
                </button>
              )}
            </div>

            {/* ════════════ INSTANT FEEDBACK BOX ════════════ */}
            {isAnswerSubmitted && (
              <div style={{
                background: selectedOptionIndex === currentQuestion.correctIndex
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${selectedOptionIndex === currentQuestion.correctIndex ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '18px',
                padding: '24px',
                marginBottom: '24px',
                animation: 'fadeInUp 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {selectedOptionIndex === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle size={22} style={{ color: '#10b981' }} />
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
                        Correct Answer! 🎉
                      </h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={22} style={{ color: '#ef4444' }} />
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
                        Incorrect
                      </h3>
                    </>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Explanation: </strong>
                  {currentQuestion.explanation}
                </p>

                <button
                  onClick={handleNextQuestion}
                  className="btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px',
                  }}
                >
                  {isLastQuestion ? 'View Quiz Results 🏆' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VIEW 2: QUIZ RESULTS SCREEN                               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {isQuizCompleted && quizResults && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>

            {/* Level Up Banner Modal */}
            {levelUpData && (
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #00d4ff 100%)',
                borderRadius: '20px', padding: '24px 32px',
                textAlign: 'center', color: 'white', marginBottom: '28px',
                boxShadow: '0 12px 36px rgba(0, 212, 255, 0.4)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉 LEVEL UP! 🎉</div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>
                  Congratulations! You reached Level {levelUpData.newLevel}!
                </h2>
                <p style={{ fontSize: '15px', opacity: 0.9 }}>
                  Your anti-doping mastery is growing. Keep completing quizzes to climb the ranks!
                </p>
              </div>
            )}

            {/* Performance Header Card */}
            {(() => {
              const fb = getPerformanceFeedback(quizResults.scorePercentage);
              return (
                <div style={{
                  background: 'rgba(19, 25, 41, 0.9)',
                  border: `1px solid ${fb.color}40`,
                  borderRadius: '24px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 40px ${fb.color}15`,
                  marginBottom: '28px',
                }}>
                  {/* Big score circle */}
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    margin: '0 auto 20px',
                    background: `radial-gradient(circle, ${fb.color}20 0%, transparent 70%)`,
                    border: `4px solid ${fb.color}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 30px ${fb.color}40`,
                  }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '36px', fontWeight: 900, color: fb.color }}>
                      {quizResults.scorePercentage}%
                    </span>
                  </div>

                  <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: fb.color, marginBottom: '8px' }}>
                    {fb.title}
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                    {fb.sub}
                  </p>

                  {/* Summary Stats Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px', maxWidth: '600px', margin: '0 auto',
                  }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Score</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {quizResults.correctCount} / {quizResults.totalQuestions}
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>XP Earned</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                        +{quizResults.xpEarned} XP
                      </div>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Time Taken</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#00d4ff', marginTop: '4px' }}>
                        {formatTime(quizResults.timeSpentSeconds)}
                      </div>
                    </div>
                  </div>

                  {quizResults.bonusChallengeXP > 0 && (
                    <div style={{
                      marginTop: '16px', maxWidth: '600px', margin: '16px auto 0',
                      padding: '12px 18px', borderRadius: '12px',
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10b981', fontSize: '13px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                      <Trophy size={14} /> Challenge completed! +{quizResults.bonusChallengeXP} bonus XP
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons Row */}
            <div style={{
              display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px',
            }}>
              <button onClick={() => setIsReviewMode(!isReviewMode)} className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                <Eye size={16} /> {isReviewMode ? 'Hide Question Review' : 'Review Answers'}
              </button>

              <button onClick={handleRetryQuiz} className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                <RotateCcw size={16} /> Retry Quiz
              </button>

              <button onClick={() => navigate('/quizzes')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                Quiz Center <ArrowRight size={16} />
              </button>

              <Link to="/dashboard" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                Dashboard
              </Link>
            </div>

            {/* ════════════ REVIEW ANSWERS ACCORDION ════════════ */}
            {isReviewMode && (
              <div style={{
                background: 'rgba(19, 25, 41, 0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '32px',
                animation: 'fadeInUp 0.3s ease',
              }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
                  Detailed Question Review
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {questions.map((q, idx) => {
                    const ans = userAnswers[idx];
                    const isCorrect = ans?.isCorrect;
                    const userSelectedIdx = ans?.selectedOptionIndex;

                    return (
                      <div key={q.id} style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        borderRadius: '14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                            background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCorrect ? '#10b981' : '#ef4444',
                          }}>
                            Q{idx + 1}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{q.question}</h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                          {q.options.map((optText, oIdx) => {
                            const isUserChoice = userSelectedIdx === oIdx;
                            const isRight = oIdx === q.correctIndex;

                            let color = 'var(--color-text-secondary)';
                            let bg = 'rgba(255,255,255,0.02)';
                            let border = '1px solid transparent';

                            if (isRight) {
                              color = '#10b981';
                              bg = 'rgba(16, 185, 129, 0.08)';
                              border = '1px solid rgba(16, 185, 129, 0.3)';
                            } else if (isUserChoice && !isRight) {
                              color = '#ef4444';
                              bg = 'rgba(239, 68, 68, 0.08)';
                              border = '1px solid rgba(239, 68, 68, 0.3)';
                            }

                            return (
                              <div key={oIdx} style={{
                                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                                background: bg, border, color, display: 'flex', justifyContent: 'space-between',
                              }}>
                                <span>{String.fromCharCode(65 + oIdx)}. {optText}</span>
                                <div>
                                  {isUserChoice && <span style={{ fontSize: '11px', fontWeight: 600, marginRight: '6px' }}>(Your Choice)</span>}
                                  {isRight && <span style={{ fontSize: '11px', fontWeight: 700 }}>(Correct)</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', lineHeight: 1.6 }}>
                          <strong style={{ color: '#00d4ff' }}>Rule Explanation: </strong>{q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════ AI NEXT RECOMMENDATION BANNER ════════════ */}
            {aiNext && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    RECOMMENDED NEXT QUIZ
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                    {aiNext.recommendedQuiz?.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {aiNext.reason}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate(`/quiz/${aiNext.recommendedQuizId}`);
                    window.scrollTo(0, 0);
                    handleRetryQuiz();
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Start Next Quiz →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
