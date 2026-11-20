'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  SlidersHorizontal,
  Layers,
  Info,
  AlertCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Plus,
  Check,
  Copy,
  Share2,
  ExternalLink,
  RefreshCw,
  Lock,
  RotateCcw,
  GitFork,
} from 'lucide-react';
import { getSession, setSession, logoutUser, UserSession } from '../../lib/auth';
import {
  generatePodsForIndustry,
  setupMultiPodV2,
  regenerateToken,
  fetchSuperAdminCockpit,
  fetchPendingLeaderTokens,
  completeOnboarding,
  validateServiceSemantic,
  checkMemberStatus,
  saveOnboardingDraft,
  fetchOnboardingDraft,
  deleteOnboardingDraft,
} from '../../lib/api';

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

const CORPORATE_ACRONYMS = new Set([
  'PT', 'CV', 'UD', 'TBK', 'LLC', 'LTD', 'GMBH', 'PTE', 'USA', 'UK', 'ID', 'BCA', 'BRI', 'BNI', 'IBM', 'AWS', 'NASA', 'SAP', 'AI', 'IT', 'HQ'
]);

function toCorporateTitleCase(input: string): string {
  if (!input) return '';
  const trailingSpaces = input.match(/\s+$/)?.[0] || '';
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return trailingSpaces;

  const formattedWords = words.map((word) => {
    const upper = word.toUpperCase();
    if (CORPORATE_ACRONYMS.has(upper)) {
      return upper;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return formattedWords.join(' ') + trailingSpaces;
}

function getInitialDraft(): any {
  if (typeof window === 'undefined') return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fresh') === 'true') return null;
    const active = getSession();
    if (active?.onboardingDraft) return active.onboardingDraft;
    if (active?.username) {
      const raw = localStorage.getItem(`sentirix_onboarding_draft_${active.username.toLowerCase()}`);
      if (raw) return JSON.parse(raw);
    }
    if (active?.email) {
      const raw = localStorage.getItem(`sentirix_onboarding_draft_${active.email.toLowerCase()}`);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function getInitialStep(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam && ['1', '2', '3', '4'].includes(stepParam)) {
      return Number(stepParam);
    }
    const draft = getInitialDraft();
    if (draft?.lastActiveStep && draft.lastActiveStep >= 1 && draft.lastActiveStep <= 4) {
      return draft.lastActiveStep;
    }
  } catch {}
  return 1;
}

export default function TitaniumOnboardingPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Stepper State (1: Industry, 2: Capacity Typing, 3: Pods & Multi-Services, 4: Distribution Tokens)
  const [currentStep, setCurrentStep] = useState<number>(getInitialStep);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(() => Math.max(getInitialStep(), getInitialDraft()?.maxUnlockedStep || 1));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Industry
  const [selectedIndustry, setSelectedIndustry] = useState<string>(() => getInitialDraft()?.selectedIndustry || 'ECOMMERCE');
  const [customIndustryText, setCustomIndustryText] = useState<string>(() => getInitialDraft()?.customIndustryText || '');
  const [organizationName, setOrganizationName] = useState<string>(() => getInitialDraft()?.organizationName || '');
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedIndustry === 'OTHER') {
      setTimeout(() => customInputRef.current?.focus(), 60);
    }
  }, [selectedIndustry]);

  // Step 2: Member Input via Typing
  const [typedMembers, setTypedMembers] = useState<number>(() => getInitialDraft()?.typedMembers || 20);

  // Step 3: Pods & Multi-Services
  const [pods, setPods] = useState<PodDraft[]>(() => getInitialDraft()?.pods || []);
  const [availableServices, setAvailableServices] = useState<string[]>(() => getInitialDraft()?.availableServices || []);
  const [newServiceInput, setNewServiceInput] = useState<string>('');
  const [isGeneratingPods, setIsGeneratingPods] = useState<boolean>(false);
  const [editingPodIndex, setEditingPodIndex] = useState<number | null>(null);
  const [newPodName, setNewPodName] = useState<string>('');
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [editingServiceText, setEditingServiceText] = useState<string>('');
  const [isValidatingSemantic, setIsValidatingSemantic] = useState<boolean>(false);
  const [semanticWarning, setSemanticWarning] = useState<{
    original: string;
    proposed: string;
    explanation: string;
    index: number;
  } | null>(null);

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
  const [dispatchedTokens, setDispatchedTokens] = useState<Set<string>>(new Set());
  const [regeneratedTokens, setRegeneratedTokens] = useState<Set<string>>(new Set());

  // Auto-calculated pod count: Math.ceil(typedMembers / 8)
  const calculatedPodCount = Math.max(1, Math.ceil((Number(typedMembers) || 1) / 8));
  const rawFraction = ((Number(typedMembers) || 1) / 8).toFixed(1);

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }

    // Verify user account still exists in database (not wiped or frozen)
    checkMemberStatus(active.id || active.username || active.email).then((isActive) => {
      if (!isActive) {
        logoutUser();
        window.location.href = '/';
      }
    });

    setLocalSession(active);
    setIsVerifying(false);

    // 1. Resilient Step 4 Recovery: Check Postgres Database & LocalStorage
    fetchPendingLeaderTokens(active.username).then((dbRes) => {
      if (dbRes?.hasPendingTokens) {
        // Hydrate all previous step choices from PostgreSQL database so Step 1, 2, 3 remain 100% intact!
        if (dbRes.organizationName) setOrganizationName(dbRes.organizationName);
        if (dbRes.industry) setSelectedIndustry(dbRes.industry);
        if (dbRes.customIndustryDescription) setCustomIndustryText(dbRes.customIndustryDescription);
        if (dbRes.totalSeats) setTypedMembers(dbRes.totalSeats);
        if (dbRes.pods && dbRes.pods.length > 0) {
          setPods(dbRes.pods.map((p) => ({ ...p, description: p.description || '' })));
        }
        if (dbRes.availableServices && dbRes.availableServices.length > 0) setAvailableServices(dbRes.availableServices);
        setMaxUnlockedStep(4);

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const requestedStep = urlParams?.get('step');
        const pendingLocalStorageStep = typeof window !== 'undefined' ? localStorage.getItem('sentirix_onboarding_step') : null;

        // If onboarding is NOT completed in database, or step 4 is requested / stored, stay on Step 4!
        if (!dbRes.onboardingCompleted || requestedStep === '4' || pendingLocalStorageStep === '4') {
          setGeneratedLeaderTokens(dbRes.leaderTokens);
          setCurrentStep(4);

          // Force session promotion to ADMIN with onboardingCompleted: false
          const adminSession: UserSession = {
            ...active,
            role: 'ADMIN',
            onboardingCompleted: false,
          };
          setSession(adminSession);
          setLocalSession(adminSession);

          // Restore dispatched & regenerated tokens
          try {
            localStorage.setItem('sentirix_onboarding_step', '4');
            localStorage.setItem('sentirix_pending_tokens', JSON.stringify(dbRes.leaderTokens));
            const rawDispatched = localStorage.getItem('sentirix_dispatched_tokens');
            if (rawDispatched) setDispatchedTokens(new Set(JSON.parse(rawDispatched)));
            const rawRegenerated = localStorage.getItem('sentirix_regenerated_tokens');
            if (rawRegenerated) setRegeneratedTokens(new Set(JSON.parse(rawRegenerated)));
          } catch {}
          return;
        }
      }

      // If already fully completed onboarding in both session and database, route to cockpit
      if (active.onboardingCompleted && dbRes?.onboardingCompleted) {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('step') !== '2') {
            if (active.role === 'ADMIN' || dbRes?.hasPendingTokens) {
              router.push('/admin/cockpit');
            } else {
              router.push('/dashboard');
            }
            return;
          }
        }
      }
    }).catch(() => {});

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

    // 2. In-Progress Onboarding Draft Restoration (Step 1, 2, 3 autosave recovery)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isFresh = urlParams?.get('fresh') === 'true';
    if (isFresh) {
      const draftKey = `sentirix_onboarding_draft_${active.username.toLowerCase()}`;
      try {
        localStorage.removeItem(draftKey);
        if (active.email) {
          localStorage.removeItem(`sentirix_onboarding_draft_${active.email.toLowerCase()}`);
        }
        localStorage.removeItem('sentirix_onboarding_step');
        localStorage.removeItem('sentirix_pending_tokens');
        localStorage.removeItem('sentirix_dispatched_tokens');
        localStorage.removeItem('sentirix_regenerated_tokens');
      } catch {}
      setCurrentStep(1);
      setMaxUnlockedStep(1);
      setOrganizationName('');
      setPods([]);
      return;
    }

    const requestedStep = urlParams?.get('step');
    if (requestedStep && ['1', '2', '3', '4'].includes(requestedStep)) {
      const stepNum = Number(requestedStep);
      setCurrentStep(stepNum);
      setMaxUnlockedStep((prev) => Math.max(prev, stepNum));
    }

    const draftKey = `sentirix_onboarding_draft_${active.username.toLowerCase()}`;
    const applyDraft = (draft: any) => {
      if (!draft) return;
      if (draft.organizationName) setOrganizationName(draft.organizationName);
      if (draft.selectedIndustry) setSelectedIndustry(draft.selectedIndustry);
      if (draft.customIndustryText) setCustomIndustryText(draft.customIndustryText);
      if (draft.typedMembers) setTypedMembers(draft.typedMembers);
      if (draft.pods && Array.isArray(draft.pods) && draft.pods.length > 0) {
        setPods(draft.pods);
      }
      if (draft.availableServices && Array.isArray(draft.availableServices) && draft.availableServices.length > 0) {
        setAvailableServices(draft.availableServices);
      }
      const isOrgValid = !!(draft.organizationName?.trim() || organizationName.trim());
      const unlocked = Math.max(draft.maxUnlockedStep || 1, draft.lastActiveStep || 1);
      setMaxUnlockedStep((prev) => Math.max(prev, isOrgValid ? unlocked : 1));

      if (!requestedStep && draft.lastActiveStep && draft.lastActiveStep >= 1 && draft.lastActiveStep <= 4) {
        if (draft.lastActiveStep > 1 && !isOrgValid) {
          setCurrentStep(1);
        } else {
          setCurrentStep(draft.lastActiveStep);
        }
      }
    };

    // Apply server-delivered draft from active session first
    if (active.onboardingDraft) {
      applyDraft(active.onboardingDraft);
    }

    try {
      const cached = localStorage.getItem(draftKey);
      if (cached) {
        applyDraft(JSON.parse(cached));
      }
    } catch {}

    fetchOnboardingDraft(active.username).then((serverDraft) => {
      if (serverDraft) {
        applyDraft(serverDraft);
        try {
          localStorage.setItem(draftKey, JSON.stringify(serverDraft));
        } catch {}
      }
    }).catch(() => {});

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

  // Autosave Draft Helper
  const persistDraft = (overrides: Record<string, any> = {}) => {
    const active = session || getSession();
    if (!active?.username) return;
    const uName = active.username.toLowerCase();
    const draftKey = `sentirix_onboarding_draft_${uName}`;

    const draftData = {
      lastActiveStep: overrides.lastActiveStep ?? currentStep,
      maxUnlockedStep: Math.max(maxUnlockedStep, overrides.maxUnlockedStep ?? (overrides.lastActiveStep ?? currentStep)),
      organizationName: overrides.organizationName ?? organizationName,
      selectedIndustry: overrides.selectedIndustry ?? selectedIndustry,
      customIndustryText: overrides.customIndustryText ?? customIndustryText,
      typedMembers: overrides.typedMembers ?? typedMembers,
      pods: overrides.pods ?? pods,
      availableServices: overrides.availableServices ?? availableServices,
      username: active.username,
      email: active.email,
      userId: active.id,
      ...overrides,
    };

    try {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      if (active.email) {
        localStorage.setItem(`sentirix_onboarding_draft_${active.email.toLowerCase()}`, JSON.stringify(draftData));
      }
    } catch {}

    saveOnboardingDraft(active.username, draftData).catch(() => {});
  };

  const handleLogout = async () => {
    const active = session || getSession();
    if (active?.username) {
      const draftData = {
        lastActiveStep: currentStep,
        maxUnlockedStep: Math.max(maxUnlockedStep, currentStep),
        organizationName,
        selectedIndustry,
        customIndustryText,
        typedMembers,
        pods,
        availableServices,
        username: active.username,
        email: active.email,
        userId: active.id,
      };

      try {
        localStorage.setItem(`sentirix_onboarding_draft_${active.username.toLowerCase()}`, JSON.stringify(draftData));
        if (active.email) {
          localStorage.setItem(`sentirix_onboarding_draft_${active.email.toLowerCase()}`, JSON.stringify(draftData));
        }
      } catch {}

      try {
        await saveOnboardingDraft(active.username, draftData);
      } catch {}
    }

    await logoutUser();
    router.push('/');
  };

  // Safety net & Reactive Pod Count Synchronization for Step 3
  useEffect(() => {
    if (currentStep === 3 && !isGeneratingPods) {
      if (pods.length === 0) {
        prepareStep3Pods();
      } else if (pods.length !== calculatedPodCount) {
        syncPodsWithCapacity(calculatedPodCount);
      }
    }
  }, [currentStep, pods.length, calculatedPodCount, isGeneratingPods]);

  // Dynamic Pod Synchronization (Adjusts count to match targetCount while preserving existing pod customizations)
  const syncPodsWithCapacity = (targetCount: number) => {
    if (targetCount < 1) targetCount = 1;
    const preset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustry);
    const services = availableServices.length > 0
      ? availableServices
      : (preset?.defaultServices || CUSTOM_INDUSTRY_DEFAULT_SERVICES);

    let updatedList: PodDraft[] = [];

    setPods((prev) => {
      if (prev.length === targetCount && prev.length > 0) {
        updatedList = prev;
        return prev;
      }

      let current = [...prev];

      // If we need more pods, append new ones without modifying existing configured pods
      if (current.length < targetCount) {
        const usedServices = new Set(current.flatMap((p) => p.services));
        while (current.length < targetCount) {
          const num = current.length + 1;
          const unused = services.find((s) => !usedServices.has(s));
          const fallbackSvc = unused || services[(num - 1) % services.length] || `Core Service #${num}`;
          usedServices.add(fallbackSvc);
          const podLabel = num < 10 ? `Pod 0${num}` : `Pod ${num}`;
          current.push({
            name: podLabel,
            podCategory: 'GENERAL',
            description: `Dedicated operational unit for ${fallbackSvc}`,
            services: [fallbackSvc],
          });
        }
      }
      // If we have more pods than needed, trim the excess from the end
      else if (current.length > targetCount) {
        current = current.slice(0, targetCount);
      }

      updatedList = current;
      return current;
    });

    if (updatedList.length > 0) {
      persistDraft({
        pods: updatedList,
        typedMembers,
        lastActiveStep: 3,
        maxUnlockedStep: Math.max(maxUnlockedStep, 3),
        availableServices: services,
      });
    }

    return updatedList;
  };

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

        // Adjust AI pods count to match calculatedPodCount with mutually exclusive categories
        const usedServices = new Set<string>();
        let targetPods = aiResult.pods.map((p, idx) => {
          let podSvc = p.service?.trim() || p.name.replace(/\s+Pod$/i, '').trim();
          if (!podSvc || usedServices.has(podSvc)) {
            const unused = services.find((s) => !usedServices.has(s));
            podSvc = unused || services[idx % services.length] || `Core Service #${idx + 1}`;
          }
          usedServices.add(podSvc);
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
          const unused = services.find((s) => !usedServices.has(s));
          const fallbackSvc = unused || services[(num - 1) % services.length] || `Core Service #${num}`;
          usedServices.add(fallbackSvc);
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
        persistDraft({
          lastActiveStep: 3,
          maxUnlockedStep: 3,
          typedMembers,
          pods: targetPods,
          availableServices: services,
        });
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
    const usedServices = new Set<string>();
    for (let i = 1; i <= count; i++) {
      const unused = servicesList.find((s) => !usedServices.has(s));
      const defaultSvc = unused || servicesList[(i - 1) % servicesList.length] || `Core Service #${i}`;
      usedServices.add(defaultSvc);
      const podLabel = i < 10 ? `Pod 0${i}` : `Pod ${i}`;
      list.push({
        name: podLabel,
        podCategory: 'GENERAL',
        description: `Dedicated operational unit for ${defaultSvc}`,
        services: [defaultSvc],
      });
    }
    setPods(list);
    persistDraft({
      lastActiveStep: 3,
      maxUnlockedStep: 3,
      typedMembers,
      pods: list,
      availableServices: servicesList,
    });
  };

  const handleNextToStep2 = () => {
    const cleanName = toCorporateTitleCase(organizationName.trim().replace(/\s+/g, ' '));
    if (!cleanName) {
      setErrorMessage('Organization / company name is required.');
      return;
    }
    setOrganizationName(cleanName);
    if (selectedIndustry === 'OTHER' && !customIndustryText.trim()) {
      setErrorMessage('Please describe your industry or line of business.');
      return;
    }
    setErrorMessage(null);
    setMaxUnlockedStep((prev) => Math.max(prev, 2));
    setCurrentStep(2);
    persistDraft({
      lastActiveStep: 2,
      maxUnlockedStep: 2,
      organizationName: cleanName,
      selectedIndustry,
      customIndustryText,
    });
  };

  const handleNextToStep3 = async () => {
    if (!typedMembers || typedMembers < 1) {
      setErrorMessage('Please enter at least 1 team member.');
      return;
    }
    setErrorMessage(null);
    setMaxUnlockedStep((prev) => Math.max(prev, 3));
    setCurrentStep(3);
    // If no pods exist yet, generate fresh pods. If count mismatch, dynamically sync without losing customizations!
    if (pods.length === 0) {
      await prepareStep3Pods();
    } else if (pods.length !== calculatedPodCount) {
      syncPodsWithCapacity(calculatedPodCount);
    } else {
      persistDraft({
        lastActiveStep: 3,
        maxUnlockedStep: 3,
        typedMembers,
        pods,
        availableServices,
      });
    }
  };

  const handleToggleServiceForPod = (podIndex: number, serviceName: string) => {
    if (errorMessage) setErrorMessage(null);

    let nextPods: PodDraft[] = [];
    setPods((prev) => {
      nextPods = prev.map((pod, idx) => {
        if (idx !== podIndex) return pod;
        const exists = pod.services.includes(serviceName);
        const updated = exists
          ? pod.services.filter((s) => s !== serviceName)
          : [...pod.services, serviceName];
        return { ...pod, services: updated };
      });
      return nextPods;
    });
    persistDraft({ pods: nextPods, lastActiveStep: 3, maxUnlockedStep: 3 });
  };

  const handleAddGlobalService = () => {
    if (!newServiceInput.trim()) return;
    const clean = newServiceInput.trim();
    const alreadyExists = availableServices.some(
      (s) => s.toLowerCase() === clean.toLowerCase(),
    );
    if (!alreadyExists) {
      const updatedServices = [...availableServices, clean];
      setAvailableServices(updatedServices);
      persistDraft({ availableServices: updatedServices, lastActiveStep: 3, maxUnlockedStep: 3 });
    }
    setNewServiceInput('');
  };

  const handleSavePodName = (index: number) => {
    if (!newPodName.trim()) return;
    const cleanName = newPodName.replace(/\s+Pod$/i, '').trim();
    let updatedPods: PodDraft[] = [];
    setPods((prev) => {
      updatedPods = prev.map((p, idx) => (idx === index ? { ...p, name: cleanName } : p));
      return updatedPods;
    });
    setEditingPodIndex(null);
    setNewPodName('');
    persistDraft({ pods: updatedPods, lastActiveStep: 3, maxUnlockedStep: 3 });
  };

  const handleStartEditService = (index: number, currentText: string) => {
    setEditingServiceIndex(index);
    setEditingServiceText(currentText);
    setSemanticWarning(null);
  };

  const handleSaveEditService = async (index: number) => {
    if (!editingServiceText.trim()) return;
    const oldText = availableServices[index];
    const newText = editingServiceText.trim();
    if (!oldText) return;

    // AI Semantic Guardian: Validate that renaming baseline categories (0-5) preserves the core domain
    if (index < 6 && oldText.toLowerCase() !== newText.toLowerCase()) {
      try {
        setIsValidatingSemantic(true);
        setErrorMessage(null);
        const check = await validateServiceSemantic({
          originalService: oldText,
          newServiceName: newText,
          industry: selectedIndustry,
        });

        if (check && !check.isCompatible) {
          setSemanticWarning({
            original: oldText,
            proposed: newText,
            explanation:
              check.explanation ||
              'The proposed name diverges from the core functional scope of this baseline category.',
            index,
          });
          setIsValidatingSemantic(false);
          return;
        }
      } catch {
        // Fallback allow if network failure
      } finally {
        setIsValidatingSemantic(false);
      }
    }

    const updatedServices = availableServices.map((s, idx) => (idx === index ? newText : s));
    const updatedPods = pods.map((pod) => ({
      ...pod,
      services: pod.services.map((s) => (s === oldText ? newText : s)),
    }));

    setAvailableServices(updatedServices);
    setPods(updatedPods);
    persistDraft({
      availableServices: updatedServices,
      pods: updatedPods,
      lastActiveStep: 3,
      maxUnlockedStep: 3,
    });

    setEditingServiceIndex(null);
    setEditingServiceText('');
    setSemanticWarning(null);
  };

  const handleAddDivergentAsNewCategory = (proposedName: string) => {
    const clean = proposedName.trim();
    if (clean) {
      if (!availableServices.some((s) => s.toLowerCase() === clean.toLowerCase())) {
        const updatedServices = [...availableServices, clean];
        setAvailableServices(updatedServices);
        persistDraft({
          availableServices: updatedServices,
          lastActiveStep: 3,
          maxUnlockedStep: 3,
        });
      }
    }
    setEditingServiceIndex(null);
    setEditingServiceText('');
    setSemanticWarning(null);
  };

  const handleDeleteService = (index: number, serviceName: string) => {
    // Safety guard: Protect default industry baseline categories (0-5)
    if (index < 6) return;

    const updatedServices = availableServices.filter((_, idx) => idx !== index);
    const updatedPods = pods.map((pod) => ({
      ...pod,
      services: pod.services.filter((s) => s !== serviceName),
    }));

    setAvailableServices(updatedServices);
    setPods(updatedPods);
    persistDraft({
      availableServices: updatedServices,
      pods: updatedPods,
      lastActiveStep: 3,
      maxUnlockedStep: 3,
    });

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
    const updatedServices = [...defaults, ...customServices];
    setAvailableServices(updatedServices);
    setEditingServiceIndex(null);
    setEditingServiceText('');

    // Re-seed pods with mutually exclusive unique default categories
    const used = new Set<string>();
    const updatedPods = pods.map((pod, idx) => {
      const unused = updatedServices.find((s) => !used.has(s));
      const chosen = unused || updatedServices[idx % updatedServices.length] || `Core Service #${idx + 1}`;
      used.add(chosen);
      return {
        ...pod,
        services: [chosen],
      };
    });
    setPods(updatedPods);

    persistDraft({
      availableServices: updatedServices,
      pods: updatedPods,
      lastActiveStep: 3,
      maxUnlockedStep: 3,
    });
  };

  const handleFinalSubmit = async () => {
    if (!session?.username) return;

    // Safety validation: Ensure every pod has at least 1 ticket category assigned
    const emptyPod = pods.find((p) => p.services.length === 0);
    if (emptyPod) {
      setErrorMessage(`Each pod must have at least 1 ticket category assigned (${emptyPod.name} is currently empty).`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        identifier: session.username,
        organizationName: toCorporateTitleCase(organizationName.trim().replace(/\s+/g, ' ')),
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

      // Update session: PROMOTE TO ADMIN, but DO NOT complete onboarding yet!
      const updatedSession: UserSession = {
        ...session,
        role: 'ADMIN',
        onboardingCompleted: false,
      };
      setSession(updatedSession);
      setLocalSession(updatedSession);

      // Persist Step 4 and Tokens to localStorage so accidental close / battery death resumes here
      const tokens = res.leaderTokens || [];
      setGeneratedLeaderTokens(tokens);
      try {
        localStorage.setItem('sentirix_onboarding_step', '4');
        localStorage.setItem('sentirix_pending_tokens', JSON.stringify(tokens));
      } catch {}

      setCurrentStep(4);
      setMaxUnlockedStep((prev) => Math.max(prev, 4));
      persistDraft({ lastActiveStep: 4, maxUnlockedStep: 4 });
    } catch {
      setErrorMessage('A network error occurred while connecting to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (token: string, joinUrl: string) => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedToken(token);

    // Lock this token so it cannot be re-copied without regenerating
    setDispatchedTokens((prev) => {
      const next = new Set(prev).add(token);
      try {
        localStorage.setItem('sentirix_dispatched_tokens', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRegenerateLeaderToken = async (oldToken: string, workspaceId?: string) => {
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken, undefined, workspaceId);
      if (res.success && res.newToken) {
        const freshToken = res.newToken;
        const freshJoinUrl = res.joinUrl!;

        // 1. Update token in state & storage
        setGeneratedLeaderTokens((prev) => {
          const updated = prev.map((t) =>
            t.token === oldToken || (workspaceId && t.workspaceId === workspaceId)
              ? { ...t, token: freshToken, joinUrl: freshJoinUrl }
              : t,
          );
          try {
            localStorage.setItem('sentirix_pending_tokens', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // 2. Unlock this new token from dispatched/locked set (so it can be copied)
        setDispatchedTokens((prev) => {
          const next = new Set(prev);
          next.delete(oldToken);
          next.delete(freshToken);
          try {
            localStorage.setItem('sentirix_dispatched_tokens', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });

        // 3. Mark the fresh token as regenerated (to change button background)
        setRegeneratedTokens((prev) => {
          const next = new Set(prev).add(freshToken);
          try {
            localStorage.setItem('sentirix_regenerated_tokens', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });
      } else {
        setErrorMessage(res.error || 'Failed to regenerate token.');
      }
    } catch {
      setErrorMessage('A network error occurred.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  const handleDoneSharing = async () => {
    const active = getSession();
    if (active) {
      const finalSession: UserSession = {
        ...active,
        role: 'ADMIN',
        onboardingCompleted: true,
      };
      setSession(finalSession);
      try {
        await completeOnboarding(active.username);
      } catch {}
      try {
        await deleteOnboardingDraft(active.username);
      } catch {}
      try {
        const uName = active.username.toLowerCase();
        localStorage.removeItem(`sentirix_onboarding_draft_${uName}`);
      } catch {}
    }
    try {
      localStorage.removeItem('sentirix_onboarding_step');
      localStorage.removeItem('sentirix_pending_tokens');
      localStorage.removeItem('sentirix_dispatched_tokens');
      localStorage.removeItem('sentirix_regenerated_tokens');
    } catch {}

    router.push('/admin/cockpit');
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
        {/* Top Header Bar: Logo & Branding */}
        <div className="flex items-center mb-4 px-1">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-white p-0.5 flex items-center justify-center shadow-md">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">Sentirix</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              AI COPILOT
            </span>
          </div>
        </div>

        {/* Header Breadcrumbs */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {currentStep === 4 ? 'Leader Activation & Token Distribution' : 'Multi-Pod Architecture Setup'}
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl mx-auto">
            {currentStep === 4
              ? 'Distribute single-use activation tokens to each Pod Leader before proceeding to the Executive Cockpit.'
              : (
                <>
                  Build an agile, high-velocity customer support structure without inter-departmental friction <span className="whitespace-nowrap">across all teams.</span>
                </>
              )}
          </p>

          {/* Stepper Dots (Interactive & Clickable for Unlocked Steps) */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { num: 1, label: 'Industry' },
              { num: 2, label: 'Capacity' },
              { num: 3, label: 'Pods & Services' },
              { num: 4, label: 'Leader Tokens' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              // Strict validation chain: Step 1 name is a mandatory prerequisite for ALL subsequent steps!
              const isStep1Valid = organizationName.trim().length > 0 && (selectedIndustry !== 'OTHER' || customIndustryText.trim().length > 0);
              const isStep2Valid = isStep1Valid && Number(typedMembers) >= 1;
              const isStep3Valid = isStep2Valid && pods.length > 0;

              let isUnlocked = false;
              if (step.num === 1) {
                isUnlocked = true;
              } else if (step.num === 2) {
                isUnlocked = isStep1Valid && maxUnlockedStep >= 2;
              } else if (step.num === 3) {
                isUnlocked = isStep1Valid && isStep2Valid && maxUnlockedStep >= 3;
              } else if (step.num === 4) {
                isUnlocked = isStep1Valid && isStep2Valid && isStep3Valid && (maxUnlockedStep >= 4 || generatedLeaderTokens.length > 0);
              }

              const handleStepClick = () => {
                if (!isUnlocked) {
                  if (!isStep1Valid) {
                    setErrorMessage('Organization / company name is required before proceeding to further steps.');
                  }
                  return;
                }
                setErrorMessage(null);
                if (step.num === 3 && pods.length !== calculatedPodCount) {
                  syncPodsWithCapacity(calculatedPodCount);
                }
                setCurrentStep(step.num);
                persistDraft({ lastActiveStep: step.num });
              };

              return (
                <div key={step.num} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={handleStepClick}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                        : isUnlocked
                        ? isPast
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-110 shadow-sm'
                          : 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/50 cursor-pointer hover:scale-110'
                        : 'bg-[#111827] text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
                    }`}
                    title={
                      isUnlocked
                        ? `Navigate directly to Step ${step.num}: ${step.label}`
                        : !isStep1Valid && step.num > 1
                        ? `Step ${step.num} is locked until organization name is entered`
                        : `Step ${step.num} is locked until previous steps are completed`
                    }
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </button>
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={handleStepClick}
                    className={`text-xs hidden sm:inline font-medium transition-colors ${
                      isActive
                        ? 'text-white font-bold'
                        : isUnlocked
                        ? isPast
                          ? 'text-slate-300 hover:text-white cursor-pointer'
                          : 'text-blue-300 hover:text-white cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {step.label}
                  </button>
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
                    const formatted = toCorporateTitleCase(e.target.value);
                    setOrganizationName(formatted);
                    if (errorMessage && formatted.trim()) setErrorMessage(null);
                    persistDraft({ organizationName: formatted, lastActiveStep: 1 });
                  }}
                  onBlur={() => {
                    const formatted = toCorporateTitleCase(organizationName.trim().replace(/\s+/g, ' '));
                    setOrganizationName(formatted);
                    persistDraft({ organizationName: formatted, lastActiveStep: 1 });
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
                        persistDraft({ selectedIndustry: ind.id, lastActiveStep: 1 });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? 'bg-[#1E293B] border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                          : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${ind.accentColor}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white tracking-tight">{ind.name}</h3>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 13th Option: Custom Industry / AI Architect Unified Card */}
              <div
                onClick={() => {
                  setSelectedIndustry('OTHER');
                  if (errorMessage) setErrorMessage(null);
                  persistDraft({ selectedIndustry: 'OTHER', lastActiveStep: 1 });
                  setTimeout(() => customInputRef.current?.focus(), 50);
                }}
                className={`rounded-xl border text-left transition-all cursor-pointer p-4 ${
                  selectedIndustry === 'OTHER'
                    ? 'bg-[#1E293B] border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/40 text-indigo-400 shrink-0">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white tracking-tight">Custom Industry / Other Sector</h3>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          CUSTOM SETUP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {selectedIndustry === 'OTHER' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>

                {/* Inline Input automatically revealed inside the card when active */}
                {selectedIndustry === 'OTHER' && (
                  <div
                    className="mt-3.5 pt-3.5 border-t border-slate-700/60 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Specify Your Unique Business Domain</span>
                    </label>
                    <input
                      ref={customInputRef}
                      type="text"
                      value={customIndustryText}
                      onChange={(e) => setCustomIndustryText(e.target.value)}
                      onBlur={() => {
                        persistDraft({ customIndustryText, lastActiveStep: 1 });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNextToStep2();
                        }
                      }}
                      placeholder="e.g., Autonomous Agricultural Drones, Renewable Energy Logistics..."
                      className="w-full bg-[#0B0F19] border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/40 transition-all font-medium"
                    />
                  </div>
                )}
              </div>

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
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const nextVal = isNaN(val) ? 1 : Math.max(1, val);
                        setTypedMembers(nextVal);
                        persistDraft({ typedMembers: nextVal, lastActiveStep: 2 });
                      }}
                      className="w-full bg-[#111827] border-2 border-blue-500/60 focus:border-blue-400 text-white text-2xl font-black rounded-xl px-4 py-3 text-center tracking-wide focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 transition-all font-mono"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">Team Members</span>
                </div>

                {/* Professional Operational Rationale Text */}
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  With <span className="font-bold text-white">{typedMembers} total members</span>, your team will be structured into <span className="font-bold text-emerald-400">{calculatedPodCount} pods</span> to maintain an optimal span of control and ensure high-velocity issue resolution.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(1);
                    persistDraft({ lastActiveStep: 1 });
                  }}
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
                  Assign customer issue categories to your {calculatedPodCount} operational pods. Pods can operate exclusively or share high-volume scopes with dynamic AI load balancing.
                </p>
              </div>

              {/* Quick Add Custom Service Tag - American Corporate Style */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/90 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Plus className="w-4 h-4 text-blue-400" />
                      Add Custom Ticket Category
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter a new service specialization or customer complaint category. It will appear for all pods below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetServicesToDefault}
                    title="Reset all categories back to standard industry presets"
                    className="text-[11px] font-mono text-slate-400 hover:text-blue-400 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
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
                            <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold">
                              {pod.services.length} Categories Selected
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-800/80 border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-mono">
                              Max 8 Members
                            </span>
                          </div>
                        </div>

                        {/* Vertical Stack: Numbered 1 to 6, then 7+ from top to bottom */}
                        <div className="space-y-2">
                            {availableServices.map((svc, sIdx) => {
                              const isChecked = pod.services.includes(svc);
                              const otherPodsSharing = pods.filter((p, idx) => idx !== pIdx && p.services.includes(svc));
                              const isCoveredByOther = otherPodsSharing.length > 0;
                              const otherPodNames = otherPodsSharing.map((p) => p.name).join(', ');
                              const indexNumber = sIdx + 1 < 10 ? `0${sIdx + 1}` : `${sIdx + 1}`;
                              const isEditingThis = editingServiceIndex === sIdx;

                              if (isEditingThis) {
                                return (
                                  <div key={`${svc}-${sIdx}`} className="space-y-2">
                                    <div className="w-full p-2.5 rounded-xl bg-[#111827] border border-blue-500/80 shadow-md flex items-center gap-3">
                                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50 shrink-0">
                                        {indexNumber}
                                      </span>
                                      <input
                                        type="text"
                                        value={editingServiceText}
                                        onChange={(e) => {
                                          setEditingServiceText(e.target.value);
                                          if (semanticWarning) setSemanticWarning(null);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveEditService(sIdx);
                                          } else if (e.key === 'Escape') {
                                            setEditingServiceIndex(null);
                                            setSemanticWarning(null);
                                          }
                                        }}
                                        className="flex-1 bg-[#0B0F19] border border-blue-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden font-medium"
                                        autoFocus
                                      />
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          disabled={isValidatingSemantic}
                                          onClick={() => handleSaveEditService(sIdx)}
                                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                          {isValidatingSemantic ? (
                                            <>
                                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              <span>Checking...</span>
                                            </>
                                          ) : (
                                            <span>Save</span>
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingServiceIndex(null);
                                            setSemanticWarning(null);
                                          }}
                                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-md transition-all cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>

                                    {/* AI Semantic Guardian Divergence Warning Dialog - Corporate American Style */}
                                    {semanticWarning && semanticWarning.index === sIdx && (
                                      <div className="p-4 rounded-xl bg-[#13110C] border border-amber-500/80 text-amber-200 text-xs space-y-3 animate-fadeIn shadow-2xl ring-1 ring-amber-500/20">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertTriangle className="w-4 h-4" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-bold text-white text-xs tracking-tight">
                                                Operational Scope Notice
                                              </h4>
                                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">
                                                AI GOVERNANCE
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                                              {semanticWarning.explanation}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                                          <button
                                            type="button"
                                            onClick={() => handleAddDivergentAsNewCategory(semanticWarning.proposed)}
                                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                                          >
                                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                            <span>+ Add as New Category</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingServiceText(semanticWarning.original);
                                              setSemanticWarning(null);
                                            }}
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                                            title="Restore the baseline category name"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Revert to Original Name</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`${svc}-${sIdx}`}
                                  onClick={() => handleToggleServiceForPod(pIdx, svc)}
                                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-3 border group cursor-pointer ${
                                    isChecked
                                      ? isCoveredByOther
                                        ? 'bg-indigo-950/25 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                                        : 'bg-blue-950/30 border-blue-500/70 text-white shadow-sm ring-1 ring-blue-500/30'
                                      : 'bg-[#111827]/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#111827]'
                                  }`}
                                  title={
                                    isChecked
                                      ? isCoveredByOther
                                        ? `Click to remove from this pod (currently shared with ${otherPodNames})`
                                        : 'Click to remove from this pod'
                                      : isCoveredByOther
                                      ? `Click to assign to this pod and enable AI load balancing with ${otherPodNames}`
                                      : 'Click to assign to this pod'
                                  }
                                >
                                  {/* Left: Index Number */}
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                                      isChecked
                                        ? isCoveredByOther
                                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                                          : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
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

                                  {/* Right Section: Inline Shared Scope Badge (if shared or covered) + Checkbox */}
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    {isChecked && isCoveredByOther ? (
                                      <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1527] border border-cyan-500/30 text-[10px] font-mono shadow-xs shrink-0 select-none transition-all group-hover:border-cyan-500/50"
                                        title={`Shared with ${otherPodNames}: Inbound tickets will be dynamically balanced by AI Triage based on real-time agent availability.`}
                                      >
                                        <GitFork className="w-3 h-3 text-cyan-400 shrink-0" />
                                        <span className="text-slate-300 font-semibold tracking-wide uppercase">
                                          SHARED SCOPE &bull; {otherPodNames}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                                        <span className="text-cyan-300 font-bold uppercase tracking-wider text-[9px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/25">
                                          AI BALANCED
                                        </span>
                                      </div>
                                    ) : !isChecked && isCoveredByOther ? (
                                      <div
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0 select-none group-hover:border-slate-700 transition-colors"
                                        title={`Covered by ${otherPodNames}. Click checkbox to include this pod in shared load balancing.`}
                                      >
                                        <GitFork className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="text-slate-400 font-medium">Covered by {otherPodNames}</span>
                                        <span className="text-[9px] text-slate-500">&bull; Click to share</span>
                                      </div>
                                    ) : null}

                                    {/* Checkbox */}
                                    <div
                                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                                        isChecked
                                          ? isCoveredByOther
                                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-400 text-white shadow-md shadow-indigo-500/30'
                                            : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/40'
                                          : 'border-slate-700 bg-slate-800/40 group-hover:border-slate-600'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(2);
                    persistDraft({ lastActiveStep: 2 });
                  }}
                  title="Back to Member Capacity Selection (Step 2)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={
                    generatedLeaderTokens.length > 0
                      ? () => {
                          setCurrentStep(4);
                          persistDraft({ lastActiveStep: 4 });
                        }
                      : handleFinalSubmit
                  }
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Organization &amp; Tokens...</span>
                    </>
                  ) : generatedLeaderTokens.length > 0 ? (
                    <>
                      <span>Continue to Leader Tokens (Step 4)</span>
                      <ArrowRight className="w-4 h-4" />
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
                  const isDispatched = dispatchedTokens.has(item.token);
                  const isRegenerated = regeneratedTokens.has(item.token);

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
                          {isDispatched ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-blue-400" />
                              LINK DISPATCHED • LOCKED
                            </span>
                          ) : isRegenerated ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              REGENERATED • SINGLE-USE
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                              SINGLE-USE • UNCLAIMED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>Token:</span>
                          <span className="text-blue-300 font-bold bg-[#111827] px-2 py-0.5 rounded border border-slate-800">
                            {item.token}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Copy Link & Regenerate (Side-by-side, no blinking) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isDispatched}
                          onClick={() => handleCopyLink(item.token, item.joinUrl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isDispatched
                              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                              : isCopied
                              ? 'bg-emerald-600 border-emerald-500 text-white cursor-pointer'
                              : 'bg-[#111827] border-slate-800 text-slate-200 hover:border-slate-700 cursor-pointer'
                          }`}
                          title={
                            isDispatched
                              ? 'This single-use link has been copied & locked to prevent duplicate claims. Click Regenerate to issue a fresh link.'
                              : 'Copy single-use invite link'
                          }
                        >
                          {isDispatched ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copied (Locked)</span>
                            </>
                          ) : isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={regeneratingToken === item.token}
                          onClick={() => handleRegenerateLeaderToken(item.token, item.workspaceId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border disabled:opacity-50 ${
                            regeneratingToken === item.token
                              ? 'bg-slate-900 border-slate-800 text-slate-400'
                              : isRegenerated
                              ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 hover:bg-amber-500/30 shadow-sm shadow-amber-500/20'
                              : isDispatched
                              ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-600/20'
                              : 'bg-[#111827] border-blue-500/40 hover:border-blue-400 text-blue-300'
                          }`}
                          title="Invalidates previous link and generates a brand new single-use token"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              regeneratingToken === item.token ? 'animate-spin text-blue-400' : ''
                            }`}
                          />
                          <span>
                            {regeneratingToken === item.token
                              ? 'Processing...'
                              : isRegenerated
                              ? 'Regenerated ✓'
                              : isDispatched
                              ? 'Regenerate New Link'
                              : 'Regenerate'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: Back to Step 3 & Done Sharing */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(3);
                    persistDraft({ lastActiveStep: 3 });
                  }}
                  title="Back to Pod Architecture Setup (Step 3)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleDoneSharing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                >
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
