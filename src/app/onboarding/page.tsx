'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Laptop,
  HeartPulse,
  Home,
  Plane,
  Gamepad2,
  Wifi,
  Car,
  Scale,
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
  Copy,
  Share2,
  MessageCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { getSession, setSession, UserSession } from '../../lib/auth';
import { generatePodsForIndustry, setupMultiPodV2, regenerateToken } from '../../lib/api';

interface IndustryOption {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  defaultServices: string[];
}

const INDUSTRY_PRESETS: IndustryOption[] = [
  {
    id: 'ECOMMERCE',
    name: 'E-Commerce & D2C Brands',
    tagline: 'WISMO tracking, RMA returns, checkout vouchers, VIP buyers',
    icon: ShoppingCart,
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    defaultServices: ['WISMO & Carrier Exceptions', 'Returns, Exchanges & Damaged Claims', 'Checkout & Payments', 'VIP Concierge Support'],
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics, Freight & 3PLs',
    tagline: 'Interstate linehaul, last-mile RTS, freight damage, COD settlement',
    icon: Truck,
    accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
    defaultServices: ['Linehaul & Hub Transit', 'Last-Mile Route Exceptions', 'Freight Damage & Claims', 'COD & Shipper Billing'],
  },
  {
    id: 'FINTECH',
    name: 'FinTech & Digital Payments',
    tagline: 'ACH disputes, biometric KYC, chargeback defense, BNPL lending',
    icon: CreditCard,
    accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
    defaultServices: ['ACH & Wire Transfer Disputes', 'Biometric KYC & Account Security', 'Fraud & Chargeback Defense', 'Payment Gateway & Webhooks'],
  },
  {
    id: 'SAAS',
    name: 'B2B SaaS & Tech Enterprise',
    tagline: 'REST APIs, webhooks, Okta/SAML SSO, SLA downtime incidents',
    icon: Laptop,
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
    defaultServices: ['Tier-1 User Admin Access', 'Tier-2 API & Webhooks', 'Tier-3 Engineering Escalations', 'Enterprise SAML SSO & SLA'],
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare & Telemedicine',
    tagline: 'Doctor video visits, Rx pharmacy delivery, HIPAA health records',
    icon: HeartPulse,
    accentColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
    defaultServices: ['Urgent Clinical Triage', 'Doctor Appointments & Video Call', 'Digital Rx & Pharmacy Fulfillment', 'Health Insurance & Prior Auth'],
  },
  {
    id: 'REAL_ESTATE',
    name: 'Real Estate & PropTech',
    tagline: 'Tenant emergency repairs, lease agreements, security deposits',
    icon: Home,
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400',
    defaultServices: ['Tenant Emergency Maintenance', 'Lease Agreements & Move-in', 'Rent Collection & Deposit Refund', 'HOA Compliance & Amenities'],
  },
  {
    id: 'TRAVEL',
    name: 'Travel, Hospitality & Airlines',
    tagline: 'Flight rescheduling, hotel overbooking, emergency trip disruption',
    icon: Plane,
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    defaultServices: ['Flight Rescheduling & Disruptions', 'Hotel Bookings & Overbooked Rooms', '24/7 Trip Emergency Assistance', 'Corporate Travel & Group MICE'],
  },
  {
    id: 'GAMING',
    name: 'Gaming & Interactive Media',
    tagline: 'Account recovery, in-game item refunds, anti-cheat ban appeals',
    icon: Gamepad2,
    accentColor: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/40 text-violet-400',
    defaultServices: ['Account Recovery & Stolen Items', 'In-Game Purchases & Microtransactions', 'Toxicity & Ban Appeals', 'Server Lag & Game Client Bugs'],
  },
  {
    id: 'TELECOM',
    name: 'Telecommunications & ISPs',
    tagline: 'Fiber network outages, technician dispatch, modem router diagnostics',
    icon: Wifi,
    accentColor: 'from-sky-500/20 to-cyan-500/10 border-sky-500/40 text-sky-400',
    defaultServices: ['Network Outage Escalations', 'Field Technician On-Site Dispatch', 'Modem & Hardware Diagnostics', 'Billing Invoices & Plan Renewals'],
  },
  {
    id: 'AUTOMOTIVE',
    name: 'Automotive & EV Mobility',
    tagline: 'Roadside towing, EV charging stations, car rental damage claims',
    icon: Car,
    accentColor: 'from-orange-500/20 to-red-500/10 border-orange-500/40 text-orange-400',
    defaultServices: ['Roadside Assistance & Towing', 'EV Charging Station App Billing', 'Vehicle Warranty & Recall Servicing', 'Car Rental Damage & Toll Disputes'],
  },
  {
    id: 'PROFESSIONAL_SERVICES',
    name: 'Legal & CPA Tax Services',
    tagline: 'IRS tax filing, client retainer agreements, attorney scheduling',
    icon: Scale,
    accentColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-400',
    defaultServices: ['IRS Tax Filing & W-2 Collection', 'Client Retainer Engagements', 'Attorney & CPA Appointments', 'Secure Document Vault & Compliance'],
  },
  {
    id: 'EDTECH',
    name: 'Education & Bootcamps',
    tagline: 'LMS virtual classrooms, tuition financial aid, degree credentials',
    icon: GraduationCap,
    accentColor: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400',
    defaultServices: ['LMS Virtual Classroom Access', 'Tuition Payments & Financial Aid', 'Academic Advising & Tutors', 'Degree & Certificate Issuance'],
  },
];

interface PodDraft {
  name: string;
  podCategory: string;
  description: string;
  services: string[];
}

export default function TitaniumOnboardingPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Stepper State (1: Industry, 2: Capacity Typing, 3: Pods & Multi-Services, 4: Distribution Tokens)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Industry
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ECOMMERCE');
  const [customIndustryText, setCustomIndustryText] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');

  // Step 2: Member Input via Typing
  const [typedMembers, setTypedMembers] = useState<number>(20);

  // Step 3: Pods & Multi-Services
  const [pods, setPods] = useState<PodDraft[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState<string>('');
  const [isGeneratingPods, setIsGeneratingPods] = useState<boolean>(false);
  const [editingPodIndex, setEditingPodIndex] = useState<number | null>(null);
  const [newPodName, setNewPodName] = useState<string>('');

  // Step 4: Submission & Single-Use Leader Tokens Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedLeaderTokens, setGeneratedLeaderTokens] = useState<Array<{
    workspaceId: string;
    workspaceName: string;
    podCategory: string;
    services: string[];
    token: string;
    joinUrl: string;
  }>>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);

  // Auto-calculated pod count: Math.ceil(typedMembers / 8)
  const calculatedPodCount = Math.max(1, Math.ceil((Number(typedMembers) || 1) / 8));
  const rawFraction = ((Number(typedMembers) || 1) / 8).toFixed(1);

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }
    setLocalSession(active);
    setIsVerifying(false);

    // Read planned capacity from landing page calculator if present
    try {
      const planned = localStorage.getItem('sentirix_planned_capacity');
      if (planned) {
        const num = Number(planned);
        if (!isNaN(num) && num >= 1) {
          setTypedMembers(num);
        }
        localStorage.removeItem('sentirix_planned_capacity');
      }
    } catch {}
  }, [router]);

  // Load pods when entering Step 3
  const prepareStep3Pods = async () => {
    setIsGeneratingPods(true);
    setErrorMessage(null);

    const preset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustry);
    const services = preset ? [...preset.defaultServices] : [
      'Layanan Informasi Umum',
      'Pengaduan Masalah Pelanggan',
      'Penagihan & Administrasi',
      'Eskalasi Khusus Manajemen',
    ];
    setAvailableServices(services);

    try {
      const aiResult = await generatePodsForIndustry(
        selectedIndustry,
        selectedIndustry === 'OTHER' ? customIndustryText : undefined,
      );

      if (aiResult?.pods && aiResult.pods.length > 0) {
        // Adjust AI pods count to match calculatedPodCount
        let targetPods = aiResult.pods.map((p, idx) => ({
          name: p.name,
          podCategory: p.category || 'GENERAL',
          description: p.description || '',
          services: [services[idx % services.length] || 'Layanan Utama'],
        }));

        while (targetPods.length < calculatedPodCount) {
          const num = targetPods.length + 1;
          targetPods.push({
            name: `Pod Spesialisasi ${num}`,
            podCategory: 'GENERAL',
            description: `Unit penanganan operasional spesialisasi #${num}`,
            services: [services[(num - 1) % services.length] || 'Layanan Pendukung'],
          });
        }

        if (targetPods.length > calculatedPodCount) {
          targetPods = targetPods.slice(0, calculatedPodCount);
        }

        setPods(targetPods);
      } else {
        // Fallback generator
        buildFallbackPods(services, calculatedPodCount);
      }
    } catch {
      buildFallbackPods(services, calculatedPodCount);
    } finally {
      setIsGeneratingPods(false);
    }
  };

  const buildFallbackPods = (servicesList: string[], count: number) => {
    const list: PodDraft[] = [];
    for (let i = 1; i <= count; i++) {
      const defaultSvc = servicesList[(i - 1) % servicesList.length] || `Layanan Pod #${i}`;
      list.push({
        name: `Pod Spesialisasi ${i}`,
        podCategory: 'GENERAL',
        description: `Penanganan operasional fokus untuk unit #${i}`,
        services: [defaultSvc],
      });
    }
    setPods(list);
  };

  const handleNextToStep2 = () => {
    if (!organizationName.trim()) {
      setErrorMessage('Nama organisasi / perusahaan wajib diisi.');
      return;
    }
    if (selectedIndustry === 'OTHER' && !customIndustryText.trim()) {
      setErrorMessage('Mohon jelaskan jenis industri atau bidang usaha Anda.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleNextToStep3 = async () => {
    if (!typedMembers || typedMembers < 1) {
      setErrorMessage('Mohon ketikkan jumlah member minimal 1 orang.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(3);
    await prepareStep3Pods();
  };

  const handleToggleServiceForPod = (podIndex: number, serviceName: string) => {
    setPods((prev) =>
      prev.map((pod, idx) => {
        if (idx !== podIndex) return pod;
        const exists = pod.services.includes(serviceName);
        const updated = exists
          ? pod.services.filter((s) => s !== serviceName)
          : [...pod.services, serviceName];
        return { ...pod, services: updated };
      }),
    );
  };

  const handleAddGlobalService = () => {
    if (!newServiceInput.trim()) return;
    const clean = newServiceInput.trim();
    if (!availableServices.includes(clean)) {
      setAvailableServices((prev) => [...prev, clean]);
    }
    setNewServiceInput('');
  };

  const handleSavePodName = (index: number) => {
    if (!newPodName.trim()) return;
    setPods((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newPodName.trim() } : p)),
    );
    setEditingPodIndex(null);
    setNewPodName('');
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
        totalSeats: Number(typedMembers),
        leadershipMode: 'DEDICATED' as const,
        pods: pods.map((p) => ({
          name: p.name,
          podCategory: p.podCategory,
          description: p.description,
          services: p.services,
          seats: 8,
        })),
      };

      const res = await setupMultiPodV2(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'Gagal membentuk organisasi multi-pod.');
        return;
      }

      // Update session
      const updatedSession: UserSession = {
        ...session,
        onboardingCompleted: true,
      };
      setSession(updatedSession);

      // Move to Step 4: Token Distribution Screen
      setGeneratedLeaderTokens(res.leaderTokens || []);
      setCurrentStep(4);
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungkan ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (token: string, joinUrl: string) => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRegenerateLeaderToken = async (oldToken: string) => {
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken);
      if (res.success && res.newToken) {
        setGeneratedLeaderTokens((prev) =>
          prev.map((t) =>
            t.token === oldToken
              ? { ...t, token: res.newToken!, joinUrl: res.joinUrl! }
              : t,
          ),
        );
      } else {
        setErrorMessage(res.error || 'Gagal meregenerate token.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi sesi Sentirix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Titanium Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-4xl relative z-10">
        {/* Header Breadcrumbs */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {currentStep === 4 ? 'Aktivasi Token Kepemimpinan Leader' : 'Pengaturan Arsitektur Multi-Pod'}
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl mx-auto">
            {currentStep === 4
              ? 'Bagikan token aktivasi sekali pakai kepada setiap Leader Pod sebelum masuk ke Executive Cockpit.'
              : (
                <>
                  Bangun tata kelola layanan pelanggan yang terfokus, tangkas, dan bebas bentrok <span className="whitespace-nowrap">antar divisi.</span>
                </>
              )}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { num: 1, label: 'Industri' },
              { num: 2, label: 'Kapasitas' },
              { num: 3, label: 'Pod & Layanan' },
              { num: 4, label: 'Token Leader' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                        : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#111827] text-slate-500 border border-slate-800'
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

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card Body with Titanium Theme */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: INDUSTRY SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Perusahaan Anda bergerak di bidang apa?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sentirix akan merekomendasikan pod spesialisasi dan jenis layanan yang tepat untuk sektor Anda.
                </p>
              </div>

              {/* Organization Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <span>Nama Organisasi / Perusahaan</span>
                  <span className="text-red-400 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Express Company"
                  className={`w-full bg-[#0B0F19] border ${
                    !organizationName.trim() && errorMessage ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                  } rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium`}
                />
              </div>

              {/* 12 Industry Preset Cards (3 rows of 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {INDUSTRY_PRESETS.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => {
                        setSelectedIndustry(ind.id);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                        isSelected
                          ? 'bg-[#1E293B] border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                          : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${ind.accentColor}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white tracking-tight">{ind.name}</h3>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {ind.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 13th Option: Custom Industry / AI Instant Architect Banner */}
              <div
                onClick={() => {
                  setSelectedIndustry('OTHER');
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  selectedIndustry === 'OTHER'
                    ? 'bg-[#1E293B] border-fuchsia-500 shadow-lg shadow-fuchsia-500/20 ring-1 ring-fuchsia-500'
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 border border-fuchsia-500/40 text-fuchsia-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-tight">Custom Industry / Sektor Lainnya</h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                        AI INSTANT ARCHITECT
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Punya model bisnis khusus atau niche? Ketikkan bidang usaha Anda dan AI akan merancang arsitektur pod operasional secara otomatis.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {selectedIndustry === 'OTHER' && <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />}
                </div>
              </div>

              {/* Custom Industry Text Input if OTHER selected */}
              {selectedIndustry === 'OTHER' && (
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-fuchsia-500/30 animate-fadeIn">
                  <label className="block text-xs font-bold text-fuchsia-300 mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    Jelaskan Sektor Bisnis Kustom Anda
                  </label>
                  <input
                    type="text"
                    value={customIndustryText}
                    onChange={(e) => setCustomIndustryText(e.target.value)}
                    placeholder="Contoh: Drone Pertanian Otonom & Pemetaan Lahan Komersial"
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-fuchsia-500 transition-all font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    AI Architect akan merancang 6 pod spesifik dari penjelasan bisnis yang Anda ketikkan.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  <span>Lanjut: Tentukan Jumlah Member</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MEMBER CAPACITY TYPING & DYNAMIC FORMULA CALLOUT */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Berapa jumlah member yang ingin Anda masukkan?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ketikkan total personel customer support yang akan mengoperasikan Sentirix di perusahaan Anda.
                </p>
              </div>

              {/* Interactive Typing Input */}
              <div className="p-6 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-300">
                  Total Anggota Tim (Ketik Angka Bebas):
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={typedMembers}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setTypedMembers(isNaN(val) ? 1 : Math.max(1, val));
                      }}
                      className="w-full bg-[#111827] border-2 border-blue-500/60 focus:border-blue-400 text-white text-2xl font-black rounded-xl px-4 py-3 text-center tracking-wide focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 transition-all font-mono"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">Orang Anggota Tim</span>
                </div>

                {/* Professional Operational Rationale Text */}
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Dengan jumlah member sebanyak <span className="font-bold text-white">{typedMembers} orang</span>, maka jumlah pod operasional Anda adalah <span className="font-bold text-emerald-400">{calculatedPodCount} pod</span> guna memastikan rentang kendali (<em>span of control</em>) tetap optimal dan koordinasi penanganan komplain berjalan responsif.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  <span>Lanjut: Atur Pod &amp; Jenis Layanan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PODS SETUP & MULTI-SERVICES ALLOCATION */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Petakan Jenis Layanan ke Dalam {calculatedPodCount} Pod
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pilih jenis layanan yang akan ditangani oleh masing-masing pod. Satu pod dapat menangani lebih dari satu jenis layanan sekaligus.
                </p>
              </div>

              {/* Quick Add Custom Service Tag */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGlobalService()}
                  placeholder="Tambah jenis layanan baru (misal: Layanan VIP Prioritas)..."
                  className="flex-1 bg-[#111827] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddGlobalService}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Layanan</span>
                </button>
              </div>

              {/* Pod Cards List */}
              {isGeneratingPods ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <span>AI sedang merancang {calculatedPodCount} pod spesialisasi...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {pods.map((pod, pIdx) => {
                    const isEditing = editingPodIndex === pIdx;
                    return (
                      <div
                        key={pIdx}
                        className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center">
                              {pIdx + 1}
                            </span>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newPodName}
                                  onChange={(e) => setNewPodName(e.target.value)}
                                  className="bg-[#111827] border border-blue-500 text-white text-xs px-2.5 py-1 rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePodName(pIdx)}
                                  className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-bold"
                                >
                                  Simpan
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-extrabold text-white">{pod.name}</h3>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPodIndex(pIdx);
                                    setNewPodName(pod.name);
                                  }}
                                  className="text-slate-500 hover:text-slate-300"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            Maks 8 Orang
                          </span>
                        </div>

                        {/* Multi-Service Selector for this Pod */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                            Pilih Jenis Layanan yang Ditangani Pod Ini:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableServices.map((svc) => {
                              const isChecked = pod.services.includes(svc);
                              return (
                                <button
                                  key={svc}
                                  type="button"
                                  onClick={() => handleToggleServiceForPod(pIdx, svc)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    isChecked
                                      ? 'bg-blue-950/70 border-blue-500 text-blue-200 shadow-sm'
                                      : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-slate-300'
                                  }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                      isChecked
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-slate-700'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span>{svc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  title="Kembali ke Penentuan Kapasitas Member (Langkah 2)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Membentuk Organisasi &amp; Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Organisasi &amp; Dapatkan Token Leader</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SINGLE-USE LEADER TOKENS DISTRIBUTION SCREEN */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-white">
                  Organisasi Berhasil Dibentuk!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  Sebelum masuk ke Executive Cockpit Super Admin, silakan bagikan token aktivasi di bawah ini ke masing-masing Leader.
                  <br />
                  <strong className="text-blue-400">Catatan Keamanan:</strong> Setiap token di bawah ini berstatus <strong>Single-Use (hanya bisa diklaim 1 kali)</strong>.
                </p>
              </div>

              {/* Leader Tokens Grid */}
              <div className="space-y-3.5">
                {generatedLeaderTokens.map((item, idx) => {
                  const isCopied = copiedToken === item.token;
                  const waText = encodeURIComponent(
                    `Halo, Anda ditunjuk sebagai Leader untuk ${item.workspaceName} di Sentirix. Silakan aktivasi akun dan tentukan kuota tim Anda melalui link berikut: ${item.joinUrl}`,
                  );
                  return (
                    <div
                      key={item.token}
                      className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white">{item.workspaceName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                            SINGLE-USE • UNCLAIMED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>Token:</span>
                          <span className="text-blue-300 font-bold bg-[#111827] px-2 py-0.5 rounded border border-slate-800">
                            {item.token}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Layanan: {item.services.join(', ') || 'Umum'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.token, item.joinUrl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-[#111827] border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                        </button>

                        <a
                          href={`https://wa.me/?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          disabled={regeneratingToken === item.token}
                          onClick={() => handleRegenerateLeaderToken(item.token)}
                          className="px-3 py-1.5 rounded-lg bg-[#111827] border border-blue-500/40 hover:border-blue-400 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          title="Buat ulang token jika calon leader membutuhkan token baru"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              regeneratingToken === item.token ? 'animate-spin text-blue-400' : ''
                            }`}
                          />
                          <span>{regeneratingToken === item.token ? 'Memproses...' : 'Regenerate'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Proceed to Super Admin Cockpit Button */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/admin/cockpit')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Selesai Membagikan ➔ Masuk ke Super Admin Executive Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
