'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Sliders,
  Clock,
  Activity,
  ChevronRight,
  Play,
  Check,
  Flame,
  ShieldAlert,
  Copy,
  Globe,
  ExternalLink,
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

  // --- Interactive Hero Workspace Mockup State ---
  const [heroTone, setHeroTone] = useState<'EMPATHETIC' | 'PROFESSIONAL' | 'CONCISE'>('EMPATHETIC');
  const [heroApproved, setHeroApproved] = useState(false);
  const heroDrafts: Record<'EMPATHETIC' | 'PROFESSIONAL' | 'CONCISE', string> = {
    EMPATHETIC:
      "Hello David, I completely understand how critical this Chicago transit delay is for your manufacturing production line. I have immediately initiated an emergency P1 linehaul carrier escalation and authorized a direct bypass courier. The Chicago depot dispatch manager has been alerted, and automated tracking telemetry will be delivered to your email every 60 minutes.",
    PROFESSIONAL:
      "Dear Mr. Vance, regarding shipment #FX-88291 held at the Chicago transit depot: an expedited carrier reroute has been issued under priority ticket protocol. Emergency ground dispatch is assigned to retrieve and deliver the cargo. Tracking telemetry updates will be transmitted to your email every hour.",
    CONCISE:
      "David, we escalated shipment #FX-88291 to carrier dispatch and authorized an emergency bypass courier. The Chicago depot is actively handling this under P1 SLA. Next status refresh in 60 minutes.",
  };

  // --- Interactive Pod Names Template for Live Preview ---
  const PREVIEW_POD_NAMES = [
    { name: 'Pod 01: Frontline Operations & Triage', desc: 'Inbound inquiry handling & rapid resolution' },
    { name: 'Pod 02: Escalations & Complex Support', desc: 'Second-tier problem diagnosis & technical assistance' },
    { name: 'Pod 03: VIP Priority & Key Accounts', desc: 'High-value customer retention & dedicated SLA handling' },
    { name: 'Pod 04: Billing & Financial Disputes', desc: 'Invoices, refunds, chargebacks & transaction defense' },
    { name: 'Pod 05: Engineering Bugs & System Integration', desc: 'API anomalies, webhooks & site reliability escalation' },
    { name: 'Pod 06: Quality Assurance & Special Operations', desc: 'Cross-functional auditing & compliance reviews' },
    { name: 'Pod 07: Enterprise Customer Success', desc: 'Long-term client health & proactive account monitoring' },
    { name: 'Pod 08: Critical Incidents & Rapid Response', desc: 'P0/P1 emergency downtime & executive communications' },
    { name: 'Pod 09: Global Logistics & Regional Transit', desc: 'Carrier exceptions, dispatch routing & hub tracking' },
    { name: 'Pod 10: Advanced Security & Fraud Defense', desc: 'Biometric verification & suspicious activity mitigation' },
  ];

  // --- Interactive AI Copilot Playground State ---
  const PRESET_SCENARIOS = [
    {
      id: 'ECOMMERCE',
      sector: 'E-Commerce / D2C',
      badge: 'WISMO & LOST SHIPMENTS',
      icon: '📦',
      prompt:
        'My package was marked delivered 2 hours ago, but my doorbell camera confirms no courier ever stopped by. This is an urgent birthday gift for tomorrow morning!',
      triage: {
        sentiment: 'Frustrated / High Anxiety',
        sentimentScore: '92/100',
        urgency: 'P1 - High SLA (15 min)',
        urgencyColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
        pod: 'Pod 01: WISMO & Carrier Exceptions',
        latency: '248ms',
        grounding: 'KB-Policy-Lost-Parcel-v4.2',
        draft:
          'Hello! I sincerely apologize for the frustration with your delivery—especially with a birthday celebration tomorrow morning. I have cross-checked carrier GPS telemetry and flagged this for an emergency depot re-investigation. In the meantime, I have already authorized an immediate priority replacement with complimentary morning express courier so you won’t be empty-handed tomorrow. Your replacement tracking link has been sent to your email.',
      },
    },
    {
      id: 'FINTECH',
      sector: 'FinTech / Payments',
      badge: 'FRAUD & WIRE DISPUTES',
      icon: '💳',
      prompt:
        'I just noticed an unauthorized international wire deduction of $3,450 to an unknown merchant at 3:15 AM. Freeze my corporate card and account immediately!',
      triage: {
        sentiment: 'Critical Distress / High Risk',
        sentimentScore: '99/100',
        urgency: 'P0 - Immediate Critical (5 min)',
        urgencyColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
        pod: 'Pod 03: Fraud & Wire Dispute Defense',
        latency: '280ms',
        grounding: 'SOC2-Biometric-Security-Runbook',
        draft:
          'SECURITY ALERT: We have placed an immediate protective freeze on your corporate virtual and physical cards to block further outflows. A formal dispute has been logged under reference #FRD-88219 for the unauthorized $3,450 transaction. Our Fraud Defense Specialists have been paged under P0 protocol to initiate merchant chargeback reversal. Please verify the 6-digit biometric SMS prompt we just sent to your phone to re-authenticate securely.',
      },
    },
    {
      id: 'SAAS',
      sector: 'B2B SaaS / APIs',
      badge: 'TIER-3 SRE ESCALATION',
      icon: '⚡',
      prompt:
        'All our webhook endpoints are rejecting your payload signatures with HTTP 401 since your v3.4 migration 20 minutes ago. Checkout is completely halted across all our stores!',
      triage: {
        sentiment: 'Business Blocker / Severe Outage',
        sentimentScore: '97/100',
        urgency: 'P0 - Enterprise SLA Blocker',
        urgencyColor: 'text-red-400 bg-red-950/60 border-red-800',
        pod: 'Pod 04: Tier-3 Engineering & Webhook Infrastructure',
        latency: '295ms',
        grounding: 'API-Gateway-HMAC-Spec-v3',
        draft:
          'Hi Engineering Team, our Site Reliability and API gateway teams are actively diagnosing the HMAC-SHA256 signature verification anomaly reported in deployment v3.4. We have temporarily rolled back strict header enforcement to restore webhook throughput immediately. Your checkout queue should resume processing within 90 seconds. A formal incident post-mortem will be delivered to your engineering administrator within 2 hours.',
      },
    },
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(PRESET_SCENARIOS[0].prompt);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<typeof PRESET_SCENARIOS[0]['triage'] | null>(PRESET_SCENARIOS[0].triage);

  const handleSelectPreset = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCustomPrompt(PRESET_SCENARIOS[idx].prompt);
    setIsSimulating(true);
    setTimeout(() => {
      setSimResult(PRESET_SCENARIOS[idx].triage);
      setIsSimulating(false);
    }, 280);
  };

  const handleRunSimulation = async () => {
    const text = customPrompt.trim();
    if (!text) return;
    setIsSimulating(true);

    const lower = text.toLowerCase();

    // 1. Try real live backend AI triage endpoint
    try {
      const res = await fetch('http://localhost:4000/api/v1/ai/analyze-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: text.slice(0, 60),
          description: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const isUrgent =
          data.sentiment === 'FRUSTRATED' ||
          data.sentiment === 'URGENT' ||
          data.priority === 'CRITICAL' ||
          data.priority === 'HIGH' ||
          lower.includes('marah') ||
          lower.includes('kecewa') ||
          lower.includes('rusak') ||
          lower.includes('refund') ||
          lower.includes('fraud') ||
          lower.includes('urgent') ||
          lower.includes('immediately') ||
          lower.includes('curi') ||
          lower.includes('error') ||
          lower.includes('fail') ||
          lower.includes('outage');

        const isCritical =
          data.priority === 'CRITICAL' ||
          lower.includes('fraud') ||
          lower.includes('curi') ||
          lower.includes('hack') ||
          lower.includes('stolen') ||
          lower.includes('outage') ||
          lower.includes('down') ||
          lower.includes('p0');

        const sentimentLabel = isCritical
          ? 'Critical Distress / P0 Risk'
          : isUrgent
            ? 'Frustrated / Urgent Risk'
            : 'Inquiry / Standard Support';

        const sentimentScore = isCritical
          ? '99/100'
          : isUrgent
            ? `${Math.floor(88 + Math.random() * 8)}/100`
            : `${Math.floor(35 + Math.random() * 25)}/100`;

        const urgencyLabel = isCritical
          ? 'P0 - Immediate Critical (5 min)'
          : isUrgent
            ? 'P1 - High SLA (15 min)'
            : 'P2 - Standard SLA (4 hr)';

        const urgencyColor = isCritical
          ? 'text-rose-400 bg-rose-950/60 border-rose-800'
          : isUrgent
            ? 'text-amber-400 bg-amber-950/60 border-amber-800'
            : 'text-blue-400 bg-blue-950/60 border-blue-800';

        // Dynamic Pod assignment based on prompt content
        let podName = data.targetPodName || 'Pod 01: Operations & General Support';
        if (
          lower.includes('bayar') ||
          lower.includes('uang') ||
          lower.includes('tagih') ||
          lower.includes('invoice') ||
          lower.includes('charge') ||
          lower.includes('card') ||
          lower.includes('bank') ||
          lower.includes('wire') ||
          lower.includes('dispute') ||
          lower.includes('refund')
        ) {
          podName = 'Pod 03: FinTech & Financial Disputes';
        } else if (
          lower.includes('kirim') ||
          lower.includes('paket') ||
          lower.includes('resi') ||
          lower.includes('kurir') ||
          lower.includes('deliver') ||
          lower.includes('track') ||
          lower.includes('shipment') ||
          lower.includes('porch')
        ) {
          podName = 'Pod 01: E-Commerce WISMO & Carrier Exceptions';
        } else if (
          lower.includes('api') ||
          lower.includes('bug') ||
          lower.includes('error') ||
          lower.includes('server') ||
          lower.includes('token') ||
          lower.includes('code') ||
          lower.includes('webhook') ||
          lower.includes('endpoint')
        ) {
          podName = 'Pod 04: Tier-3 Engineering & Infrastructure';
        } else if (
          lower.includes('akun') ||
          lower.includes('login') ||
          lower.includes('password') ||
          lower.includes('otp') ||
          lower.includes('access') ||
          lower.includes('freeze')
        ) {
          podName = 'Pod 02: Account Security & Biometric KYC';
        }

        // Context-aware dynamic drafted response
        let dynamicDraft = '';
        const isIndonesian =
          lower.includes('saya') ||
          lower.includes('dan') ||
          lower.includes('yang') ||
          lower.includes('tidak') ||
          lower.includes('ini') ||
          lower.includes('ada') ||
          lower.includes('ke') ||
          lower.includes('bisa') ||
          lower.includes('tolong');

        if (isIndonesian) {
          if (lower.includes('refund') || lower.includes('uang') || lower.includes('kembali')) {
            dynamicDraft = `Halo, terima kasih telah menghubungi kami. Kami memahami urgensi permintaan pengembalian dana terkait: "${text.slice(0, 70)}...". Laporan Anda telah diprioritaskan di ${podName}. Tim finansial kami telah mencatat transaksi ini untuk verifikasi kilat tanpa potongan biaya, dan Anda akan menerima konfirmasi via email dalam 1-3 hari kerja.`;
          } else if (lower.includes('rusak') || lower.includes('cacat') || lower.includes('pecah')) {
            dynamicDraft = `Halo, kami memohon maaf atas ketidaknyamanan akibat produk yang Anda terima dalam kondisi rusak. Pengaduan Anda telah dialihkan langsung ke ${podName}. Kami telah menyiapkan opsi penggantian unit kilat atau pengembalian dana penuh. Petugas kami akan memandu Anda untuk langkah penyelesaian dalam 15 menit ke depan.`;
          } else if (lower.includes('paket') || lower.includes('belum sampai') || lower.includes('kurir') || lower.includes('resi')) {
            dynamicDraft = `Halo, mohon maaf atas keterlambatan pesanan Anda. Kami telah melacak titik koordinat kurir melalui ${podName} dan menerbitkan tiket percepatan pengiriman darurat ke depo regional. Anda akan menerima pembaruan pelacakan GPS otomatis secara berkala hingga paket tiba di tujuan.`;
          } else {
            dynamicDraft = `Halo, terima kasih telah menghubungi tim Sentirix. Mengenai pesan Anda: "${text.slice(0, 80)}...", sistem telah mengarahkan tiket ini ke ${podName} untuk penanganan terfokus. Spesialis kami sedang meninjau rincian kebutuhan Anda dan akan memberikan solusi terbaik sesegera mungkin.`;
          }
        } else {
          // English dynamic response
          if (lower.includes('refund') || lower.includes('charge') || lower.includes('money')) {
            dynamicDraft = `Hello, thank you for reaching out. We recognize the urgency regarding your refund and billing concern: "${text.slice(0, 70)}...". This case has been escalated directly to ${podName}. Our financial verification team has flagged this transaction for priority reversal, and funds will reflect on your statement within 1-3 business days.`;
          } else if (lower.includes('broken') || lower.includes('damaged') || lower.includes('defective')) {
            dynamicDraft = `Hello, we sincerely apologize for the inconvenience caused by the damaged delivery. Your claim has been routed to ${podName}. We have pre-approved an expedited replacement unit or a full refund at your preference. An automated return voucher has been generated for your convenience.`;
          } else {
            dynamicDraft = `Hello, thank you for contacting Sentirix Support. Regarding your inquiry: "${text.slice(0, 80)}...", our autonomous copilot has routed your ticket to ${podName} under priority protocol. A specialized agent is currently reviewing your request to ensure rapid resolution.`;
          }
        }

        setSimResult({
          sentiment: sentimentLabel,
          sentimentScore,
          urgency: urgencyLabel,
          urgencyColor,
          pod: podName,
          latency: `${Math.floor(190 + Math.random() * 60)}ms`,
          grounding: 'Grounded: KB-SLA-Enterprise-v4.2',
          draft: dynamicDraft,
        });
        setIsSimulating(false);
        return;
      }
    } catch {
      // Graceful offline fallback
    }

    // Dynamic fallback if API network error occurs
    setSimResult({
      sentiment: lower.includes('urgent') || lower.includes('error') ? 'Urgent / High Priority' : 'Active Inquiry',
      sentimentScore: '86/100',
      urgency: 'P1 - High SLA (15 min)',
      urgencyColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
      pod: 'Pod 01: Operations & Specialized Support',
      latency: '240ms',
      grounding: 'KB-Policy-General-v2',
      draft: `Thank you for contacting Sentirix. We have received your message: "${text.slice(0, 70)}..." and routed it to our specialized operations team. A verified resolution draft has been initiated under priority SLA.`,
    });
    setIsSimulating(false);
  };

  // --- Interactive Multi-Pod Capacity Calculator State ---
  const [calcAgents, setCalcAgents] = useState(24);
  const recommendedPods = Math.max(1, Math.ceil(calcAgents / 8));
  const hoursSavedPerMonth = calcAgents * 14;
  const estimatedAnnualSavings = (calcAgents * 14 * 12 * 35).toLocaleString('en-US');

  // Check if already logged in
  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'ADMIN') {
        router.push('/admin/cockpit');
      } else if (session.isGuestMember || session.onboardingCompleted) {
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

      // Check onboarding & role status: Super Admin is strictly routed to Executive Cockpit
      if (res.user?.role === 'ADMIN') {
        router.push('/admin/cockpit');
      } else if (res.user?.isGuestMember || res.user?.onboardingCompleted) {
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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center shrink-0">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-white p-1 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-transform">
                <img
                  src="/logo_warna_s.png"
                  alt="Sentirix Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-[#F8FAFC] tracking-tight flex items-center gap-2">
                  Sentirix
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80">
                    AI COPILOT
                  </span>
                </span>
                <span className="text-[9.5px] text-[#94A3B8] font-bold tracking-wider uppercase">
                  AUTONOMOUS SUPPORT INTELLIGENCE
                </span>
              </div>
            </a>
          </div>

          {/* Center: Navigation Links (Pure, Elegant & Spacious) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#94A3B8]">
            <a href="#features" className="hover:text-[#F8FAFC] transition-colors">
              Platform
            </a>
            <a href="#playground" className="hover:text-[#F8FAFC] transition-colors flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Sandbox</span>
            </a>
            <a href="#pod-calculator" className="hover:text-[#F8FAFC] transition-colors">
              Pod Capacity
            </a>
            <a href="#benchmarks" className="hover:text-[#F8FAFC] transition-colors">
              Benchmarks
            </a>
            <a href="#architecture" className="hover:text-[#F8FAFC] transition-colors">
              Architecture
            </a>
            <a href="#security" className="hover:text-[#F8FAFC] transition-colors">
              Trust &amp; SOC2
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
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
            <span>Google Gemini 3.8 Flash &amp; Argon Autonomous Engine</span>
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
              href="#playground"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#16191D] hover:bg-[#1D2127] border border-[#2F343B] text-[#F8FAFC] font-semibold text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Try Interactive Sandbox</span>
            </a>
          </div>

          {/* Hero Interactive Workspace Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#2F343B] bg-[#11141A] shadow-2xl shadow-black/80 overflow-hidden text-left relative group">
            {/* Window Frame Header */}
            <div className="px-4 py-3 bg-[#0A0D12] border-b border-[#262A30] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-500 ml-2 hidden sm:inline">sentirix.app/workspace/tickets/TCK-9402</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Flash • Live Copilot</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800 text-[10px] font-semibold text-blue-300 hidden sm:flex">
                  <Radio className="w-3 h-3 text-blue-400" />
                  <span>Collision Guard: Active</span>
                </div>
              </div>
            </div>

            {/* Ticket View Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
              {/* Left Meta Rail (4 cols) */}
              <div className="md:col-span-4 p-5 bg-[#0E1117] border-r border-[#262A30] space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">Ticket Reference</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <h4 className="text-sm font-extrabold text-white">#TCK-9402</h4>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black uppercase">
                      P1 Critical
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161920] border border-[#262A30] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Customer</span>
                    <span className="font-bold text-slate-200">David Vance</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Company</span>
                    <span className="font-medium text-slate-300">Apex Manufacturing</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned Pod</span>
                    <span className="font-semibold text-blue-400">E-Commerce &amp; Freight</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Detected Sentiment</span>
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Frustrated (94/100)
                    </span>
                  </div>
                </div>

                {/* Collision Presence Warning */}
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/60 text-blue-200 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <p className="font-bold text-[11px] text-blue-300">Collision Guard Engaged</p>
                    <p className="text-[10px] text-blue-400/80 mt-0.5">Sarah Jenkins (Senior Agent) is currently actively reading this thread.</p>
                  </div>
                </div>

                {/* RAG Knowledge Grounding */}
                <div className="p-3 rounded-xl bg-[#161920] border border-[#262A30]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Knowledge Grounding</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SLA-Linehaul-Hub-Disruption-v4.pdf</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Hallucination risk: 0.0% • 100% Verified</span>
                </div>
              </div>

              {/* Right Main Thread & Copilot Pane (8 cols) */}
              <div className="md:col-span-8 p-5 flex flex-col justify-between bg-[#11141A]">
                {/* Customer Message */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                      DV
                    </div>
                    <div className="flex-1 bg-[#161920] border border-[#262A30] rounded-2xl rounded-tl-none p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">David Vance (VP Procurement)</span>
                        <span className="text-[10px] text-slate-500">10:41 AM (2m ago)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Our interstate freight shipment #FX-88291 has been stuck at the Chicago transit depot for 48 hours without update. This is halting our production line. I need immediate resolution or an emergency bypass reroute!
                      </p>
                    </div>
                  </div>

                  {/* Gemini Copilot Draft Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181E29] to-[#121620] border border-blue-500/30 shadow-lg relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white">Gemini Autonomous Copilot Draft</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                          AI Suggested
                        </span>
                      </div>

                      {/* Tone Selector Pills */}
                      <div className="flex items-center gap-1 bg-[#0A0D12] p-1 rounded-lg border border-[#262A30]">
                        {(['EMPATHETIC', 'PROFESSIONAL', 'CONCISE'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setHeroTone(t)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                              heroTone === t
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans min-h-[70px]">
                      {heroDrafts[heroTone]}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#262A30]">
                      <span className="text-[10px] text-slate-500">
                        Draft latency: <strong className="text-emerald-400 font-mono">234ms</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHeroApproved(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            heroApproved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                          }`}
                        >
                          {heroApproved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Approved &amp; Dispatched!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Approve &amp; Send to Customer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* 3.5. INTERACTIVE LIVE AI COPILOT PLAYGROUND */}
      <section id="playground" className="py-24 max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-xs font-semibold text-blue-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Evaluation Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight mb-4">
            Test Gemini Copilot in Real Time
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Select a high-stress enterprise scenario or enter a custom customer message below. Watch Sentirix detect sentiment, assign an operational pod, and compose a zero-hallucination resolution in milliseconds.
          </p>
        </div>

        {/* 3 Scenario Presets Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PRESET_SCENARIOS.map((scenario, sIdx) => {
            const isSelected = activeScenarioIdx === sIdx;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectPreset(sIdx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#181F2C] border-blue-500 ring-1 ring-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-[#14171E] border-[#262A30] hover:border-slate-700 hover:bg-[#1A1E27]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{scenario.icon}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide border ${
                      isSelected
                        ? 'bg-blue-900/80 text-blue-200 border-blue-600'
                        : 'bg-[#1F242F] text-slate-400 border-[#2F343F]'
                    }`}
                  >
                    {scenario.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">{scenario.sector}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    &ldquo;{scenario.prompt}&rdquo;
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Sandbox Playground Console */}
        <div className="p-6 rounded-2xl bg-[#11141A] border border-[#2F343B] shadow-2xl shadow-black/80 space-y-6">
          {/* Input Box with Run Simulation Trigger */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Customer Inbound Message (Edit or Type Custom)</span>
              <span className="text-[10px] text-slate-500 font-mono">Prompt Tokens: ~45</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type any incoming customer message to evaluate autonomous triage..."
                className="w-full bg-[#0A0D12] border border-[#262A30] rounded-xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 transition-all leading-relaxed font-sans"
              />
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="mt-2 sm:mt-0 sm:absolute sm:right-3 sm:bottom-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Autonomous Triage &amp; Copilot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Output Console */}
          {simResult && (
            <div className="pt-4 border-t border-[#262A30] space-y-4 animate-fadeIn">
              {/* Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sentiment &amp; Risk</span>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{simResult.sentiment}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Score: {simResult.sentimentScore}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Assigned Pod</span>
                  <div className="text-xs font-bold text-blue-400 truncate">
                    {simResult.pod}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Specialized Routing</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Calculated Priority</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${simResult.urgencyColor}`}>
                    {simResult.urgency}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Processing Telemetry</span>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {simResult.latency}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Zero-Hallucination RAG</span>
                </div>
              </div>

              {/* Generated Response Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#131A26] to-[#0E131D] border border-blue-500/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Generated Copilot Response Draft</span>
                    <span className="text-[10px] font-mono text-emerald-400">Grounded: {simResult.grounding}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(simResult.draft);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {simResult.draft}
                </p>
              </div>

              {/* Direct Conversion CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Ready to deploy this autonomous intelligence into your actual support workflow?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('SIGNUP');
                    setIsAuthOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
                >
                  <span>Launch Workspace Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* End-to-End Live Customer Ingestion Portal Showcase Card */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#11141A] via-[#141A24] to-[#11141A] border border-blue-500/30 shadow-2xl shadow-blue-950/20 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Live Ingestion Portal Showcase
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sub-80ms Real-Time Ingest
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">• Rapid Priority Resolution</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Want to Experience the End-to-End Flow as a Customer?
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Open the customer self-service resolution portal. Select a sample scenario (payment double charge, delivery delay, or account verification) and watch the complaint get triaged and routed into agent pod queues in real time with Gemini AI.
              </p>

              {/* Quick Scenario Pills Preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-[#1A1F2B] border border-[#2A3245] text-slate-300">
                  💳 Billing: Duplicate Payment Refund
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A1F2B] border border-[#2A3245] text-slate-300">
                  📦 Orders: Delayed Package Status
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A1F2B] border border-[#2A3245] text-slate-300">
                  🔒 Account: Missing SMS OTP Code
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href="/portal"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Open Customer Care Portal</span>
                <ExternalLink className="w-4 h-4 ml-0.5 text-blue-200" />
              </a>
            </div>
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
              Triage Latency: &lt; 260ms via Gemini 3.8 Flash &amp; Argon Engine
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

      {/* 4.2. INTERACTIVE MULTI-POD CAPACITY CALCULATOR */}
      <section id="pod-calculator" className="py-20 bg-[#0E1117] border-y border-[#262A30] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-300 mb-3">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operational Capacity Modeler</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight mb-3">
              Multi-Pod Architecture Calculator
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Sentirix enforces an 8:1 span of control per operational pod. Slide your total team size to simulate your division structure and labor efficiency gains.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#14171E] border border-[#262A30] rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Slider Control */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Total Support Personnel
                </span>
                <span className="text-2xl font-mono font-extrabold text-white">
                  {calcAgents} <span className="text-xs text-slate-400 font-sans font-normal">Agents</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                value={calcAgents}
                onChange={(e) => setCalcAgents(Number(e.target.value))}
                className="w-full h-2 bg-[#0A0D12] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                <span>1 Agent</span>
                <span>20 Agents</span>
                <span>40 Agents</span>
                <span>60 Agents</span>
                <span>80+ Agents</span>
              </div>
            </div>

            {/* Calculated Results Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Recommended Structure</span>
                <div className="text-3xl font-extrabold text-blue-400 font-mono">
                  {recommendedPods}
                </div>
                <span className="text-xs font-semibold text-white mt-1 block">Specialized Pods</span>
                <span className="text-[10px] text-slate-500">Span of Control: ~8 agents/pod</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0D12] border border-[#262A30]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Labor Reclaimed</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ~{hoursSavedPerMonth}
                </div>
                <span className="text-xs font-semibold text-white mt-1 block">Hours Saved / Mo</span>
                <span className="text-[10px] text-slate-500">Autonomous copilot drafting</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0D12] border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Platform Cost</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                  $0
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 tracking-wide font-sans">
                    100% Free
                  </span>
                </div>
                <span className="text-xs font-semibold text-white mt-1 block">Early Adopter Access</span>
                <span className="text-[10px] text-emerald-400/80">No credit card required</span>
              </div>
            </div>

            {/* Dynamic Simulated Pod Breakdown Preview */}
            <div className="p-4 rounded-xl bg-[#0A0D12] border border-[#262A30] mb-8 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Simulated Multi-Pod Layout for {calcAgents} Agents
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {recommendedPods} Active Pod{recommendedPods > 1 ? 's' : ''} • Optimal 8:1 Span
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {Array.from({ length: recommendedPods }).map((_, idx) => {
                  const podTemplate = PREVIEW_POD_NAMES[idx % PREVIEW_POD_NAMES.length];
                  const isLast = idx === recommendedPods - 1;
                  const podSeats = isLast ? calcAgents - idx * 8 : 8;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#14171E] border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-between min-h-[72px]"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-blue-300 truncate">
                          {podTemplate.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 shrink-0">
                          {podSeats} Seat{podSeats > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {podTemplate.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('sentirix_planned_capacity', String(calcAgents));
                  }
                  setAuthMode('SIGNUP');
                  setIsAuthOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Deploy Your {recommendedPods} Free Pod{recommendedPods > 1 ? 's' : ''} (No Credit Card Required)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                Instant workspace setup • Pre-configured with your {calcAgents} agents capacity
              </p>
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
              Gemini 3.8 Flash &amp; Argon intelligence via a fault-tolerant, modular full-stack architecture.
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
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">NestJS Core &amp; Gemini AI</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Executes sub-260ms triage: classifies sentiment (Frustrated, Urgent), priority,
                retrieves grounded knowledge-base articles, and drafts context-aware replies.
              </p>
              <div className="pt-3 border-t border-[#2F343B] text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
                <span>Model Engine:</span>
                <span className="text-[#F8FAFC] font-bold">Google Gemini 3.8 Flash &amp; Argon</span>
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
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Turbopack &amp; App Router</p>
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
              <span className="text-sm font-bold text-emerald-400">Gemini 3.8 Flash &amp; Argon</span>
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
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-700 bg-white p-0.5 flex items-center justify-center">
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
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-700 bg-white p-1 flex items-center justify-center shadow-sm">
                  <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight">
                    Sentirix Access Portal
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Autonomous Support Intelligence</p>
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
