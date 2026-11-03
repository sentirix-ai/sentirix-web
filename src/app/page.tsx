'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Crown,
  Layers,
  BarChart3,
  MessageSquare,
  Radio,
  FileCheck2,
  X,
  Send,
  HelpCircle,
  Cpu,
  Database,
  Server,
  Workflow,
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  validateUsername,
  validatePassword,
  validateEmail,
  validatePhone,
  getSession,
  UserSession,
} from '../lib/auth';

export default function LandingPage() {
  const router = useRouter();

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loginRole, setLoginRole] = useState<'USER' | 'ADMIN'>('USER');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup Form States
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Signup Verification Dialog / Success Prompt
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [createdUsernameNotice, setCreatedUsernameNotice] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'ADMIN' || session.isGuestMember || session.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [router]);

  // Ensure authentication modal is strictly closed on page load and clear any residual query strings
  useEffect(() => {
    setIsAuthOpen(false);
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Password validation breakdown for real-time feedback
  const pwdValidation = validatePassword(signupPassword);
  const usernameValidation = validateUsername(signupUsername);

  // Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter both your identifier and password.');
      return;
    }

    try {
      setIsLoggingIn(true);
      const res = await loginUser(loginIdentifier, loginPassword, loginRole);

      if (!res.success) {
        setLoginError(res.error || 'Invalid credentials.');
        return;
      }

      // Check onboarding status
      if (res.user?.role === 'ADMIN' || res.user?.isGuestMember || res.user?.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign Up Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupUsername.trim()) {
      setSignupError('Username is required.');
      return;
    }

    if (/\s/.test(signupUsername)) {
      setSignupError('Username must not contain any spaces.');
      return;
    }

    if (signupUsername.length > 20) {
      setSignupError('Username cannot exceed 20 characters.');
      return;
    }

    if (!validateEmail(signupEmail)) {
      setSignupError('Please provide a valid active work email.');
      return;
    }

    if (!signupPhone.trim() || signupPhone.length < 7) {
      setSignupError('Please enter an active phone number.');
      return;
    }

    if (!pwdValidation.isValid) {
      setSignupError(pwdValidation.error || 'Password does not meet enterprise security requirements.');
      return;
    }

    try {
      setIsSigningUp(true);
      const res = await registerUser({
        username: signupUsername,
        email: signupEmail,
        phone: signupPhone,
        verificationMethod,
        password: signupPassword,
      });

      if (!res.success) {
        setSignupError(res.error || 'Registration failed.');
        return;
      }

      // Direct user immediately to team capacity setup interface (1 - 8 members)
      router.push('/onboarding');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Transition from Verification Notice to Login screen (Criterion 6)
  const handleProceedToLogin = () => {
    setShowVerificationNotice(false);
    setAuthMode('LOGIN');
    setLoginRole('USER');
    setLoginIdentifier(createdUsernameNotice || signupEmail);
    setLoginPassword('');
    setSuccessBanner(
      `Account verified! Welcome aboard, @${createdUsernameNotice}. Please sign in with your password below to launch your workspace.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F8FAFC] font-sans selection:bg-[#262A30] selection:text-[#F8FAFC]">
      {/* 1. TOP CORPORATE NAVIGATION BAR */}
      <header className="border-b border-[#262A30]/80 bg-[#0D0F12]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#262A30] bg-[#0e183c] flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-transform">
                <img
                  src="/logo_warna_s.png"
                  alt="Sentirix Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-[#F8FAFC] tracking-tight flex items-center gap-2">
                  Sentirix
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A1E24] text-[#CBD5E1] border border-[#2F343B]">
                    Enterprise
                  </span>
                </span>
                <span className="text-[11px] text-[#94A3B8] -mt-1 font-medium">
                  Autonomous Support & Copilot
                </span>
              </div>
            </a>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#94A3B8] absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="hover:text-[#F8FAFC] transition-colors">
              Platform
            </a>
            <a href="#benchmarks" className="hover:text-[#F8FAFC] transition-colors">
              Benchmarks
            </a>
            <a href="#architecture" className="hover:text-[#F8FAFC] transition-colors">
              Architecture
            </a>
            <a href="#security" className="hover:text-[#F8FAFC] transition-colors">
              Enterprise Trust
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthMode('LOGIN');
                setLoginRole('USER');
                setLoginIdentifier('');
                setLoginPassword('');
                setLoginError(null);
                setSuccessBanner(null);
                setIsAuthOpen(true);
              }}
              className="text-sm font-semibold text-[#94A3B8] hover:text-[#F8FAFC] px-4 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                setAuthMode('SIGNUP');
                setIsAuthOpen(true);
              }}
              className="bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0D0F12] font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-black/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Cyber Titanium Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-slate-500/10 via-zinc-400/10 to-slate-300/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16191D] border border-[#2F343B] text-xs font-semibold text-[#CBD5E1] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini 2.5 Flash Autonomous Copilot</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.1] mb-6">
            Autonomous Triage & Real-Time Copilot for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F8FAFC] via-[#CBD5E1] to-[#94A3B8]">
              High-Velocity Support Teams
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-[#94A3B8] leading-relaxed font-normal mb-10">
            Transform high-volume inbound complaints into immediate, zero-hallucination
            resolutions. Sentirix pairs advanced generative reasoning with real-time collision
            guards to deflect repetitive tickets and empower human agents to resolve issues 4.2x
            faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setAuthMode('SIGNUP');
                setIsAuthOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0D0F12] font-black text-base shadow-xl shadow-black/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Deploy Sentirix Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#16191D] hover:bg-[#1D2127] border border-[#2F343B] text-[#F8FAFC] font-semibold text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Explore Architecture</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. RESEARCH-BACKED METRICS */}
      <section id="benchmarks" className="py-16 bg-[#111317] border-y border-[#262A30]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] mb-2 font-mono">
              68.4%
            </div>
            <div className="text-sm font-bold text-[#CBD5E1] mb-1">
              First-Contact Resolution (FCR)
            </div>
            <p className="text-xs text-[#64748B]">
              Resolved in first interaction without tier-2 engineering escalation.
            </p>
          </div>

          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] mb-2 font-mono">
              4.2x
            </div>
            <div className="text-sm font-bold text-[#CBD5E1] mb-1">Faster Mean Time to Resolve</div>
            <p className="text-xs text-[#64748B]">
              Average response drafting reduced from 8.5 minutes to 45 seconds.
            </p>
          </div>

          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] mb-2 font-mono">
              99.8%
            </div>
            <div className="text-sm font-bold text-emerald-400 mb-1">
              Grounded Citation Accuracy
            </div>
            <p className="text-xs text-[#64748B]">
              Strict knowledge-base RAG grounding mitigates LLM hallucinations.
            </p>
          </div>

          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] mb-2 font-mono">
              $1.4M
            </div>
            <div className="text-sm font-bold text-[#CBD5E1] mb-1">Annual Labor Efficiency</div>
            <p className="text-xs text-[#64748B]">
              Measured savings for a standard 100-agent omnichannel customer team.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM ARCHITECTURE & FEATURES SHOWCASE */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Core Enterprise Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Designed for Precision, Built for Scale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-8 hover:border-[#3F444D] hover:bg-[#1A1E24] transition-all shadow-lg shadow-black/20 group">
            <div className="w-12 h-12 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-6 group-hover:border-[#4B525D] transition-colors">
              <Zap className="w-6 h-6 text-[#CBD5E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">
              Zero-Latency Inbound Sentiment Triage
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              Instantly assesses customer sentiment and assigns deterministic urgency tiers
              (Critical, High, Medium, Low) before an agent even opens the ticket. Prevents churn by
              prioritizing frustrated enterprise buyers.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Triage Latency: &lt; 380ms via Gemini 2.5 Flash
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-8 hover:border-[#3F444D] hover:bg-[#1A1E24] transition-all shadow-lg shadow-black/20 group">
            <div className="w-12 h-12 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-6 group-hover:border-[#4B525D] transition-colors">
              <Bot className="w-6 h-6 text-[#CBD5E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">
              Fin-Inspired One-Click Copilot Drafter
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              Synthesizes complete conversation threads and company knowledge articles to generate
              ready-to-send responses in one click. Support agents switch between Empathetic,
              Professional, and Concise tones on demand.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dynamic Tone Tuning & Thread Summarization
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-8 hover:border-[#3F444D] hover:bg-[#1A1E24] transition-all shadow-lg shadow-black/20 group">
            <div className="w-12 h-12 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-6 group-hover:border-[#4B525D] transition-colors">
              <Radio className="w-6 h-6 text-[#CBD5E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">
              Real-Time Agent Collision Safeguards
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              Powered by native WebSockets. If two agents open the same customer inquiry, instant
              visual warnings broadcast across screens to eliminate duplicate refunds or contradictory
              customer messages.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
              <ShieldCheck className="w-4 h-4 text-[#94A3B8]" />
              Sub-50ms Socket.io Presence Heartbeat
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-8 hover:border-[#3F444D] hover:bg-[#1A1E24] transition-all shadow-lg shadow-black/20 group">
            <div className="w-12 h-12 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-6 group-hover:border-[#4B525D] transition-colors">
              <Layers className="w-6 h-6 text-[#CBD5E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">
              Internal Notes vs. Public Reply Segregation
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              Enables engineering and support teams to discuss sensitive debugging data privately
              in-thread with distinct yellow note badging, keeping internal banter strictly shielded
              from the customer view.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
              <Lock className="w-4 h-4 text-[#94A3B8]" />
              Strict Role-Based Isolation (RBAC)
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. ENTERPRISE SYSTEM ARCHITECTURE */}
      <section id="architecture" className="py-24 bg-[#0D0F12] border-t border-[#262A30] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-slate-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 flex items-center justify-center gap-1.5">
              <Workflow className="w-3.5 h-3.5" />
              Enterprise System Topology
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight mb-4">
              Decoupled, High-Throughput Pipeline
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Sentirix bridges your existing helpdesk ecosystem (Zendesk, Intercom) with low-latency
              Gemini 2.5 Flash intelligence via a fault-tolerant, modular full-stack architecture.
            </p>
          </div>

          {/* 3-Stage Pipeline Diagram */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 relative">
            {/* Step 1 */}
            <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-6 relative group hover:border-[#3F444D] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-[#64748B] uppercase">Phase 01</span>
                <span className="text-[10px] font-bold text-[#CBD5E1] bg-[#21252C] border border-[#2F343B] px-2 py-0.5 rounded-full">
                  Multi-Source Ingestion
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Ingestion & Webhook Layer</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Receives incoming tickets and complaints from Zendesk, Intercom, or native portal via
                TLS 1.3 encrypted HTTP POST Webhooks with sub-80ms signature verification.
              </p>
              <div className="pt-3 border-t border-[#262A30] text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
                <span>Protocols:</span>
                <span className="text-[#F8FAFC]">REST • Webhooks • HTTPS</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1A1E24] border border-[#3F444D] rounded-2xl p-6 relative group shadow-xl shadow-black/40 hover:border-[#6B7280] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-[#CBD5E1] uppercase">Phase 02</span>
                <span className="text-[10px] font-bold text-[#F8FAFC] bg-[#262A30] border border-[#4B525D] px-2 py-0.5 rounded-full">
                  AI Core Reasoning
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#262A30] border border-[#4B525D] text-[#F8FAFC] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">NestJS Core & Gemini AI</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Executes sub-380ms triage: classifies sentiment (Frustrated, Urgent), priority,
                retrieves grounded knowledge-base articles, and drafts context-aware replies.
              </p>
              <div className="pt-3 border-t border-[#2F343B] text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
                <span>Model Engine:</span>
                <span className="text-[#F8FAFC] font-bold">Google Gemini 2.5 Flash</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#16191D] border border-[#262A30] rounded-2xl p-6 relative group hover:border-[#3F444D] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-[#64748B] uppercase">Phase 03</span>
                <span className="text-[10px] font-bold text-[#CBD5E1] bg-[#21252C] border border-[#2F343B] px-2 py-0.5 rounded-full">
                  Sub-50ms Real-Time
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#21252C] border border-[#2F343B] text-[#F8FAFC] flex items-center justify-center mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Real-Time Event Broadcast</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Pushes live ticket streams into the Next.js Agent Workspace via WebSockets. Emits
                collision alerts to prevent double-drafting, and syncs approved replies back to Zendesk.
              </p>
              <div className="pt-3 border-t border-[#262A30] text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
                <span>Sync Latency:</span>
                <span className="text-emerald-400 font-bold">&lt; 50ms Socket.io</span>
              </div>
            </div>
          </div>

          {/* Core Tech Stack Badges Matrix */}
          <div className="p-6 rounded-2xl bg-[#16191D] border border-[#262A30] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border-r border-[#262A30] last:border-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                Client Layer
              </span>
              <span className="text-sm font-bold text-[#F8FAFC]">Next.js 16 + React 19</span>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Turbopack & App Router</p>
            </div>
            <div className="p-3 border-r border-[#262A30] last:border-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                Service Engine
              </span>
              <span className="text-sm font-bold text-[#CBD5E1]">NestJS 12 Enterprise</span>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Modular Clean Architecture</p>
            </div>
            <div className="p-3 border-r border-[#262A30] last:border-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                Data Persistence
              </span>
              <span className="text-sm font-bold text-[#F8FAFC]">PostgreSQL + Prisma</span>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Type-Safe Relational Schema</p>
            </div>
            <div className="p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                AI Reasoning
              </span>
              <span className="text-sm font-bold text-emerald-400">Gemini 2.5 Flash</span>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Multimodal Zero-Hallucination</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ENTERPRISE TRUST & SECURITY */}
      <section id="security" className="py-20 bg-[#111317] border-t border-[#262A30]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
              Enterprise-Grade Security & Privacy by Design
            </h3>
            <p className="text-sm text-[#94A3B8] max-w-xl">
              Sentirix does not train general models on your customer conversations. All data is
              isolated per tenant with cryptographic AES-256 encryption at rest and TLS 1.3 in transit.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-[#CBD5E1]">
            <span className="px-3.5 py-2 rounded-lg bg-[#16191D] border border-[#262A30] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#94A3B8]" />
              SOC2-Ready Architecture
            </span>
            <span className="px-3.5 py-2 rounded-lg bg-[#16191D] border border-[#262A30] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              GDPR-Ready Privacy
            </span>
            <span className="px-3.5 py-2 rounded-lg bg-[#16191D] border border-[#262A30] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#CBD5E1]" />
              SHA-256 Hash Guard
            </span>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-[#262A30] bg-[#0D0F12] py-12 text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-[#262A30] bg-[#0e183c] flex items-center justify-center">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-[#CBD5E1]">Sentirix Inc.</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[#F8FAFC] transition-colors">
              Platform
            </a>
            <a href="#architecture" className="hover:text-[#F8FAFC] transition-colors">
              Architecture
            </a>
            <a href="#security" className="hover:text-[#F8FAFC] transition-colors">
              Enterprise Trust
            </a>
          </div>
        </div>

        {/* Global Regulatory & Trademark Disclaimer */}
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-[#262A30]/60 text-left text-[11px] text-[#64748B] leading-relaxed space-y-1">
          <p>
            <strong className="text-[#94A3B8]">Legal Disclaimer:</strong> Sentirix is an independent enterprise software platform. Zendesk, Intercom, and Okta are registered trademarks of their respective owners in the United States and other jurisdictions. References to third-party technologies are made solely to describe API interoperability under nominative fair use.
          </p>
          <p>
            SOC 2 and GDPR references denote architectural security alignments and privacy-by-design controls implemented within the Sentirix engineering framework, and do not represent formal certification issuances.
          </p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 7. AUTHENTICATION MODAL */}
      {/* ========================================================================= */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#16191D] border border-[#2F343B] w-full max-w-md rounded-2xl shadow-2xl shadow-black/80 overflow-hidden relative animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#21252C] transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-[#262A30] bg-[#111317]">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#262A30] bg-[#0e183c] flex items-center justify-center shadow-sm">
                  <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight">
                    Sentirix Access Portal
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Standard Corporate Identity Management</p>
                </div>
              </div>

              {/* Mode Switcher: Sign In vs Sign Up */}
              <div className="grid grid-cols-2 gap-1 bg-[#0D0F12] p-1 rounded-xl border border-[#262A30] mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setLoginError(null);
                    setSuccessBanner(null);
                  }}
                  className={`text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'bg-[#262A30] text-[#F8FAFC] shadow-sm border border-[#3F444D]'
                      : 'text-[#94A3B8] hover:text-[#CBD5E1]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('SIGNUP');
                    setSignupError(null);
                    setSuccessBanner(null);
                  }}
                  className={`text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === 'SIGNUP'
                      ? 'bg-[#262A30] text-[#F8FAFC] shadow-sm border border-[#3F444D]'
                      : 'text-[#94A3B8] hover:text-[#CBD5E1]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Success Banner if redirected from signup */}
              {successBanner && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successBanner}</span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: LOGIN FORM */}
              {/* ------------------------------------------------------------- */}
              {authMode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Field 1: Unified Username or Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Username or Work Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. sarah_ops or sarah@company.com"
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#CBD5E1]">Password</label>
                      <span className="text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] hover:underline cursor-pointer">
                        Forgot password?
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3 text-[#64748B] hover:text-[#CBD5E1] cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0D0F12] font-extrabold text-xs shadow-lg shadow-black/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-[#64748B]">
                      Need a new team account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('SIGNUP');
                          setLoginError(null);
                        }}
                        className="text-[#F8FAFC] font-bold hover:underline cursor-pointer"
                      >
                        Sign Up Now
                      </button>
                    </span>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: SIGN UP FORM */}
              {/* ------------------------------------------------------------- */}
              {authMode === 'SIGNUP' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {/* Field a: Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#CBD5E1]">
                        Username <span className="text-rose-400">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          signupUsername.length > 20 || /\s/.test(signupUsername)
                            ? 'text-rose-400 font-bold'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {signupUsername.length}/20 chars
                      </span>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={25}
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="max 20 chars, no spaces (e.g. sarah_99#)"
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] transition-all"
                      />
                    </div>
                    {/* Live space warning */}
                    {/\s/.test(signupUsername) && (
                      <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Spaces are strictly not allowed in username.
                      </p>
                    )}
                    {signupUsername.length > 20 && (
                      <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Maximum limit is 20 characters.
                      </p>
                    )}
                  </div>

                  {/* Field b: Active Work Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Active Work Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="sarah.jenkins@company.com"
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-1">
                      A verification dispatch will be sent to this email address.
                    </p>
                  </div>

                  {/* Field c: Active Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Active Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] transition-all"
                      />
                    </div>
                  </div>

                  {/* Field e: Verification Method Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Preferred Verification Channel <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('EMAIL')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          verificationMethod === 'EMAIL'
                            ? 'bg-[#262A30] border-[#4B525D] text-[#F8FAFC]'
                            : 'bg-[#0D0F12] border-[#262A30] text-[#94A3B8] hover:border-[#3F444D]'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Work Email Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationMethod('PHONE')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          verificationMethod === 'PHONE'
                            ? 'bg-[#262A30] border-[#4B525D] text-[#F8FAFC]'
                            : 'bg-[#0D0F12] border-[#262A30] text-[#94A3B8] hover:border-[#3F444D]'
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>SMS / Phone OTP</span>
                      </button>
                    </div>
                  </div>

                  {/* Field f & g: Password with validation breakdown */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Password (Encrypted) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 chars, Aa1@..."
                        className="w-full bg-[#0D0F12] border border-[#262A30] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#94A3B8] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 top-3 text-[#64748B] hover:text-[#CBD5E1] cursor-pointer"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Interactive Password Requirements Checklist */}
                    <div className="mt-2.5 p-2.5 bg-[#0D0F12] rounded-xl border border-[#262A30] text-[10px] space-y-1">
                      <div
                        className={`flex items-center gap-1.5 ${
                          pwdValidation.checks.minLength ? 'text-emerald-400' : 'text-[#64748B]'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Minimum 8 characters length</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          pwdValidation.checks.hasLower ? 'text-emerald-400' : 'text-[#64748B]'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>At least 1 lowercase letter (a-z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          pwdValidation.checks.hasUpper ? 'text-emerald-400' : 'text-[#64748B]'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>At least 1 uppercase letter (A-Z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          pwdValidation.checks.hasSpecial ? 'text-emerald-400' : 'text-[#64748B]'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>At least 1 special character (!@#$%...)</span>
                      </div>
                    </div>
                  </div>

                  {/* Signup Error Banner */}
                  {signupError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSigningUp || !pwdValidation.isValid || !usernameValidation.isValid}
                    className="w-full py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0D0F12] font-extrabold text-xs shadow-lg shadow-black/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSigningUp ? 'Encrypting & Registering...' : 'Create Account & Verify'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-xs text-[#64748B]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('LOGIN');
                          setSignupError(null);
                        }}
                        className="text-[#F8FAFC] font-bold hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. POST SIGN-UP VERIFICATION NOTIFICATION MODAL */}
      {/* ========================================================================= */}
      {showVerificationNotice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#16191D] border border-[#2F343B] w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Registration Successful!</h3>

            <p className="text-xs text-[#CBD5E1] leading-relaxed mb-4">
              Your account for <strong className="text-white">@{createdUsernameNotice}</strong> has
              been created and your password has been securely stored with SHA-256 cryptographic
              hashing.
            </p>

            <div className="p-4 bg-[#0D0F12] border border-[#262A30] rounded-xl text-left text-xs mb-6 space-y-2">
              <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
                {verificationMethod === 'EMAIL' ? (
                  <Mail className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Phone className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {verificationMethod === 'EMAIL'
                    ? 'Email Verification Sent'
                    : 'SMS / Phone OTP Dispatched'}
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                {verificationMethod === 'EMAIL'
                  ? `An activation link has been delivered to ${signupEmail}. Please click the confirmation link to complete two-factor compliance.`
                  : `A 6-digit confirmation PIN has been sent via SMS to ${signupPhone}.`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleProceedToLogin}
              className="w-full py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0D0F12] font-bold text-xs shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Return to Sign In & Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
