import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import PersistentLogoNavigation from './components/PersistentLogoNavigation';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountSelectPage from './pages/AccountSelectPage';
import DashboardPage from './pages/DashboardPage';
import QuizCenterPage from './pages/QuizCenterPage';
import QuizActivePage from './pages/QuizActivePage';
import QuizHistoryPage from './pages/QuizHistoryPage';
import GamesPage from './pages/GamesPage';
import CleanOrBannedGamePage from './pages/CleanOrBannedGamePage';
import ChallengesPage from './pages/ChallengesPage';
import LearnPage from './pages/LearnPage';
import BadgesPage from './pages/BadgesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import NotFoundPage from './pages/NotFoundPage';

// Branded loading screen while verifying Supabase session
function AuthLoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary, #0a0e1a)',
      color: 'white',
      fontFamily: "'Outfit', sans-serif",
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 212, 255, 0.15)',
        borderTopColor: '#00d4ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #94a3b8)', letterSpacing: '0.5px' }}>
        Loading Clean Quest...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <AuthLoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

// Guest-only route (redirect if already logged in)
function GuestRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <AuthLoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth & Account Switcher routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/accounts" element={<AccountSelectPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/quizzes" element={
        <ProtectedRoute><QuizCenterPage /></ProtectedRoute>
      } />
      <Route path="/quiz/:quizId" element={
        <ProtectedRoute><QuizActivePage /></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute><QuizHistoryPage /></ProtectedRoute>
      } />

      {/* Mini-Games Arcade */}
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/clean-or-banned" element={
        <ProtectedRoute><CleanOrBannedGamePage /></ProtectedRoute>
      } />

      <Route path="/challenges" element={
        <ProtectedRoute><ChallengesPage /></ProtectedRoute>
      } />
      <Route path="/learn" element={
        <ProtectedRoute><LearnPage /></ProtectedRoute>
      } />
      <Route path="/badges" element={
        <ProtectedRoute><BadgesPage /></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute><CommunityPage /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><SettingsPage /></ProtectedRoute>
      } />
      <Route path="/ai-assistant" element={
        <ProtectedRoute><AiAssistantPage /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SplashScreen />
        <PersistentLogoNavigation />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


