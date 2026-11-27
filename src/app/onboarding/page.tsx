'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  AlertCircle,
} from 'lucide-react';
import { getSession, setSession, logoutUser, UserSession } from '../../lib/auth';
import type { OnboardingDraft } from '../../lib/types';
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
import {
  INDUSTRY_PRESETS,
  CUSTOM_INDUSTRY_DEFAULT_SERVICES,
  type PodDraft,
  type LeaderTokenPreview,
  type SemanticWarningState,
  toCorporateTitleCase,
} from '../../components/onboarding/onboarding.constants';
import { OnboardingStep1Industry } from '../../components/onboarding/OnboardingStep1Industry';
import { OnboardingStep2Capacity } from '../../components/onboarding/OnboardingStep2Capacity';
import { OnboardingStep3Pods } from '../../components/onboarding/OnboardingStep3Pods';
import { OnboardingStep4Tokens } from '../../components/onboarding/OnboardingStep4Tokens';

function getInitialDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fresh') === 'true') return null;
    const active = getSession();
    if (active?.onboardingDraft) return active.onboardingDraft;
    if (active?.username) {
      const raw = localStorage.getItem(`sevaniq_onboarding_draft_${active.username.toLowerCase()}`);
      if (raw) return JSON.parse(raw) as OnboardingDraft;
    }
    if (active?.email) {
      const raw = localStorage.getItem(`sevaniq_onboarding_draft_${active.email.toLowerCase()}`);
      if (raw) return JSON.parse(raw) as OnboardingDraft;
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

  // Step 2: Member Input via Typing & Locked Capacity Allocation
  const [typedMembers, setTypedMembers] = useState<number>(() => getInitialDraft()?.typedMembers || 20);
  const [isCapacityLocked, setIsCapacityLocked] = useState<boolean>(() => Boolean(getInitialDraft()?.isCapacityLocked));

  // Step 3: Pods & Multi-Services
  const [pods, setPods] = useState<PodDraft[]>(() => getInitialDraft()?.pods || []);
  const [availableServices, setAvailableServices] = useState<string[]>(() => getInitialDraft()?.availableServices || []);
  const [newServiceInput, setNewServiceInput] = useState<string>('');
  const [isGeneratingPods, setIsGeneratingPods] = useState<boolean>(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [editingServiceText, setEditingServiceText] = useState<string>('');
  const [isValidatingSemantic, setIsValidatingSemantic] = useState<boolean>(false);
  const [semanticWarning, setSemanticWarning] = useState<SemanticWarningState | null>(null);

  // Step 4: Submission & Single-Use Leader Tokens Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedLeaderTokens, setGeneratedLeaderTokens] = useState<LeaderTokenPreview[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [dispatchedTokens, setDispatchedTokens] = useState<Set<string>>(new Set());
  const [regeneratedTokens, setRegeneratedTokens] = useState<Set<string>>(new Set());

  // Auto-calculated pod count: Math.ceil(typedMembers / 8)
  const calculatedPodCount = Math.max(1, Math.ceil((Number(typedMembers) || 1) / 8));
  const rawFraction = ((Number(typedMembers) || 1) / 8).toFixed(1);

  // Step 2 Locked Capacity Allocation Logic
  const calculateBalancedSeats = (totalMembers: number, podCount: number): number[] => {
    if (podCount <= 0) return [];
    const base = Math.floor(totalMembers / podCount);
    const remainder = totalMembers % podCount;
    const result: number[] = [];
    for (let i = 0; i < podCount; i++) {
      result.push(base + (i < remainder ? 1 : 0));
    }
    return result;
  };

  const handleLockCapacity = () => {
    if (!typedMembers || typedMembers < 1) {
      setErrorMessage('Please specify at least 1 team member.');
      return;
    }
    setErrorMessage(null);
    const podCount = Math.max(1, Math.ceil(typedMembers / 8));
    const balanced = calculateBalancedSeats(typedMembers, podCount);

    const preset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustry);
    const services = availableServices.length > 0
      ? availableServices
      : (preset?.defaultServices || CUSTOM_INDUSTRY_DEFAULT_SERVICES);

    let updatedPods: PodDraft[] = [];
    if (pods.length === podCount && pods.length > 0) {
      updatedPods = pods.map((p, idx) => ({
        ...p,
        seats: p.seats && p.seats >= 1 ? p.seats : balanced[idx],
      }));
      const currentSum = updatedPods.reduce((sum, p) => sum + (p.seats || 0), 0);
      if (currentSum !== typedMembers) {
        updatedPods = updatedPods.map((p, idx) => ({
          ...p,
          seats: balanced[idx],
        }));
      }
    } else {
      updatedPods = [];
      for (let i = 0; i < podCount; i++) {
        const podNum = i + 1;
        const podLabel = podNum < 10 ? `Pod 0${podNum}` : `Pod ${podNum}`;
        const svc = services[i % services.length] || `Core Service #${podNum}`;
        const existingPod = pods[i];
        updatedPods.push({
          name: existingPod?.name || podLabel,
          podCategory: existingPod?.podCategory || 'GENERAL',
          description: existingPod?.description || `Dedicated operational unit for ${svc}`,
          services: existingPod?.services && existingPod.services.length > 0 ? existingPod.services : [svc],
          seats: balanced[i],
        });
      }
    }

    setPods(updatedPods);
    setIsCapacityLocked(true);
    persistDraft({
      typedMembers,
      isCapacityLocked: true,
      pods: updatedPods,
      lastActiveStep: 2,
    });
  };

  const handleUnlockCapacity = () => {
    setIsCapacityLocked(false);
    setErrorMessage(null);
    persistDraft({
      isCapacityLocked: false,
      lastActiveStep: 2,
    });
  };

  const handleAdjustPodSeats = (podIndex: number, delta: number) => {
    setPods((prev) => {
      const next = prev.map((p, idx) => {
        if (idx !== podIndex) return p;
        const currentSeats = p.seats || Math.floor(typedMembers / prev.length) || 1;
        const nextSeats = Math.min(8, Math.max(1, currentSeats + delta));
        return { ...p, seats: nextSeats };
      });
      persistDraft({ pods: next, isCapacityLocked: true, lastActiveStep: 2 });
      return next;
    });
  };

  const handleResetPodSeatsToBalanced = () => {
    const podCount = Math.max(1, Math.ceil(typedMembers / 8));
    const balanced = calculateBalancedSeats(typedMembers, podCount);
    setPods((prev) => {
      const next = prev.map((p, idx) => ({
        ...p,
        seats: balanced[idx] || 1,
      }));
      persistDraft({ pods: next, isCapacityLocked: true, lastActiveStep: 2 });
      return next;
    });
  };

  const totalAllocatedSeats = pods.reduce((sum, p) => sum + (p.seats || 0), 0);
  const isAllocationBalanced = isCapacityLocked && totalAllocatedSeats === typedMembers;

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      const active = getSession();
      if (!active) {
        router.push('/');
        return;
      }

      setLocalSession(active);
      setIsVerifying(false);

      // 1. Resilient Step 4 Recovery: Check Postgres Database & LocalStorage
      fetchPendingLeaderTokens(active.username).then((dbRes) => {
        if (cancelled) return;
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
          const pendingLocalStorageStep = typeof window !== 'undefined' ? localStorage.getItem('sevaniq_onboarding_step') : null;

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
              localStorage.setItem('sevaniq_onboarding_step', '4');
              localStorage.setItem('sevaniq_pending_tokens', JSON.stringify(dbRes.leaderTokens));
              const rawDispatched = localStorage.getItem('sevaniq_dispatched_tokens');
              if (rawDispatched) setDispatchedTokens(new Set(JSON.parse(rawDispatched)));
              const rawRegenerated = localStorage.getItem('sevaniq_regenerated_tokens');
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
        const planned = localStorage.getItem('sevaniq_planned_capacity');
        if (planned) {
          const num = Number(planned);
          if (!isNaN(num) && num >= 1) {
            setTypedMembers(num);
          }
          localStorage.removeItem('sevaniq_planned_capacity');
        }
      } catch {}

      // 2. In-Progress Onboarding Draft Restoration (Step 1, 2, 3 autosave recovery)
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isFresh = urlParams?.get('fresh') === 'true';
      if (isFresh) {
        const draftKey = `sevaniq_onboarding_draft_${active.username.toLowerCase()}`;
        try {
          localStorage.removeItem(draftKey);
          if (active.email) {
            localStorage.removeItem(`sevaniq_onboarding_draft_${active.email.toLowerCase()}`);
          }
          localStorage.removeItem('sevaniq_onboarding_step');
          localStorage.removeItem('sevaniq_pending_tokens');
          localStorage.removeItem('sevaniq_dispatched_tokens');
          localStorage.removeItem('sevaniq_regenerated_tokens');
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

      const draftKey = `sevaniq_onboarding_draft_${active.username.toLowerCase()}`;
      const applyDraft = (draft: OnboardingDraft | null) => {
        if (!draft) return;
        if (draft.organizationName) setOrganizationName(draft.organizationName);
        if (draft.selectedIndustry) setSelectedIndustry(draft.selectedIndustry);
        if (draft.customIndustryText) setCustomIndustryText(draft.customIndustryText);
        if (draft.typedMembers) setTypedMembers(draft.typedMembers);
        if (draft.isCapacityLocked !== undefined) setIsCapacityLocked(Boolean(draft.isCapacityLocked));
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
          applyDraft(JSON.parse(cached) as OnboardingDraft);
        }
      } catch {}

      fetchOnboardingDraft(active.username).then((serverDraft) => {
        if (!cancelled && serverDraft) {
          applyDraft(serverDraft);
          try {
            localStorage.setItem(draftKey, JSON.stringify(serverDraft));
          } catch {}
        }
      }).catch(() => {});

      // Handle redirection from Super Admin Cockpit "Refresh Team" (?step=2)
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const stepParam = params.get('step');
          if (stepParam === '2') {
            setCurrentStep(2);
            fetchSuperAdminCockpit(active.username).then((data) => {
              if (!cancelled && data?.organization) {
                if (data.organization.name) setOrganizationName(data.organization.name);
                if (data.organization.industry) setSelectedIndustry(data.organization.industry);
                if (data.organization.totalSeats) setTypedMembers(data.organization.totalSeats);
              }
            }).catch(() => {});
          }
        }
      } catch {}
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Autosave Draft Helper
  const persistDraft = (overrides: Partial<OnboardingDraft> = {}) => {
    const active = session || getSession();
    if (!active?.username) return;
    const uName = active.username.toLowerCase();
    const draftKey = `sevaniq_onboarding_draft_${uName}`;

    const draftData = {
      lastActiveStep: overrides.lastActiveStep ?? currentStep,
      maxUnlockedStep: Math.max(maxUnlockedStep, overrides.maxUnlockedStep ?? (overrides.lastActiveStep ?? currentStep)),
      organizationName: overrides.organizationName ?? organizationName,
      selectedIndustry: overrides.selectedIndustry ?? selectedIndustry,
      customIndustryText: overrides.customIndustryText ?? customIndustryText,
      typedMembers: overrides.typedMembers ?? typedMembers,
      isCapacityLocked: overrides.isCapacityLocked ?? isCapacityLocked,
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
        localStorage.setItem(`sevaniq_onboarding_draft_${active.email.toLowerCase()}`, JSON.stringify(draftData));
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
        isCapacityLocked,
        pods,
        availableServices,
        username: active.username,
        email: active.email,
        userId: active.id,
      };

      try {
        localStorage.setItem(`sevaniq_onboarding_draft_${active.username.toLowerCase()}`, JSON.stringify(draftData));
        if (active.email) {
          localStorage.setItem(`sevaniq_onboarding_draft_${active.email.toLowerCase()}`, JSON.stringify(draftData));
        }
      } catch {}

      try {
        await saveOnboardingDraft(active.username, draftData);
      } catch {}
    }

    await logoutUser();
    router.push('/');
  };

  const buildFallbackPods = (servicesList: string[], count: number) => {
    const list: PodDraft[] = [];
    const usedServices = new Set<string>();
    const balanced = calculateBalancedSeats(typedMembers, count);
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
        seats: pods[i - 1]?.seats || balanced[i - 1] || 8,
      });
    }
    setPods(list);
    persistDraft({
      lastActiveStep: 3,
      maxUnlockedStep: 3,
      typedMembers,
      isCapacityLocked: true,
      pods: list,
      availableServices: servicesList,
    });
  };

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
            seats: 8,
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
          const dynamicServices = aiResult.pods.map((p) =>
            p.service?.trim() || p.name.replace(/\s+Pod$/i, '').trim()
          );
          if (dynamicServices.length > 0) {
            services = dynamicServices;
            setAvailableServices(dynamicServices);
          }
        }

        // Adjust AI pods count to match calculatedPodCount with mutually exclusive categories
        const usedServices = new Set<string>();
        const balanced = calculateBalancedSeats(typedMembers, calculatedPodCount);
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
            seats: pods[idx]?.seats || balanced[idx] || 8,
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
            seats: pods[num - 1]?.seats || balanced[num - 1] || 8,
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
          isCapacityLocked: true,
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

  // Safety net & Reactive Pod Count Synchronization for Step 3
  useEffect(() => {
    if (currentStep !== 3 || isGeneratingPods) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      if (pods.length === 0) {
        void prepareStep3Pods();
      } else if (pods.length !== calculatedPodCount) {
        syncPodsWithCapacity(calculatedPodCount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentStep, pods.length, calculatedPodCount, isGeneratingPods]);

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
    if (!isCapacityLocked) {
      setErrorMessage('Please click "Lock & Allocate Capacity" to confirm pod seat distribution before proceeding.');
      return;
    }
    const currentAllocated = pods.reduce((sum, p) => sum + (p.seats || 0), 0);
    if (currentAllocated !== typedMembers) {
      setErrorMessage(`Total allocated pod seats (${currentAllocated}) must match total team headcount (${typedMembers}).`);
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
        maxUnlockedStep: Math.max(maxUnlockedStep, 3),
        typedMembers,
        isCapacityLocked: true,
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
          seats: Number(p.seats) || 8,
        })),
      };

      const res = await setupMultiPodV2(payload);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create multi-pod organization.');
        return;
      }

      // Update session: PROMOTE TO ADMIN, preserve refreshed JWT with updated role
      const updatedSession: UserSession = {
        ...session,
        role: 'ADMIN',
        ...(res.token ? { token: res.token } : {}),
        onboardingCompleted: false,
      };
      setSession(updatedSession);
      setLocalSession(updatedSession);

      // Persist Step 4 and Tokens to localStorage so accidental close / battery death resumes here
      const tokens = res.leaderTokens || [];
      setGeneratedLeaderTokens(tokens);
      try {
        localStorage.setItem('sevaniq_onboarding_step', '4');
        localStorage.setItem('sevaniq_pending_tokens', JSON.stringify(tokens));
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
        localStorage.setItem('sevaniq_dispatched_tokens', JSON.stringify(Array.from(next)));
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

        // 1. Automatically copy to clipboard in 1-click
        try {
          await navigator.clipboard.writeText(freshJoinUrl);
        } catch {}

        // 2. Update token in state & storage
        setGeneratedLeaderTokens((prev) => {
          const updated = prev.map((t) =>
            t.token === oldToken || (workspaceId && t.workspaceId === workspaceId)
              ? { ...t, token: freshToken, joinUrl: freshJoinUrl }
              : t,
          );
          try {
            localStorage.setItem('sevaniq_pending_tokens', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // 3. Mark as dispatched so it remains in smart regenerate & copy mode
        setDispatchedTokens((prev) => {
          const next = new Set(prev);
          next.delete(oldToken);
          next.add(freshToken);
          try {
            localStorage.setItem('sevaniq_dispatched_tokens', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });

        // 4. Trigger green feedback for new token
        setCopiedToken(freshToken);
        setTimeout(() => setCopiedToken(null), 2500);

        // 5. Mark the fresh token as regenerated
        setRegeneratedTokens((prev) => {
          const next = new Set(prev).add(freshToken);
          try {
            localStorage.setItem('sevaniq_regenerated_tokens', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });
      } else {
        setErrorMessage(res.error || 'Failed to regenerate leader token.');
      }
    } catch {
      setErrorMessage('A network error occurred while regenerating token.');
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
        const doneRes = await completeOnboarding(active.username);
        if (doneRes?.token) {
          setSession({ ...finalSession, token: doneRes.token });
        }
      } catch {}
      try {
        await deleteOnboardingDraft(active.username);
      } catch {}
      try {
        const uName = active.username.toLowerCase();
        localStorage.removeItem(`sevaniq_onboarding_draft_${uName}`);
      } catch {}
    }
    try {
      localStorage.removeItem('sevaniq_onboarding_step');
      localStorage.removeItem('sevaniq_pending_tokens');
      localStorage.removeItem('sevaniq_dispatched_tokens');
      localStorage.removeItem('sevaniq_regenerated_tokens');
    } catch {}

    router.push('/admin/cockpit');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Sevaniq session...</span>
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
              <img src="/logo_sevaniq_icon.png" alt="Sevaniq Logo" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white px-2 py-0.5 rounded-md flex items-center">
              <img src="/sevaniq_wordmark.png" alt="SEVANIQ" className="h-3.5 w-auto object-contain" />
            </div>
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
              ? 'Distribute one-time activation links to designated Pod Leaders to initialize workspace governance.'
              : 'Configure your organizational structure, pod quotas, and ticket routing specializations.'}
          </p>

          {/* Stepper Dots (Interactive & Clickable for Unlocked Steps) */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[
              { num: 1, label: 'Industry' },
              { num: 2, label: 'Capacity' },
              { num: 3, label: 'Pods & Services' },
              { num: 4, label: 'Leader Activation' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              // Strict validation chain: Step 1 name is a mandatory prerequisite for ALL subsequent steps!
              const isStep1Valid = organizationName.trim().length > 0 && (selectedIndustry !== 'OTHER' || customIndustryText.trim().length > 0);
              const isStep2Valid = isStep1Valid && Number(typedMembers) >= 1 && isCapacityLocked && totalAllocatedSeats === typedMembers;
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
            <OnboardingStep1Industry
              organizationName={organizationName}
              setOrganizationName={setOrganizationName}
              selectedIndustry={selectedIndustry}
              setSelectedIndustry={setSelectedIndustry}
              customIndustryText={customIndustryText}
              setCustomIndustryText={setCustomIndustryText}
              customInputRef={customInputRef}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              setAvailableServices={setAvailableServices}
              setPods={setPods}
              persistDraft={persistDraft}
              onNext={handleNextToStep2}
            />
          )}

          {currentStep === 2 && (
            <OnboardingStep2Capacity
              typedMembers={typedMembers}
              setTypedMembers={setTypedMembers}
              calculatedPodCount={calculatedPodCount}
              isCapacityLocked={isCapacityLocked}
              setIsCapacityLocked={setIsCapacityLocked}
              pods={pods}
              totalAllocatedSeats={totalAllocatedSeats}
              isAllocationBalanced={isAllocationBalanced}
              handleLockCapacity={handleLockCapacity}
              handleUnlockCapacity={handleUnlockCapacity}
              handleAdjustPodSeats={handleAdjustPodSeats}
              handleResetPodSeatsToBalanced={handleResetPodSeatsToBalanced}
              handleNextToStep3={handleNextToStep3}
              setCurrentStep={setCurrentStep}
              setErrorMessage={setErrorMessage}
              persistDraft={persistDraft}
            />
          )}

          {currentStep === 3 && (
            <OnboardingStep3Pods
              pods={pods}
              calculatedPodCount={calculatedPodCount}
              availableServices={availableServices}
              newServiceInput={newServiceInput}
              setNewServiceInput={setNewServiceInput}
              editingServiceIndex={editingServiceIndex}
              setEditingServiceIndex={setEditingServiceIndex}
              editingServiceText={editingServiceText}
              setEditingServiceText={setEditingServiceText}
              isValidatingSemantic={isValidatingSemantic}
              semanticWarning={semanticWarning}
              setSemanticWarning={setSemanticWarning}
              isGeneratingPods={isGeneratingPods}
              isSubmitting={isSubmitting}
              generatedLeaderTokens={generatedLeaderTokens}
              handleAddGlobalService={handleAddGlobalService}
              handleStartEditService={handleStartEditService}
              handleSaveEditService={handleSaveEditService}
              handleDeleteService={handleDeleteService}
              handleToggleServiceForPod={handleToggleServiceForPod}
              handleResetServicesToDefault={handleResetServicesToDefault}
              handleAddDivergentAsNewCategory={handleAddDivergentAsNewCategory}
              handleFinalSubmit={handleFinalSubmit}
              setCurrentStep={setCurrentStep}
              setErrorMessage={setErrorMessage}
              persistDraft={persistDraft}
            />
          )}

          {currentStep === 4 && (
            <OnboardingStep4Tokens
              generatedLeaderTokens={generatedLeaderTokens}
              copiedToken={copiedToken}
              regeneratingToken={regeneratingToken}
              dispatchedTokens={dispatchedTokens}
              regeneratedTokens={regeneratedTokens}
              handleCopyLink={handleCopyLink}
              handleRegenerateLeaderToken={handleRegenerateLeaderToken}
              handleDoneSharing={handleDoneSharing}
              setCurrentStep={setCurrentStep}
              setErrorMessage={setErrorMessage}
              persistDraft={persistDraft}
            />
          )}
        </div>
      </div>
    </div>
  );
}
