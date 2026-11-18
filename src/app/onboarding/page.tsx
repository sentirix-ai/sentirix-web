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
import { generatePodsForIndustry, setupMultiPodV2, regenerateToken, fetchSuperAdminCockpit } from '../../lib/api';

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
    tagline: 'WISMO tracking, RMA returns, checkout vouchers, VIP buyers, merchant onboarding',
    icon: ShoppingCart,
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    defaultServices: [
      'WISMO & Carrier Exceptions',
      'Returns, Exchanges & Damaged Claims',
      'Checkout, Payments & Promotions',
      'VIP Concierge & High-LTV Buyers',
      'Merchant Onboarding & Catalog Compliance',
      'Product Quality & Brand Protection',
    ],
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics, Freight & 3PLs',
    tagline: 'Linehaul transit, last-mile RTS, freight damage, COD settlement, fleet dispatch',
    icon: Truck,
    accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
    defaultServices: [
      'Linehaul & Transit Hub Exceptions',
      'Last-Mile & Delivery Route Exceptions',
      'Freight Damage & Insurance Claims',
      'B2B Shipper Accounts & COD Settlement',
      'Fleet Dispatch & Special Handling',
      'Courier Misconduct & Driver Operations',
    ],
  },
  {
    id: 'FINTECH',
    name: 'FinTech & Digital Payments',
    tagline: 'ACH disputes, biometric KYC, chargeback defense, BNPL lending, treasury clearing',
    icon: CreditCard,
    accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
    defaultServices: [
      'ACH, Wire & Real-Time Disputes',
      'Biometric KYC & Account Security',
      'Fraud, Scam & Chargeback Defense',
      'B2B Payment Gateway & Webhooks',
      'Digital Lending, BNPL & Collections',
      'Treasury, Settlement & Clearing',
    ],
  },
  {
    id: 'SAAS',
    name: 'B2B SaaS & Tech Enterprise',
    tagline: 'REST APIs, webhooks, Okta/SAML SSO, SLA downtime incidents, subscription invoicing',
    icon: Laptop,
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
    defaultServices: [
      'Tier-1 User Access & Admin Onboarding',
      'Tier-2 API, Webhooks & Developer Interop',
      'Tier-3 Application Bug & Engineering',
      'Enterprise Security, SAML SSO & SCIM',
      'Subscription Invoicing, Tax & Procurement',
      'P0/P1 Downtime & SLA Escalations',
    ],
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare & Telemedicine',
    tagline: 'Doctor video visits, Rx pharmacy delivery, HIPAA records, clinical triage',
    icon: HeartPulse,
    accentColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
    defaultServices: [
      'Urgent Triage & Clinical Escalations',
      'Doctor Appointments & Telehealth Video',
      'Digital Prescriptions & Pharmacy Delivery',
      'Health Insurance Claims & Prior Auth',
      'Electronic Health Records & HIPAA Privacy',
      'Chronic Care & Patient Follow-up',
    ],
  },
  {
    id: 'REAL_ESTATE',
    name: 'Real Estate & PropTech',
    tagline: 'Tenant emergency repairs, lease agreements, security deposits, HOA compliance',
    icon: Home,
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400',
    defaultServices: [
      'Tenant Emergency Maintenance & Repairs',
      'Lease Agreements, Move-in & Handover',
      'Rent Collection & Security Deposits',
      'HOA Compliance, Noise & Violations',
      'Property Amenities & Facilities',
      'Landlord Relations & Vendor Work Orders',
    ],
  },
  {
    id: 'TRAVEL',
    name: 'Travel, Hospitality & Airlines',
    tagline: 'Flight rescheduling, hotel overbooking, 24/7 trip disruption, MICE, rental cars',
    icon: Plane,
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    defaultServices: [
      'Flight Rescheduling & Disruptions',
      'Hotel Bookings & Property Disputes',
      'Trip Disruptions & 24/7 Emergency',
      'Corporate Travel & MICE Groups',
      'Rental Car & Airport Ground Transport',
      'Travel Insurance & Cancellation Claims',
    ],
  },
  {
    id: 'GAMING',
    name: 'Gaming & Interactive Media',
    tagline: 'Account recovery, in-game item refunds, anti-cheat ban appeals, tournament support',
    icon: Gamepad2,
    accentColor: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/40 text-violet-400',
    defaultServices: [
      'Account Security, 2FA & Stolen Items',
      'In-Game Purchases & Currency Refunds',
      'Player Toxicity, Cheating & Bans',
      'Server Latency, Bugs & Client Crashes',
      'Guilds, Clan Support & Community',
      'Esports Tournaments & Anti-Cheat',
    ],
  },
  {
    id: 'TELECOM',
    name: 'Telecommunications & ISPs',
    tagline: 'Fiber network outages, technician dispatch, modem router diagnostics, eSIM porting',
    icon: Wifi,
    accentColor: 'from-sky-500/20 to-cyan-500/10 border-sky-500/40 text-sky-400',
    defaultServices: [
      'Network Outage & Area Downtime',
      'Field Technician On-Site Dispatch',
      'Modem/Router & Wi-Fi Diagnostics',
      'Billing Invoices & Rate Expirations',
      'SIM Card, eSIM & Number Porting',
      'Enterprise Dedicated Fiber & SLA Lines',
    ],
  },
  {
    id: 'AUTOMOTIVE',
    name: 'Automotive & EV Mobility',
    tagline: 'Roadside towing, EV charging stations, warranty recall servicing, damage claims',
    icon: Car,
    accentColor: 'from-orange-500/20 to-red-500/10 border-orange-500/40 text-orange-400',
    defaultServices: [
      'Roadside Assistance & Towing',
      'EV Charging Station & App Billing',
      'Vehicle Warranty & Recall Servicing',
      'Car Rental Damage & Toll Disputes',
      'Fleet Telematics & Commercial Vehicle',
      'Auto Insurance Claims & Accident Reports',
    ],
  },
  {
    id: 'PROFESSIONAL_SERVICES',
    name: 'Legal & CPA Tax Services',
    tagline: 'IRS tax filing, client retainer agreements, attorney scheduling, document vault',
    icon: Scale,
    accentColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-400',
    defaultServices: [
      'Tax Filing Deadlines & IRS Documents',
      'Client Retainer Onboarding & Scope',
      'Attorney & Consultant Scheduling',
      'Secure Document Vault & Compliance',
      'Billing Invoices, Trust & Retainers',
      'Corporate Entity Formation & Filings',
    ],
  },
  {
    id: 'EDTECH',
    name: 'Education & Bootcamps',
    tagline: 'LMS virtual classrooms, tuition financial aid, degree credentials, proctoring',
    icon: GraduationCap,
    accentColor: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400',
    defaultServices: [
      'LMS Platform & Virtual Classrooms',
      'Tuition Payments, Aid & Billing',
      'Academic Advising & Tutor Support',
      'Certification & Degree Verification',
      'Admissions, Placement & Counseling',
      'Exam Integrity & Proctoring Support',
    ],
  },
];

const CUSTOM_INDUSTRY_DEFAULT_SERVICES = [
  'Frontline Operations & Ticket Triage',
  'Billing Invoices & Payment Disputes',
  'Product Quality & Warranty Claims',
  'Technical Diagnostics & Application Support',
  'Account Security & Profile Management',
  'Executive & High-Priority SLA Escalations',
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
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [editingServiceText, setEditingServiceText] = useState<string>('');

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

    // Handle redirection from Super Admin Cockpit "Refresh Team" (?step=2)
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const stepParam = urlParams.get('step');
        if (stepParam === '2') {
          setCurrentStep(2);
          fetchSuperAdminCockpit(active.username).then((data) => {
            if (data?.organization) {
              if (data.organization.name) setOrganizationName(data.organization.name);
              if (data.organization.industry) setSelectedIndustry(data.organization.industry);
              if (data.organization.totalSeats) setTypedMembers(data.organization.totalSeats);
            }
          }).catch(() => {});
        }
      }
    } catch {}
  }, [router]);

  // Load pods when entering Step 3
  const prepareStep3Pods = async () => {
    setIsGeneratingPods(true);
    setErrorMessage(null);

    const preset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustry);
    let services = preset
      ? [...preset.defaultServices]
      : [...CUSTOM_INDUSTRY_DEFAULT_SERVICES];
    setAvailableServices(services);

    try {
      const aiResult = await generatePodsForIndustry(
        selectedIndustry,
        selectedIndustry === 'OTHER' ? customIndustryText : undefined,
      );

      if (aiResult?.pods && aiResult.pods.length > 0) {
        // If backend or AI provided dynamic custom services, synchronize availableServices!
        if (aiResult.defaultServices && aiResult.defaultServices.length > 0) {
          services = [...aiResult.defaultServices];
          setAvailableServices(services);
        } else if (selectedIndustry === 'OTHER') {
          const dynamicServices = aiResult.pods.map((p: any) =>
            p.service?.trim() || p.name.replace(/\s+Pod$/i, '').trim()
          );
          if (dynamicServices.length > 0) {
            services = dynamicServices;
            setAvailableServices(dynamicServices);
          }
        }

        // Adjust AI pods count to match calculatedPodCount
        let targetPods = aiResult.pods.map((p, idx) => {
          const podSvc =
            p.service?.trim() ||
            services[idx % services.length] ||
            p.name.replace(/\s+Pod$/i, '').trim() ||
            'Core Service';
          const podNum = idx + 1;
          const podLabel = podNum < 10 ? `Pod 0${podNum}` : `Pod ${podNum}`;
          return {
            name: podLabel,
            podCategory: p.category || 'GENERAL',
            description: p.description || '',
            services: [podSvc],
          };
        });

        while (targetPods.length < calculatedPodCount) {
          const num = targetPods.length + 1;
          const fallbackSvc = services[(num - 1) % services.length] || `Core Service #${num}`;
          const podLabel = num < 10 ? `Pod 0${num}` : `Pod ${num}`;
          targetPods.push({
            name: podLabel,
            podCategory: 'GENERAL',
            description: `Dedicated operational unit for specialization #${num}`,
            services: [fallbackSvc],
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
      const defaultSvc = servicesList[(i - 1) % servicesList.length] || `Core Service #${i}`;
      const podLabel = i < 10 ? `Pod 0${i}` : `Pod ${i}`;
      list.push({
        name: podLabel,
        podCategory: 'GENERAL',
        description: `Dedicated operational unit for ${defaultSvc}`,
        services: [defaultSvc],
      });
    }
    setPods(list);
  };

  const handleNextToStep2 = () => {
    if (!organizationName.trim()) {
      setErrorMessage('Organization / company name is required.');
      return;
    }
    if (selectedIndustry === 'OTHER' && !customIndustryText.trim()) {
      setErrorMessage('Please describe your industry or line of business.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleNextToStep3 = async () => {
    if (!typedMembers || typedMembers < 1) {
      setErrorMessage('Please enter at least 1 team member.');
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
    const alreadyExists = availableServices.some(
      (s) => s.toLowerCase() === clean.toLowerCase(),
    );
    if (!alreadyExists) {
      setAvailableServices((prev) => [...prev, clean]);
    }
    setNewServiceInput('');
  };

  const handleSavePodName = (index: number) => {
    if (!newPodName.trim()) return;
    const cleanName = newPodName.replace(/\s+Pod$/i, '').trim();
    setPods((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: cleanName } : p)),
    );
    setEditingPodIndex(null);
    setNewPodName('');
  };

  const handleStartEditService = (index: number, currentText: string) => {
    setEditingServiceIndex(index);
    setEditingServiceText(currentText);
  };

  const handleSaveEditService = (index: number) => {
    if (!editingServiceText.trim()) return;
    const oldText = availableServices[index];
    const newText = editingServiceText.trim();
    if (!oldText) return;

    setAvailableServices((prev) =>
      prev.map((s, idx) => (idx === index ? newText : s)),
    );

    // Synchronize renamed service across all pods
    setPods((prev) =>
      prev.map((pod) => ({
        ...pod,
        services: pod.services.map((s) => (s === oldText ? newText : s)),
      })),
    );

    setEditingServiceIndex(null);
    setEditingServiceText('');
  };

  const handleDeleteService = (index: number, serviceName: string) => {
    // Safety guard: Protect default industry baseline categories (0-5)
    if (index < 6) return;

    setAvailableServices((prev) => prev.filter((_, idx) => idx !== index));
    // Remove deleted service from all pods
    setPods((prev) =>
      prev.map((pod) => ({
        ...pod,
        services: pod.services.filter((s) => s !== serviceName),
      })),
    );
    if (editingServiceIndex === index) {
      setEditingServiceIndex(null);
      setEditingServiceText('');
    }
  };

  const handleResetServicesToDefault = () => {
    const preset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustry);
    const defaults = preset
      ? [...preset.defaultServices]
      : [...CUSTOM_INDUSTRY_DEFAULT_SERVICES];

    // Restore standard 6 baseline names while preserving user's custom additions (indices 6+)
    const customServices = availableServices.slice(6);
    setAvailableServices([...defaults, ...customServices]);
    setEditingServiceIndex(null);
    setEditingServiceText('');
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
        pods: pods.map((p, idx) => ({
          name: `Pod ${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`,
          podCategory: p.podCategory,
          description: p.description,
          services: p.services,
          seats: 8,
        })),
      };

      const res = await setupMultiPodV2(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create multi-pod organization.');
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
      setErrorMessage('A network error occurred while connecting to the server.');
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
        setErrorMessage(res.error || 'Failed to regenerate token.');
      }
    } catch {
      setErrorMessage('A network error occurred.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Sentirix session...</span>
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
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-white p-0.5 flex items-center justify-center shadow-md">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">Sentirix</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              AI COPILOT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {currentStep === 4 ? 'Leader Activation & Token Distribution' : 'Multi-Pod Architecture Setup'}
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl mx-auto">
            {currentStep === 4
              ? 'Distribute single-use activation tokens to each Pod Leader before proceeding to the Executive Cockpit.'
              : (
                <>
                  Build a focused, agile customer support governance free of inter-departmental friction <span className="whitespace-nowrap">across all teams.</span>
                </>
              )}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { num: 1, label: 'Industry' },
              { num: 2, label: 'Capacity' },
              { num: 3, label: 'Pods & Services' },
              { num: 4, label: 'Leader Tokens' },
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
                  What industry is your company in?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sentirix will recommend specialized pods and tailored services designed for your sector.
                </p>
              </div>

              {/* Organization Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <span>Organization / Company Name</span>
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
                  placeholder="e.g., Acme Global Enterprises"
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
                      <h3 className="text-xs font-bold text-white tracking-tight">Custom Industry / Other Sector</h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                        AI INSTANT ARCHITECT
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Have a unique or niche business model? Enter your sector and our AI will automatically architect your operational pods.
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
                    Describe Your Custom Business Sector
                  </label>
                  <input
                    type="text"
                    value={customIndustryText}
                    onChange={(e) => setCustomIndustryText(e.target.value)}
                    placeholder="e.g., Autonomous Agricultural Drones & Land Surveying"
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-fuchsia-500 transition-all font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    AI Architect will design tailored specialized pods based on your business description.
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
                  <span>Next: Set Team Member Capacity</span>
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
                  How many team members do you want to add?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the total customer support personnel who will be using Sentirix at your company.
                </p>
              </div>

              {/* Interactive Typing Input */}
              <div className="p-6 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-300">
                  Total Team Members (Enter any number):
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
                  <span className="text-sm font-semibold text-slate-400">Team Members</span>
                </div>

                {/* Professional Operational Rationale Text */}
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  With a total of <span className="font-bold text-white">{typedMembers} members</span>, your operational setup will comprise <span className="font-bold text-emerald-400">{calculatedPodCount} pods</span> to maintain an optimal span of control and ensure highly responsive issue resolution.
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
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  <span>Next: Configure Pods &amp; Services</span>
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
                  Configure Operational Pods &amp; Assign Ticket Categories
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Assign customer issue categories to your {calculatedPodCount} operational pods. Inbound tickets will be intelligently classified and routed by AI Triage based on these scopes.
                </p>
              </div>

              {/* Quick Add Custom Service Tag - American Corporate Style */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/90 shadow-lg space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Plus className="w-4 h-4 text-blue-400" />
                    Add Custom Ticket Category
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enter a new service specialization or customer complaint category. It will appear at the bottom of the list for all pods.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGlobalService();
                      }
                    }}
                    placeholder="e.g., VIP Priority Concierge & White-Glove Support"
                    className="flex-1 bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddGlobalService();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 transition-all shrink-0 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* Pod Cards List */}
              {isGeneratingPods ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <span>AI Architect is designing {calculatedPodCount} operational pods...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {pods.map((pod, pIdx) => {
                    const isEditing = editingPodIndex === pIdx;
                    return (
                      <div
                        key={pIdx}
                        className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/80 shadow-xl shadow-black/40 space-y-5"
                      >
                        {/* Header: Fixed Paten Pod Identity */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-base font-bold text-white tracking-tight font-mono">
                              {`Pod ${pIdx + 1 < 10 ? `0${pIdx + 1}` : pIdx + 1}`}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-800/80 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-mono">
                              Max 8 Members
                            </span>
                          </div>
                        </div>

                        {/* Category Assignment Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                                Ticket Issue Categories Handled by This Pod (AI Routing Scope)
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Select the issue types handled by this pod. Inbound tickets matching these topics will route directly here.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleResetServicesToDefault}
                                title="Reset all categories back to standard industry presets"
                                className="text-[11px] font-mono text-slate-400 hover:text-blue-400 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset Defaults</span>
                              </button>
                              <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-md font-semibold">
                                {pod.services.length} Selected
                              </span>
                            </div>
                          </div>

                          {/* Vertical Stack: Numbered 1 to 6, then 7+ from top to bottom */}
                          <div className="space-y-2">
                            {availableServices.map((svc, sIdx) => {
                              const isChecked = pod.services.includes(svc);
                              const indexNumber = sIdx + 1 < 10 ? `0${sIdx + 1}` : `${sIdx + 1}`;
                              const isEditingThis = editingServiceIndex === sIdx;

                              if (isEditingThis) {
                                return (
                                  <div
                                    key={`${svc}-${sIdx}`}
                                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-blue-500/80 shadow-md flex items-center gap-3"
                                  >
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50 shrink-0">
                                      {indexNumber}
                                    </span>
                                    <input
                                      type="text"
                                      value={editingServiceText}
                                      onChange={(e) => setEditingServiceText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveEditService(sIdx);
                                        } else if (e.key === 'Escape') {
                                          setEditingServiceIndex(null);
                                        }
                                      }}
                                      className="flex-1 bg-[#0B0F19] border border-blue-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden font-medium"
                                      autoFocus
                                    />
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditService(sIdx)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-all cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingServiceIndex(null)}
                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-md transition-all cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`${svc}-${sIdx}`}
                                  onClick={() => handleToggleServiceForPod(pIdx, svc)}
                                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border group ${
                                    isChecked
                                      ? 'bg-blue-950/30 border-blue-500/70 text-white shadow-sm ring-1 ring-blue-500/30'
                                      : 'bg-[#111827]/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#111827]'
                                  }`}
                                >
                                  {/* Left: Index Number */}
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                                      isChecked
                                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 group-hover:text-slate-300'
                                    }`}
                                  >
                                    {indexNumber}
                                  </span>

                                  {/* Middle: Service Name */}
                                  <span className="flex-1 text-xs font-semibold tracking-wide truncate">
                                    {svc}
                                  </span>

                                  {/* Actions: Rename & Delete buttons */}
                                  <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditService(sIdx, svc);
                                      }}
                                      title="Rename this category"
                                      className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Delete button: ONLY available for custom added categories (index 6+, #07 onwards) */}
                                    {sIdx >= 6 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteService(sIdx, svc);
                                        }}
                                        title="Delete this custom category"
                                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Right: Checklist Checkbox */}
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                                      isChecked
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/40'
                                        : 'border-slate-700 bg-slate-800/40 group-hover:border-slate-600'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
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
                  title="Back to Member Capacity Selection (Step 2)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
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
                      <span>Creating Organization &amp; Tokens...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Organization &amp; Generate Leader Tokens</span>
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
                  Organization Successfully Created!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  Before proceeding to the Super Admin Executive Cockpit, please distribute the activation tokens below to each respective Pod Leader.
                  <br />
                  <strong className="text-blue-400">Security Notice:</strong> Each token below is <strong>Single-Use (can only be claimed once)</strong>.
                </p>
              </div>

              {/* Leader Tokens Grid */}
              <div className="space-y-3.5">
                {generatedLeaderTokens.map((item, idx) => {
                  const isCopied = copiedToken === item.token;
                  const waText = encodeURIComponent(
                    `Hello, you have been appointed as the Leader for ${item.workspaceName} on Sentirix. Please activate your account and configure your team quota using this link: ${item.joinUrl}`,
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
                          Services: {item.services.join(', ') || 'General'}
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
                          <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
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
                          title="Regenerate token if the prospective leader needs a fresh link"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              regeneratingToken === item.token ? 'animate-spin text-blue-400' : ''
                            }`}
                          />
                          <span>{regeneratingToken === item.token ? 'Processing...' : 'Regenerate'}</span>
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
                  <span>Done Sharing ➔ Enter Super Admin Executive Cockpit</span>
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
