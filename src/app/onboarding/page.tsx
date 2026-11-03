'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Laptop,
  HeartPulse,
  Plane,
  GraduationCap,
  Building2,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Crown,
  Info,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  Check,
  Building,
} from 'lucide-react';
import { getSession, setSession, UserSession } from '../../lib/auth';
import { generatePodsForIndustry, setupMultiPod } from '../../lib/api';
import { PodConfig } from '../../lib/types';

interface IndustryOption {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const INDUSTRY_PRESETS: IndustryOption[] = [
  {
    id: 'ECOMMERCE',
    name: 'E-Commerce & Retail',
    tagline: 'Order tracking (WISMO), returns, refunds, checkout vouchers',
    icon: ShoppingCart,
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics & Couriers',
    tagline: 'Waybill & resi tracking, damaged cargo claims, dispatch, COD',
    icon: Truck,
    accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
  },
  {
    id: 'FINTECH',
    name: 'FinTech & Payments',
    tagline: 'Transaction disputes, KYC identity verify, chargeback fraud',
    icon: CreditCard,
    accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
  },
  {
    id: 'SAAS',
    name: 'B2B SaaS & Tech',
    tagline: 'REST APIs, webhooks, subscription billing, SAML/SSO SLA',
    icon: Laptop,
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare & MedTech',
    tagline: 'Doctor appointments, digital pharmacy, health insurance claims',
    icon: HeartPulse,
    accentColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
  },
  {
    id: 'TRAVEL',
    name: 'Travel & Hospitality',
    tagline: 'Flight rescheduling, hotel bookings, route disruptions, concierge',
    icon: Plane,
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'EDTECH',
    name: 'Education & EdTech',
    tagline: 'LMS classroom access, tuition fees, student counseling & tutors',
    icon: GraduationCap,
    accentColor: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/40 text-indigo-400',
  },
  {
    id: 'OTHER',
    name: 'Custom Industry / Other',
    tagline: 'AI Instant Pod Architect will adapt to your unique sector',
    icon: Building2,
    accentColor: 'from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/40 text-fuchsia-400',
  },
];

const CAPACITY_PRESETS = [
  { count: 3, label: '3 Members', tag: 'Solo Pod', desc: '1 focused operational squad' },
  { count: 5, label: '5 Members', tag: 'Dual Pod', desc: 'Agile 2-pod coverage' },
  { count: 8, label: '8 Members', tag: 'Core Squad', desc: 'Standard Two-Pizza squad (1:7)' },
  { count: 15, label: '15 Members', tag: 'Multi-Pod Scale', desc: 'Multi-pod division with autonomous leads' },
  { count: 24, label: '24 Members', tag: 'Enterprise Cluster', desc: 'High-volume customer support operations' },
  { count: 50, label: '50+ Members', tag: 'Global Operations', desc: 'Tier-1 enterprise 24/7 service infrastructure' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [session, setCurrentSession] = useState<UserSession | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Industry
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ECOMMERCE');
  const [customIndustryText, setCustomIndustryText] = useState<string>('');

  // Step 2: Team Capacity
  const [totalSeats, setTotalSeats] = useState<number>(8);

  // Step 3: Pods (Hybrid Engine A + B)
  const [pods, setPods] = useState<PodConfig[]>([]);
  const [isGeneratingPods, setIsGeneratingPods] = useState<boolean>(false);
  const [editingPodIndex, setEditingPodIndex] = useState<number | null>(null);
  const [newPodName, setNewPodName] = useState<string>('');
  const [showAddCustomPod, setShowAddCustomPod] = useState<boolean>(false);
  const [customPodInputName, setCustomPodInputName] = useState<string>('');
  const [customPodInputDesc, setCustomPodInputDesc] = useState<string>('');

  // Step 4: Leadership Mode & Organization
  const [organizationName, setOrganizationName] = useState<string>('');
  const [leadershipMode, setLeadershipMode] = useState<'UNIFIED' | 'DEDICATED'>('UNIFIED');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }

    if (
      active.role === 'ADMIN' ||
      active.username?.toLowerCase() === 'pungkyrama' ||
      active.isGuestMember
    ) {
      router.push('/dashboard');
      return;
    }

    if (active.onboardingCompleted) {
      router.push('/dashboard');
      return;
    }

    setCurrentSession(active);
    setOrganizationName(`${active.fullName || active.username}'s Support Hub`);
    setIsVerifying(false);
  }, [router]);

  // When stepping into Step 3, load or generate pods
  const loadPodsForSelectedIndustry = async () => {
    setIsGeneratingPods(true);
    setErrorMessage(null);

    try {
      const res = await generatePodsForIndustry(
        selectedIndustry,
        selectedIndustry === 'OTHER' ? customIndustryText : undefined,
      );

      if (res && res.pods && res.pods.length > 0) {
        // Distribute seats among the pods
        const initialPods: PodConfig[] = res.pods.map((p, idx) => ({
          name: p.name,
          podCategory: p.category,
          description: p.description,
          seats: p.recommendedSeats || (idx === 0 ? 3 : 2),
        }));
        setPods(initialPods);
      } else {
        // Fallback default pods
        setPods([
          {
            name: 'Operations & Inquiries Pod',
            podCategory: 'OPERATIONS',
            description: 'Customer requests and orders',
            seats: 4,
          },
          {
            name: 'Billing & Account Services Pod',
            podCategory: 'BILLING',
            description: 'Invoices, payments, refunds',
            seats: 4,
          },
        ]);
      }
    } catch {
      setPods([
        {
          name: 'General Support Pod',
          podCategory: 'GENERAL',
          description: 'Primary customer support queue',
          seats: totalSeats,
        },
      ]);
    } finally {
      setIsGeneratingPods(false);
    }
  };

  const handleNextToStep2 = () => {
    if (selectedIndustry === 'OTHER' && !customIndustryText.trim()) {
      setErrorMessage('Please specify your custom industry or business sector.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleNextToStep3 = async () => {
    setErrorMessage(null);
    // Suggest leadership mode based on capacity
    if (totalSeats > 8) {
      setLeadershipMode('DEDICATED');
    } else {
      setLeadershipMode('UNIFIED');
    }
    setCurrentStep(3);
    await loadPodsForSelectedIndustry();
  };

  const handleNextToStep4 = () => {
    if (pods.length === 0) {
      setErrorMessage('Please configure at least one operational pod.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(4);
  };

  const handleUpdatePodSeat = (index: number, delta: number) => {
    setPods((prev) =>
      prev.map((p, idx) => {
        if (idx !== index) return p;
        const updatedSeats = Math.max(1, Math.min(8, p.seats + delta));
        return { ...p, seats: updatedSeats };
      }),
    );
  };

  const handleDeletePod = (index: number) => {
    if (pods.length <= 1) {
      setErrorMessage('You must have at least one active operational pod.');
      return;
    }
    setPods((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePodName = (index: number) => {
    if (!newPodName.trim()) return;
    setPods((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newPodName.trim() } : p)),
    );
    setEditingPodIndex(null);
    setNewPodName('');
  };

  const handleAddCustomPod = () => {
    if (!customPodInputName.trim()) return;
    const newPod: PodConfig = {
      name: customPodInputName.trim(),
      podCategory: 'CUSTOM',
      description: customPodInputDesc.trim() || 'Custom operational inquiries',
      seats: 2,
    };
    setPods((prev) => [...prev, newPod]);
    setCustomPodInputName('');
    setCustomPodInputDesc('');
    setShowAddCustomPod(false);
  };

  const handleFinalSubmit = async () => {
    if (!session?.username) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        identifier: session.username,
        organizationName: organizationName.trim(),
        industry: selectedIndustry,
        customIndustryDescription:
          selectedIndustry === 'OTHER' ? customIndustryText.trim() : undefined,
        totalSeats,
        leadershipMode,
        pods: pods.map((p) => ({
          name: p.name,
          podCategory: p.podCategory,
          description: p.description,
          seats: p.seats,
        })),
      };

      const res = await setupMultiPod(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to initialize organization pods.');
        return;
      }

      // Update local session
      const updatedSession: UserSession = {
        ...session,
        onboardingCompleted: true,
      };
      setSession(updatedSession);

      // Redirect directly to dashboard
      router.push('/dashboard');
    } catch {
      setErrorMessage('Network error while saving organization setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllocatedSeats = pods.reduce((acc, p) => acc + (p.seats || 0), 0);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying workspace session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-purple-600/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-4xl relative z-10">
        {/* Header Breadcrumb Steps */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-4 shadow-lg shadow-indigo-900/20 backdrop-blur-sm">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Sentirix Enterprise Operations • Step {currentStep} of 4</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Multi-Pod Architecture Setup
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Design an agile, anti-collision service team structure tailored for your industry.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { num: 1, label: 'Industry' },
              { num: 2, label: 'Capacity' },
              { num: 3, label: 'Pods Setup' },
              { num: 4, label: 'Leadership' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                        : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.num < 4 && <div className="w-6 h-0.5 bg-slate-800 hidden sm:block" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Card Content */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 relative">
          {/* STEP 1: INDUSTRY SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-400" />
                  What industry does your enterprise operate in?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sentirix primes Google Gemini 2.5 Flash with specialized domain knowledge based
                  on your vertical.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {INDUSTRY_PRESETS.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                        isSelected
                          ? `bg-gradient-to-br ${ind.accentColor} ring-2 ring-indigo-500 shadow-lg`
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`p-2 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-slate-900'}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-white">
                          {ind.name}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {ind.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Industry Input Box */}
              {selectedIndustry === 'OTHER' && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Custom Business Sector Specification
                  </div>
                  <input
                    type="text"
                    value={customIndustryText}
                    onChange={(e) => setCustomIndustryText(e.target.value)}
                    placeholder="e.g. Modern Textile & Garment Factory, Specialty Coffee Export, Solar Panels..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Gemini 2.5 Flash will automatically analyze your sector and draft tailored
                    operational pods in Step 3.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Continue to Team Sizing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TEAM CAPACITY */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  What is your planned support team capacity?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sentirix scales from lean 3-person squads to 50+ enterprise agents across
                  specialized pods.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CAPACITY_PRESETS.map((cap) => {
                  const isSelected = totalSeats === cap.count;
                  return (
                    <button
                      key={cap.count}
                      type="button"
                      onClick={() => setTotalSeats(cap.count)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 text-white shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-white">{cap.label}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {cap.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{cap.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Research Guidance Box */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-indigo-300">
                    Two-Pizza Pod Architecture (Gartner & Amazon Rule of 6–8)
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {totalSeats <= 8
                      ? 'Lean Mode: For teams of 8 or fewer, 1 Team Leader manages cross-pod operations with minimal friction.'
                      : 'Enterprise Multi-Pod: For teams larger than 8, dividing staff into pods of ≤ 8 prevents ticket collision and cherry-picking.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Configure Pods & Seats</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HYBRID ENGINE A+B (PODS SETUP & SEATS) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Configure Operational Pods & Seat Allocation
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    AI-generated presets tailored to your business. Edit names, adjust seats, or
                    add custom pods.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400">Seats Allocated:</span>
                  <span
                    className={`font-bold ${
                      totalAllocatedSeats === totalSeats ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {totalAllocatedSeats} / {totalSeats}
                  </span>
                </div>
              </div>

              {isGeneratingPods ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Gemini AI Architect is assembling your specialized pods...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pods.map((pod, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        {editingPodIndex === idx ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newPodName}
                              onChange={(e) => setNewPodName(e.target.value)}
                              className="bg-slate-900 border border-indigo-500 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePodName(idx)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPodIndex(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 text-[11px] rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{pod.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPodIndex(idx);
                                setNewPodName(pod.name);
                              }}
                              className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                              title="Edit Pod Name"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {pod.podCategory && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono">
                                {pod.podCategory}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400">{pod.description}</p>
                      </div>

                      {/* Seat Counter Controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdatePodSeat(idx, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-14 text-center text-xs font-semibold text-white">
                            {pod.seats} {pod.seats === 1 ? 'seat' : 'seats'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePodSeat(idx, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {pods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeletePod(idx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
                            title="Remove Pod"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Custom Pod Form */}
                  {showAddCustomPod ? (
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-dashed border-indigo-500/50 space-y-3">
                      <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Custom Operational Pod</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={customPodInputName}
                          onChange={(e) => setCustomPodInputName(e.target.value)}
                          placeholder="Pod Name (e.g. VIP Concierge Squad)"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={customPodInputDesc}
                          onChange={(e) => setCustomPodInputDesc(e.target.value)}
                          placeholder="Semantic keywords for AI Triage..."
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddCustomPod(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomPod}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                        >
                          Add Pod
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddCustomPod(true)}
                      className="w-full py-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-950/40 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-indigo-400" />
                      <span>Add Custom Operational Pod</span>
                    </button>
                  )}

                  {/* Catch-All Safety Net Alert */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>
                        Automatic Safety Net:{' '}
                        <strong className="text-slate-200">Catch-All Pod</strong> will be provisioned
                        for unmapped topics.
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">0% Ticket Loss</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep4}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Confirm Leadership</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LEADERSHIP & FINAL PROVISIONING */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Choose Leadership Structure & Enterprise Name
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Finalize your multi-pod operations architecture before entering the dashboard.
                </p>
              </div>

              {/* Organization Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Organization / Enterprise Name:
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. SiCepat Express Global, HyperScale Inc..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Leadership Mode Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">
                  Command & Supervisory Structure:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadershipMode('UNIFIED')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      leadershipMode === 'UNIFIED'
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Unified Cross-Pod Leader</span>
                      {leadershipMode === 'UNIFIED' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Best for lean teams (≤ 8 members). You lead all operational pods directly
                      without administrative overhead.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeadershipMode('DEDICATED')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      leadershipMode === 'DEDICATED'
                        ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/50 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Dedicated Pod Leaders</span>
                      {leadershipMode === 'DEDICATED' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Best for scaling operations (&gt; 8 members). Each pod is managed by an
                      autonomous team lead with individual invite links.
                    </p>
                  </button>
                </div>
              </div>

              {/* Architecture Review Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Operational Architecture Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Industry:</span>
                    <span className="font-semibold text-white">{selectedIndustry}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Capacity:</span>
                    <span className="font-semibold text-emerald-400">{totalSeats} Members</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Active Pods:</span>
                    <span className="font-semibold text-indigo-400">
                      {pods.length} + Catch-All
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Command Model:</span>
                    <span className="font-semibold text-purple-400">{leadershipMode}</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Multi-Pod System...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Multi-Pod Operations</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
