import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Bot,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  ShieldAlert,
  Zap,
  Info,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What should an athlete check before taking a supplement?',
  'Why do multi-symptom cold medicines pose an anti-doping risk?',
  'What is the difference between active and inactive ingredients?',
  'How do I check a medication on Global DRO?',
];

const DEMO_SAMPLES = [
  {
    label: 'Cold & Sinus Medication',
    desc: 'Contains Pseudoephedrine',
    prompt: 'Check Cold & Sinus Relief tablets containing Pseudoephedrine HCl 60mg and Paracetamol 500mg for in-competition athletics.',
  },
  {
    label: 'Workout Pre-Workout',
    desc: 'Contains Caffeine & Creatine',
    prompt: 'Review Performance Pre-Workout powder containing Creatine Monohydrate, Beta-Alanine, and 200mg Caffeine for anti-doping concerns.',
  },
  {
    label: 'Standard Paracetamol',
    desc: 'Analgesic Pain Relief',
    prompt: 'Is standard Paracetamol 500mg without any other active ingredients permitted for competitive athletes?',
  },
];

const LOADING_STEPS = [
  'Reading label & package details...',
  'Identifying active ingredients & dosage...',
  'Screening for potential anti-doping concerns...',
  'Preparing educational guidance & next steps...',
];

const FLASH_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', badge: '⚡ Ultra-Fast', desc: 'Instant label & text analysis' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: '🚀 Next-Gen', desc: 'Balanced multimodal intelligence' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: '🧠 Deep Reasoning', desc: 'Comprehensive anti-doping breakdown' },
];

export default function AiAssistantPage() {
  const { recordAiInteraction } = useAuthContext();

  // Model selection state
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash-lite');

  // Mode: 'analyze' (image/label scan) or 'chat' (conversational QA)
  const [activeTab, setActiveTab] = useState('analyze');

  // Input states
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Camera capture modal states
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Loading & Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Analysis Result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [demoNotice, setDemoNotice] = useState(null);

  // Chat conversation states
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am Clean Quest AI, your educational medicine and supplement assistant. Ask me about ingredients, label terms, or anti-doping screening, or upload an image of a medicine package to get started.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // XP Reward Notification
  const [rewardToast, setRewardToast] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputFallbackRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Step loading text timer
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStepIndex(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Stop camera stream when component unmounts or camera is closed
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle XP award helper
  const handleGamificationAward = () => {
    if (typeof recordAiInteraction === 'function') {
      try {
        const res = recordAiInteraction();
        if (res && res.xpEarned > 0) {
          const message = res.isFirstSession
            ? `🎉 +${res.xpEarned} XP Awarded! First Clean Quest AI Session Completed!`
            : `⚡ +${res.xpEarned} XP Awarded! Daily AI Learning Interaction!`;
          setRewardToast(message);
          setTimeout(() => setRewardToast(null), 5000);
        }
      } catch (err) {
        console.warn('XP award notice:', err);
      }
    }
  };

  // File validation
  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage('Image size is too large (max 10MB). Please select a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Camera handlers
  const startCamera = async () => {
    setErrorMessage(null);
    setCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser camera access is not supported. Using device camera picker.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access fallback:', err.message);
      // Fallback to mobile camera input
      if (cameraInputFallbackRef.current) {
        cameraInputFallbackRef.current.click();
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);

    // Convert dataURL to File
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
      });

    stopCamera();
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputFallbackRef.current) cameraInputFallbackRef.current.value = '';
  };

  // Analyze Medicine / Supplement action
  const handleAnalyze = async () => {
    if (!selectedFile && !promptText.trim()) {
      setErrorMessage('Please enter a medicine or supplement name, or upload an image to analyze.');
      return;
    }

    setLoadingStepIndex(0);
    setIsLoading(true);
    setErrorMessage(null);
    setDemoNotice(null);

    try {
      let imageBase64 = null;
      let mimeType = 'image/jpeg';

      if (imagePreview) {
        imageBase64 = imagePreview;
        if (selectedFile) mimeType = selectedFile.type || 'image/jpeg';
      }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText.trim(),
          image: imageBase64,
          mimeType,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to analyze this item. Try uploading a clearer photo showing the full label.');
      }

      setAnalysisResult(data.analysis);
      if (data.isDemoMode) {
        setDemoNotice(data.notice);
      }

      // Add to chat history context
      setChatMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: `Analyzed: ${data.analysis.productName || promptText || 'Medicine Package'}`,
        },
        {
          role: 'assistant',
          content: `I analyzed **${data.analysis.productName}**. Status: **${data.analysis.antiDopingStatus}**. ${data.analysis.reasoning}`,
        },
      ]);

      // Award XP
      handleGamificationAward();
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'Unable to analyze this image. Try uploading a clearer photo showing the full medicine label.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Send Follow-up Chat Message
  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    const updatedMessages = [
      ...chatMessages,
      { role: 'user', content: userText },
    ];
    setChatMessages(updatedMessages);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(-6), // Send last few messages for session context
          contextProduct: analysisResult,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive response from Clean Quest AI.');
      }

      setChatMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.reply },
      ]);

      // Award daily XP if eligible
      handleGamificationAward();
    } catch (err) {
      setChatMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'An error occurred while answering your question. Please try again.'}`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetConversation = () => {
    setChatMessages([
      {
        role: 'assistant',
        content:
          'Conversation reset. Ask any question about medicines, supplements, or anti-doping verification.',
      },
    ]);
  };

  // Helper for Status UI Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'POTENTIAL_CONCERN':
        return {
          title: 'Potential Anti-Doping Concern',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          icon: ShieldAlert,
          desc: 'One or more ingredients or product attributes match restricted or monitored substances under anti-doping guidelines.',
        };
      case 'VERIFY_REQUIRED':
        return {
          title: 'Verification Required',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          icon: AlertTriangle,
          desc: 'Specific formulation, manufacturer batch, or route of administration requires official database verification.',
        };
      case 'NO_CONCERN_IDENTIFIED':
        return {
          title: 'No Prohibited Substances Identified on Label',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          icon: CheckCircle2,
          desc: 'Visible active ingredients do not match prohibited classes. Note: Official verification is still mandatory before consumption.',
        };
      case 'INSUFFICIENT_INFORMATION':
      default:
        return {
          title: 'Insufficient Label Information',
          bg: 'rgba(148, 163, 184, 0.12)',
          border: 'rgba(148, 163, 184, 0.3)',
          color: '#94a3b8',
          icon: AlertCircle,
          desc: 'The label image or text is incomplete, cropped, or ambiguous. Provide a clearer photo showing the full active ingredient panel.',
        };
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>

        {/* ══════════════ GAMIFICATION REWARD TOAST ══════════════ */}
        {rewardToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            color: 'white',
            padding: '14px 22px',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0, 212, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
          }}>
            <Zap size={18} fill="white" />
            <span>{rewardToast}</span>
          </div>
        )}

        {/* ══════════════ HEADER ══════════════ */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.25))',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00d4ff',
            }}>
              <Bot size={20} />
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#00d4ff',
              textTransform: 'uppercase',
            }}>
              Gemini Flash AI Powered
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(26px, 3.5vw, 34px)',
            fontWeight: 800,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #ffffff 40%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Clean Quest AI
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '700px', lineHeight: 1.6 }}>
            Understand medicines, supplements, and anti-doping concerns with AI-assisted guidance.
            Scan product packaging, inspect active ingredients, and learn how to verify compliance.
          </p>
        </div>

        {/* ══════════════ DEMO MODE / NOTICE BANNER ══════════════ */}
        {demoNotice && (
          <div style={{
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#00d4ff',
          }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>{demoNotice}</span>
          </div>
        )}

        {/* ══════════════ GEMINI FLASH MODEL SELECTOR ══════════════ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '22px',
          flexWrap: 'wrap',
          background: 'rgba(19, 25, 41, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            <Zap size={14} style={{ color: '#00d4ff' }} />
            <span>Active Gemini Flash Model:</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FLASH_MODELS.map(m => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid rgba(0, 212, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? '#00d4ff' : 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(0, 212, 255, 0.15)' : 'none',
                  }}
                  title={m.desc}
                >
                  <span>{m.name}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '50px',
                    background: isSelected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? 'white' : 'var(--color-text-muted)',
                    fontWeight: 600,
                  }}>
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════ MODE TABS ══════════════ */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '12px',
        }}>
          <button
            onClick={() => setActiveTab('analyze')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: activeTab === 'analyze' ? '1px solid rgba(0,212,255,0.4)' : '1px solid transparent',
              background: activeTab === 'analyze' ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'analyze' ? '#00d4ff' : 'var(--color-text-secondary)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} /> Scan Medicine / Supplement
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: activeTab === 'chat' ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              background: activeTab === 'chat' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'chat' ? '#a78bfa' : 'var(--color-text-secondary)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Bot size={16} /> Interactive Chat ({chatMessages.length - 1} msgs)
          </button>
        </div>

        {/* ══════════════ TAB 1: SCAN & ANALYZE ══════════════ */}
        {activeTab === 'analyze' && (
          <div style={{ display: 'grid', gridTemplateColumns: analysisResult ? '1fr 1fr' : '1fr', gap: '24px' }}>

            {/* Left: Input Card */}
            <div style={{
              background: 'rgba(19, 25, 41, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🤖</span>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700 }}>
                    Ask Clean Quest AI
                  </h2>
                </div>
                {analysisResult && (
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      clearImage();
                      setPromptText('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={12} /> New Scan
                  </button>
                )}
              </div>

              {/* Text Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                }}>
                  Medicine, Supplement, or Ingredient Name:
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ask about a medicine, supplement, ingredient, or anti-doping rule… (e.g., 'Pseudoephedrine in cold tablets' or 'Creatine Monohydrate')"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 14, 26, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00d4ff')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                />
              </div>

              {/* Demo Sample Quick Chips */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Quick Demo Scenarios (Click to test):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DEMO_SAMPLES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(sample.prompt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                        e.currentTarget.style.color = '#00d4ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      💊 {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload & Drag Drop Zone */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                }}>
                  Package Label Photo (Optional):
                </label>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      validateAndSetFile(e.target.files[0]);
                    }
                  }}
                />
                <input
                  ref={cameraInputFallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      validateAndSetFile(e.target.files[0]);
                    }
                  }}
                />

                {imagePreview ? (
                  <div style={{
                    position: 'relative',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    background: 'rgba(0, 0, 0, 0.3)',
                  }}>
                    <img
                      src={imagePreview}
                      alt="Medicine Package Preview"
                      style={{
                        width: '100%',
                        maxHeight: '260px',
                        objectFit: 'contain',
                        display: 'block',
                        background: '#070b14',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      gap: '8px',
                    }}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: 'rgba(10, 14, 26, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Replace
                      </button>
                      <button
                        onClick={clearImage}
                        style={{
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${isDragging ? '#00d4ff' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: '14px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: isDragging ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(0, 212, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: '#00d4ff',
                    }}>
                      <ImageIcon size={22} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                      Drag and drop label photo here, or
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={13} /> Scan Medicine / Supplement
                      </button>

                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: 'rgba(124, 58, 237, 0.15)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          color: '#c4b5fd',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Camera size={13} /> Take Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ef4444',
                  fontSize: '13px',
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Loading State Animation */}
              {isLoading ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(124, 58, 237, 0.08))',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid rgba(0, 212, 255, 0.2)',
                    borderTopColor: '#00d4ff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 12px',
                  }} />
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: '#00d4ff', marginBottom: '4px' }}>
                    {LOADING_STEPS[loadingStepIndex]}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Gemini Flash is analyzing label components against anti-doping criteria...
                  </span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    color: 'white',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 26px rgba(0, 212, 255, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.3)';
                  }}
                >
                  <Sparkles size={18} /> Analyze with Gemini
                </button>
              )}

              {/* Informational Micro-Footer */}
              <div style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '12px',
              }}>
                🔒 Privacy notice: Images are processed in-memory for this evaluation and not permanently stored.
              </div>
            </div>

            {/* Right: Polished Result Card */}
            {analysisResult && (
              <div style={{
                background: 'rgba(19, 25, 41, 0.9)',
                border: '1px solid rgba(0, 212, 255, 0.25)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
              }}>
                {/* Result Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      Product Identified
                    </span>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: 'white', marginTop: '2px' }}>
                      {analysisResult.productName || 'Unspecified Product'}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Strength: <strong style={{ color: 'white' }}>{analysisResult.strength || 'Not specified'}</strong> · Manufacturer: <strong style={{ color: 'white' }}>{analysisResult.manufacturer || 'Not visible'}</strong>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '50px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#00d4ff',
                  }}>
                    🤖 Clean Quest AI
                  </span>
                </div>

                {/* Status Card Banner */}
                {(() => {
                  const badge = getStatusBadge(analysisResult.antiDopingStatus);
                  const Icon = badge.icon;
                  return (
                    <div style={{
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Icon size={20} style={{ color: badge.color }} />
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, color: badge.color }}>
                          {badge.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {badge.desc}
                      </p>
                    </div>
                  );
                })()}

                {/* Active Ingredients Section */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Ingredients Detected
                  </h4>
                  {analysisResult.activeIngredients && analysisResult.activeIngredients.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {analysisResult.activeIngredients.map((ing, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(0, 212, 255, 0.08)',
                            border: '1px solid rgba(0, 212, 255, 0.2)',
                            color: '#00d4ff',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          • {ing}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No specific active ingredients could be parsed from the provided input.
                    </div>
                  )}
                </div>

                {/* Potential Concerns Section */}
                {analysisResult.potentialConcerns && analysisResult.potentialConcerns.length > 0 && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    padding: '14px',
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} /> Potential Concerns
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                      {analysisResult.potentialConcerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reasoning Section */}
                {analysisResult.reasoning && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Why? (Reasoning)
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>
                      {analysisResult.reasoning}
                    </p>
                  </div>
                )}

                {/* Uncertainties Section */}
                {analysisResult.uncertainties && analysisResult.uncertainties.length > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                  }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Uncertainties / Verification Notes
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {analysisResult.uncertainties.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Step Section */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(124, 58, 237, 0.08))',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#00d4ff', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Recommended Next Step
                  </h4>
                  <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                    {analysisResult.recommendedNextStep}
                  </p>
                  <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                      background: 'rgba(0, 212, 255, 0.15)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      color: '#00d4ff',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Ask follow-up question in Chat <ArrowRight size={12} />
                  </button>
                </div>

                {/* Authoritative Disclaimer */}
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '12px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
                  <span>
                    <strong>Mandatory Notice:</strong> AI-assisted assessment — verify with an authoritative anti-doping medication resource (e.g. Global DRO, WADA Prohibited List, or your National Anti-Doping Organisation). Clean Quest AI does not provide medical prescriptions or guaranteed safety clearance.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB 2: CHAT MODE ══════════════ */}
        {activeTab === 'chat' && (
          <div style={{
            background: 'rgba(19, 25, 41, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            height: '650px',
          }}>
            {/* Chat Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '14px',
              marginBottom: '16px',
            }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  💬 Clean Quest AI Conversation
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {analysisResult
                    ? `Discussing: ${analysisResult.productName}`
                    : 'Ask about medicines, supplements, or anti-doping regulations'}
                </span>
              </div>
              <button
                onClick={handleResetConversation}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={12} /> New Conversation
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      gap: '10px',
                    }}
                  >
                    {!isUser && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.3))',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00d4ff',
                        flexShrink: 0,
                      }}>
                        <Bot size={16} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%',
                      background: isUser
                        ? 'linear-gradient(135deg, #00d4ff, #0284c7)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '12px 16px',
                      color: isUser ? 'white' : 'var(--color-text-primary)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      boxShadow: isUser ? '0 4px 14px rgba(0, 212, 255, 0.25)' : 'none',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00d4ff',
                  }}>
                    <Bot size={16} />
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                  }}>
                    Clean Quest AI is drafting a response...
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggested Follow-Up Prompts */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '10px',
            }}>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(q);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00d4ff';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  💡 {q}
                </button>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Clean Quest AI a question about medicine, ingredients, or anti-doping…"
                style={{
                  flex: 1,
                  background: 'rgba(10, 14, 26, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '0 20px',
                  cursor: !chatInput.trim() || isChatLoading ? 'not-allowed' : 'pointer',
                  opacity: !chatInput.trim() || isChatLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        )}

        {/* ══════════════ CAMERA MODAL ══════════════ */}
        {cameraActive && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18} style={{ color: '#00d4ff' }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px' }}>
                    Capture Medicine / Supplement Label
                  </span>
                </div>
                <button
                  onClick={stopCamera}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ position: 'relative', background: '#000', width: '100%', minHeight: '340px' }}>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  border: '2px dashed rgba(0, 212, 255, 0.5)',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '10px',
                }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 10px',
                    borderRadius: '50px',
                    fontSize: '11px',
                    color: '#00d4ff',
                  }}>
                    Align medicine label inside frame
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={stopCamera}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={capturePhoto}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    border: 'none',
                    color: 'white',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.35)',
                  }}
                >
                  <Camera size={16} /> Snap Photo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
