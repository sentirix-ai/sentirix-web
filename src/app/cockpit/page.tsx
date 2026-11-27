'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Users,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Radio,
  Clock,
  Globe,
} from 'lucide-react';
import { getSession, logoutUser, UserSession } from '../../lib/auth';
import { io, Socket } from 'socket.io-client';
import {
  CompanyCockpitData,
  CockpitWorkspaceItem,
  CockpitPresenceUser,
} from '../../lib/types';
import {
  fetchCompanyCockpit,
  regenerateToken,
  cleanupDemoTickets,
  renamePersonnel,
  promoteLeader,
  swapPersonnel,
  createSpecializedPod,
  addSeatToPod,
  checkMemberStatus,
  forceLogoutPersonnel,
} from '../../lib/api';
import {
  cleanPodName,
  INDUSTRY_DEFAULT_SERVICES,
  type CockpitTabId,
  type EditingUserTarget,
  type ForceLogoutTarget,
  type PromotingUserTarget,
  type SwappingUserTarget,
} from '../../components/cockpit/cockpit.utils';
import { CockpitOverviewTab } from '../../components/cockpit/CockpitOverviewTab';
import { CockpitPresenceTab } from '../../components/cockpit/CockpitPresenceTab';
import { CockpitPersonnelTab } from '../../components/cockpit/CockpitPersonnelTab';
import { CockpitTokensTab } from '../../components/cockpit/CockpitTokensTab';
import { CockpitCrisisTab } from '../../components/cockpit/CockpitCrisisTab';
import { CockpitChannelsTab } from '../../components/cockpit/CockpitChannelsTab';
import { CockpitPersonnelModals } from '../../components/cockpit/CockpitPersonnelModals';
import { CockpitPodModals } from '../../components/cockpit/CockpitPodModals';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function CompanyCockpitPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [cockpitData, setCockpitData] = useState<CompanyCockpitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [dispatchedTokens, setDispatchedTokens] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('sevaniq_admin_dispatched_tokens');
        if (raw) return new Set(JSON.parse(raw));
      } catch {}
    }
    return new Set<string>();
  });
  const [freshRegeneratedTokens, setFreshRegeneratedTokens] = useState<Set<string>>(new Set());
  const [copiedChannelItem, setCopiedChannelItem] = useState<string | null>(null);
  const [isCleaningDemo, setIsCleaningDemo] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [forcingLogoutUser, setForcingLogoutUser] = useState<string | null>(null);
  const [confirmForceLogoutTarget, setConfirmForceLogoutTarget] = useState<ForceLogoutTarget | null>(null);
  const [activeTab, setActiveTab] = useState<CockpitTabId>('OVERVIEW');
  const [selectedUserHistory, setSelectedUserHistory] = useState<CockpitPresenceUser | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Personnel & Identity Governance State (Approach A)
  const [editingUser, setEditingUser] = useState<EditingUserTarget | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [personnelSearchQuery, setPersonnelSearchQuery] = useState('');

  // Commercial Monetization & Horizontal Expansion: Deploy Specialized Pod ($149/mo)
  const [isCreatePodOpen, setIsCreatePodOpen] = useState(false);
  const [newPodServicesSelection, setNewPodServicesSelection] = useState<string[]>([]);
  const [customServicesList, setCustomServicesList] = useState<string[]>([]);
  const [newCustomServiceInput, setNewCustomServiceInput] = useState('');
  const [editingCustomServiceName, setEditingCustomServiceName] = useState<string | null>(null);
  const [editingCustomServiceText, setEditingCustomServiceText] = useState('');
  const [newPodCapacity, setNewPodCapacity] = useState<number>(2);
  const [isDeployingPod, setIsDeployingPod] = useState(false);
  const [createPodError, setCreatePodError] = useState<string | null>(null);

  // Commercial Monetization & Vertical Capacity Expansion: Add Seat (+$30/seat/mo)
  const [selectedPodForAddSeat, setSelectedPodForAddSeat] = useState<CockpitWorkspaceItem | null>(null);
  const [additionalSeatsCount, setAdditionalSeatsCount] = useState<number>(1);
  const [isProcessingAddSeat, setIsProcessingAddSeat] = useState(false);
  const [addSeatError, setAddSeatError] = useState<string | null>(null);

  const handleOpenEditUser = (user: CockpitPresenceUser, podName?: string) => {
    const displayName = user.fullName || user.username || 'Staff';
    setEditingUser({
      id: user.userId || user.id || '',
      fullName: displayName,
      role: user.role,
      podName: podName || user.podName,
    });
    setEditNameInput(displayName);
    setEditNameError(null);
  };

  const handleSavePersonnelName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editNameInput.trim()) return;
    if (editNameInput.trim().length < 2) {
      setEditNameError('Please enter a valid full name (at least 2 characters).');
      return;
    }

    try {
      setIsSavingName(true);
      setEditNameError(null);
      const res = await renamePersonnel(editingUser.id, editNameInput.trim());
      if (!res.success) {
        setEditNameError(res.error || 'Failed to update personnel name.');
        return;
      }

      // Update local presenceMonitoring list
      setCockpitData((prev) => {
        if (!prev) return prev;
        const updatedPresence = (prev.presenceMonitoring || []).map((u) => {
          if (u.userId === editingUser.id || u.id === editingUser.id) {
            return { ...u, fullName: editNameInput.trim() };
          }
          return u;
        });

        const updatedWorkspaces = (prev.workspaces || []).map((w) => {
          if (w.leaderName === editingUser.fullName) {
            return { ...w, leaderName: editNameInput.trim() };
          }
          return w;
        });

        return {
          ...prev,
          presenceMonitoring: updatedPresence,
          workspaces: updatedWorkspaces,
        };
      });

      setEditingUser(null);
    } catch {
      setEditNameError('Network error while saving name.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Promote to Leader State (Intra-pod Role Switch, Capacity Fixed)
  const [promotingUser, setPromotingUser] = useState<PromotingUserTarget | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  // Swap Personnel Across Pods State (1-to-1 Exchange, Capacities Fixed)
  const [swappingUserA, setSwappingUserA] = useState<SwappingUserTarget | null>(null);
  const [swapTargetPodId, setSwapTargetPodId] = useState<string>('');
  const [swapTargetUserBId, setSwapTargetUserBId] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const handleOpenPromoteUser = (user: CockpitPresenceUser, pod: CockpitWorkspaceItem) => {
    setPromotingUser({
      id: user.userId || user.id || '',
      fullName: user.fullName || user.username || 'Staff',
      podId: pod.id,
      podName: cleanPodName(pod.name),
      currentLeaderName: pod.leaderName || 'Current Leader',
      quota: pod.assignedQuota || 4,
    });
    setPromoteError(null);
  };

  const handleExecutePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingUser) return;
    try {
      setIsPromoting(true);
      setPromoteError(null);
      const res = await promoteLeader(promotingUser.id, promotingUser.podId);
      if (!res.success) {
        setPromoteError(res.error || 'Failed to promote personnel to leader.');
        return;
      }
      if (session) {
        await loadData(session, false);
      }
      setPromotingUser(null);
    } catch {
      setPromoteError('Network error while processing promotion.');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleOpenSwapUser = (user: CockpitPresenceUser, pod: CockpitWorkspaceItem) => {
    const currentWsId = pod.id;
    setSwappingUserA({
      id: user.userId || user.id || '',
      fullName: user.fullName || user.username || 'Staff',
      role: user.role,
      podId: currentWsId,
      podName: cleanPodName(pod.name),
    });

    const otherPods = (cockpitData?.workspaces || []).filter((w) => w.id !== currentWsId);
    const firstTargetPod = otherPods[0];
    const firstTargetPodId = firstTargetPod?.id || '';
    setSwapTargetPodId(firstTargetPodId);

    if (firstTargetPod) {
      const targetPodUsers = (cockpitData?.presenceMonitoring || []).filter(
        (u) => u.workspaceId === firstTargetPodId || u.podName === firstTargetPod.name,
      );
      const targetLeader = targetPodUsers.find((u) => u.role === 'LEADER');
      const targetMembers = targetPodUsers
        .filter((u) => (u.userId || u.id) !== (targetLeader?.userId || targetLeader?.id))
        .sort((a, b) => {
          const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
          const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
          return timeA - timeB;
        });
      const ordered = targetLeader ? [targetLeader, ...targetMembers] : targetMembers;
      setSwapTargetUserBId(ordered[0]?.userId || ordered[0]?.id || '');
    } else {
      setSwapTargetUserBId('');
    }
    setSwapError(null);
  };

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swappingUserA || !swapTargetUserBId) return;
    try {
      setIsSwapping(true);
      setSwapError(null);
      const res = await swapPersonnel(swappingUserA.id, swapTargetUserBId);
      if (!res.success) {
        setSwapError(res.error || 'Failed to swap personnel across pods.');
        return;
      }
      if (session) {
        await loadData(session, false);
      }
      setSwappingUserA(null);
    } catch {
      setSwapError('Network error while executing personnel swap.');
    } finally {
      setIsSwapping(false);
    }
  };

  // Pod Allocation & Naming Governance:
  const workspaces = cockpitData?.workspaces || [];
  const currentPodsCount = workspaces.length;
  const nextPodSequenceNumber = currentPodsCount + 1;
  const autoPodName = nextPodSequenceNumber < 10 ? `Pod 0${nextPodSequenceNumber}` : `Pod ${nextPodSequenceNumber}`;

  // Service Catalog & Allocation Mapping (Option A: Checklist with informative pod badges)
  const currentOrgIndustry = cockpitData?.organization?.industry || 'OTHER';
  const existingWsServices: string[] = Array.from(new Set(workspaces.flatMap((w) => w.services || [])));

  // Prioritas utama: Jika organisasi sudah memiliki Pod di database, gunakan tepat 6 layanan yang sudah aktif di pod tersebut!
  // Fallback: Jika pod masih kosong, gunakan 6 layanan preset dari industrinya (atau OTHER jika custom).
  const baseCatalogServices: string[] =
    existingWsServices.length > 0
      ? existingWsServices
      : (INDUSTRY_DEFAULT_SERVICES[currentOrgIndustry] || INDUSTRY_DEFAULT_SERVICES['OTHER'] || []);

  const allAvailableServices: string[] = Array.from(
    new Set<string>([...baseCatalogServices, ...customServicesList]),
  );

  const servicePodMap: Record<string, string[]> = {};
  workspaces.forEach((ws) => {
    (ws.services || []).forEach((svc: string) => {
      if (!servicePodMap[svc]) servicePodMap[svc] = [];
      if (!servicePodMap[svc].includes(ws.name)) {
        servicePodMap[svc].push(ws.name);
      }
    });
  });

  const handleToggleService = (svc: string) => {
    setNewPodServicesSelection((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc],
    );
    if (createPodError) setCreatePodError(null);
  };

  const handleAddCustomService = () => {
    const clean = newCustomServiceInput.trim();
    if (!clean) return;
    if (!customServicesList.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setCustomServicesList((prev) => [...prev, clean]);
    }
    if (!newPodServicesSelection.includes(clean)) {
      setNewPodServicesSelection((prev) => [...prev, clean]);
    }
    setNewCustomServiceInput('');
    if (createPodError) setCreatePodError(null);
  };

  const handleDeleteCustomService = (svcToDelete: string) => {
    setCustomServicesList((prev) => prev.filter((s) => s !== svcToDelete));
    setNewPodServicesSelection((prev) => prev.filter((s) => s !== svcToDelete));
    if (editingCustomServiceName === svcToDelete) {
      setEditingCustomServiceName(null);
      setEditingCustomServiceText('');
    }
    if (createPodError) setCreatePodError(null);
  };

  const handleStartEditCustomService = (svc: string) => {
    setEditingCustomServiceName(svc);
    setEditingCustomServiceText(svc);
  };

  const handleSaveEditCustomService = (oldName: string) => {
    const clean = editingCustomServiceText.trim();
    if (!clean || clean === oldName) {
      setEditingCustomServiceName(null);
      return;
    }
    setCustomServicesList((prev) => prev.map((s) => (s === oldName ? clean : s)));
    setNewPodServicesSelection((prev) => prev.map((s) => (s === oldName ? clean : s)));
    setEditingCustomServiceName(null);
    setEditingCustomServiceText('');
  };

  const handleCancelEditCustomService = () => {
    setEditingCustomServiceName(null);
    setEditingCustomServiceText('');
  };

  const handleDeploySpecializedPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPodServicesSelection.length === 0) {
      setCreatePodError('Please select at least 1 service category for this pod.');
      return;
    }
    try {
      setIsDeployingPod(true);
      setCreatePodError(null);

      const res = await createSpecializedPod({
        name: autoPodName,
        podCategory: 'SPECIALIZED',
        services: newPodServicesSelection,
        quota: newPodCapacity,
        organizationId: cockpitData?.organization?.id,
        requesterIdentifier: session?.username || session?.id,
      });

      if (!res.success) {
        setCreatePodError(res.error || 'Failed to deploy specialized pod.');
        return;
      }

      setIsCreatePodOpen(false);
      setCreatePodError(null);
      setActiveTab('TOKENS');

      if (session) {
        await loadData(session, false);
      }
    } catch {
      setCreatePodError('Network error while provisioning specialized pod.');
    } finally {
      setIsDeployingPod(false);
    }
  };

  const handleAddSeatsToPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPodForAddSeat) return;
    const currentQuota = selectedPodForAddSeat.assignedQuota || selectedPodForAddSeat.maxMembers || 0;
    const maxAddable = Math.max(0, 8 - currentQuota);
    const countToAdd = Math.min(Math.max(1, additionalSeatsCount), maxAddable);
    if (countToAdd <= 0) {
      setAddSeatError('Pod has reached its maximum capacity of 8 members.');
      return;
    }
    try {
      setIsProcessingAddSeat(true);
      setAddSeatError(null);

      const res = await addSeatToPod({
        workspaceId: selectedPodForAddSeat.id,
        seatCount: countToAdd,
      });

      if (!res.success) {
        setAddSeatError(res.error || 'Failed to expand pod seat capacity.');
        return;
      }

      setSelectedPodForAddSeat(null);
      setAddSeatError(null);
      setActiveTab('TOKENS');

      if (session) {
        await loadData(session, false);
      }
    } catch {
      setAddSeatError('Network error while scaling pod seat capacity.');
    } finally {
      setIsProcessingAddSeat(false);
    }
  };

  useEffect(() => {
    const initialTick = setTimeout(() => setCurrentTime(Date.now()), 0);
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => {
      clearTimeout(initialTick);
      clearInterval(timer);
    };
  }, []);


  const handleOpenCreatePod = () => {
    const unassigned = allAvailableServices.filter(
      (s) => !workspaces.some((w) => (w.services || []).includes(s)),
    );
    setNewPodServicesSelection(
      unassigned.length > 0 ? [unassigned[0]] : allAvailableServices.slice(0, 1),
    );
    setNewCustomServiceInput('');
    setEditingCustomServiceName(null);
    setEditingCustomServiceText('');
    setNewPodCapacity(2);
    setCreatePodError(null);
    setIsCreatePodOpen(true);
  };

  const handleOpenAddSeat = (ws: CockpitWorkspaceItem) => {
    setSelectedPodForAddSeat(ws);
    const curQuota = ws.assignedQuota || ws.maxMembers || 0;
    const maxAdd = Math.max(0, 8 - curQuota);
    setAdditionalSeatsCount(maxAdd > 0 ? 1 : 0);
    setAddSeatError(null);
  };

  const loadData = async (activeUser: UserSession, showSpinner: boolean = true) => {
    if (showSpinner) setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchCompanyCockpit();
      if (!data) {
        // If user or organization does not exist in the database (or service frozen/deleted),
        // immediately purge session and redirect to pre-login page
        await logoutUser();
        window.location.href = '/';
        return;
      } else {
        if (data?.organization?.onboardingCompleted === false) {
          router.push('/onboarding?step=4');
          return;
        }
        setCockpitData(data);
      }
    } catch {
      const statusActive = await checkMemberStatus(activeUser.id || activeUser.username || activeUser.email);
      if (!statusActive) {
        await logoutUser();
        window.location.href = '/';
        return;
      }
      if (showSpinner) {
        setErrorMessage('An error occurred while loading data from the server.');
      }
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      const active = getSession();
      if (!active) {
        window.location.href = '/';
        return;
      }
      if (active.role !== 'TENANT_OWNER' && active.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      if (active.onboardingCompleted === false) {
        router.push('/onboarding?step=4');
        return;
      }
      setLocalSession(active);
      void loadData(active, true);

      // 1. Real-Time WebSocket Presence & Event Stream for instantaneous audit updates (0ms latency)
      try {
        socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          auth: active.token ? { token: active.token } : undefined,
        });

        const handleLivePresence = () => {
          void loadData(active, false);
        };

        socket.on('presence:changed', handleLivePresence);
        socket.on('team:member_left', handleLivePresence);
        socket.on('team:member_joined', handleLivePresence);
        socket.on('team:workspace_updated', handleLivePresence);
        socket.on('token:regenerated', handleLivePresence);
        socket.on('leader:activated', handleLivePresence);
        socket.on('agent:claimed-token', handleLivePresence);
        socket.on('workspace:quota-locked', handleLivePresence);
        socket.on('auth:force_logout', handleLivePresence);
      } catch {}

      // 2. High-frequency safety net polling fallback (every 2.5 seconds)
      interval = setInterval(() => {
        void loadData(active, false);
      }, 2500);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        socket?.disconnect();
      } catch {}
    };
  }, [router]);

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const url = `${origin}/join?token=${token}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedToken(token);
    setDispatchedTokens((prev) => {
      const next = new Set(prev);
      next.add(token);
      try {
        sessionStorage.setItem(
          'sevaniq_admin_dispatched_tokens',
          JSON.stringify(Array.from(next)),
        );
      } catch {}
      return next;
    });
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCopyChannel = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannelItem(id);
    setTimeout(() => setCopiedChannelItem(null), 2500);
  };

  const handleCleanupDemo = async () => {
    try {
      setIsCleaningDemo(true);
      const res = await cleanupDemoTickets();
      setDemoNotice(`Successfully cleaned up ${res.count} demo tickets from database & queues.`);
      if (session) {
        await loadData(session, false);
      }
      setTimeout(() => setDemoNotice(null), 4000);
    } catch {
      setDemoNotice('Failed to cleanup demo tickets.');
      setTimeout(() => setDemoNotice(null), 3000);
    } finally {
      setIsCleaningDemo(false);
    }
  };

  const handleRegenerateToken = async (oldToken: string) => {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken);
      if (res.success && session) {
        setDispatchedTokens((prev) => {
          const next = new Set(prev);
          next.delete(oldToken);
          if (res.newToken) next.delete(res.newToken);
          try {
            sessionStorage.setItem(
              'sevaniq_admin_dispatched_tokens',
              JSON.stringify(Array.from(next)),
            );
          } catch {}
          return next;
        });

        if (res.newToken) {
          setFreshRegeneratedTokens((prev) => {
            const next = new Set(prev);
            next.add(res.newToken!);
            return next;
          });
        }

        await loadData(session, false);
        if (typeof window !== 'undefined') {
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY, behavior: 'instant' });
          });
        }
      } else {
        setErrorMessage(res.error || 'Failed to regenerate token.');
      }
    } catch {
      setErrorMessage('Network connection error.');
    } finally {
      setRegeneratingToken(null);
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        });
      }
    }
  };

  const handleForceLogout = async (target: {
    name: string;
    role: string;
    token?: string;
    userId?: string;
    username?: string;
  }) => {
    const key = target.token || target.userId || target.name;
    try {
      setForcingLogoutUser(key);
      const activeSession = session || getSession();
      const res = await forceLogoutPersonnel(
        target.userId,
        target.username || target.name,
        target.token,
      );
      if (res.success && activeSession) {
        setConfirmForceLogoutTarget(null);
        await loadData(activeSession, false);
      } else {
        setErrorMessage(res.error || 'Failed to revoke user session.');
      }
    } catch {
      setErrorMessage('Network connection error while executing session revocation.');
    } finally {
      setForcingLogoutUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.setItem('is_manual_logout', 'true');
    } catch {}
    await logoutUser();
    window.location.href = '/';
  };

  if (isLoading || !cockpitData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Company Cockpit...</span>
        </div>
      </div>
    );
  }

  const org: CompanyCockpitData['organization'] = cockpitData.organization;
  const stats = cockpitData.stats || {};
  const tokenAudit = cockpitData.tokenAudit || [];
  const crisisTickets = cockpitData.crisisTickets || [];
  const slaBreachedTickets = cockpitData.slaBreachedTickets || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Titanium Navbar */}
      <header className="border-b border-slate-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-700 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img src="/logo_sevaniq_icon.png" alt="Sevaniq Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-white px-2 py-0.5 rounded-md flex items-center">
                  <img src="/sevaniq_wordmark.png" alt="SEVANIQ" className="h-4 w-auto object-contain" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                  AI COPILOT COCKPIT
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-bold tracking-wider">
                <span className="uppercase">AUTONOMOUS SUPPORT INTELLIGENCE</span>
                <span>&bull;</span>
                <span className="text-blue-300 font-bold">{org.name || 'Enterprise Organization'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live (Auto 3s)</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Executive Banner & Metrics Barometer */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Seats */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Seat Allocation</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.claimedSeats || 0}</span>
              <span className="text-xs text-slate-400">/ {stats.totalSeats || 9} Seats Claimed</span>
            </div>
            <div className="w-full h-1.5 bg-[#0B0F19] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${stats.seatUtilizationPercentage || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              License Utilization: {stats.seatUtilizationPercentage || 0}%
            </span>
          </div>

          {/* Card 2: Active Pods */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Locked Pods</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{stats.lockedPods || 0}</span>
              <span className="text-xs text-slate-400">/ {stats.totalPods || 0} Active Pods</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Amazon Two-Pizza Rule (&le; 8 Staff/Pod)
            </span>
          </div>

          {/* Card 3: SLA Health */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Live SLA Compliance</span>
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {stats.slaCompliancePercentage !== undefined
                  ? `${stats.slaCompliancePercentage}%`
                  : '100%'}
              </span>
              <span
                className={`text-xs font-bold ${
                  (stats.slaCompliancePercentage ?? 100) >= 95
                    ? 'text-emerald-400'
                    : (stats.slaCompliancePercentage ?? 100) >= 80
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {stats.slaStatusLabel || 'Optimal'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Response Threshold: &lt; 15 Min
              {(stats.totalEvaluatedTickets ?? 0) > 0
                ? ` • ${stats.slaMetCount ?? 0}/${stats.totalEvaluatedTickets} Tickets Met`
                : ' • No Tickets Evaluated Yet'}
            </span>
          </div>

          {/* Card 4: Crisis Radar */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Critical Escalation Radar</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.crisisCount || 0}</span>
              <span className="text-xs text-slate-400">Tickets Requiring Attention</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Automated Gemini AI Triage Detection
            </span>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Pod Topology & Workload', icon: Layers },
            { id: 'PRESENCE', label: 'Staff Presence & SLA Monitoring', icon: Clock, count: stats.onlineCount || 0 },
            {
              id: 'PERSONNEL',
              label: 'Personnel Directory & Identity',
              icon: Users,
              count: (cockpitData?.presenceMonitoring || []).filter(
                (u) => u.role !== 'TENANT_OWNER' && u.role !== 'ADMIN',
              ).length,
            },
            { id: 'TOKENS', label: 'Single-Use Token Audit Hub', icon: ShieldCheck, count: tokenAudit.length },
            {
              id: 'CRISIS',
              label: 'Crisis Radar & SLA Compliance',
              icon: AlertTriangle,
              count: (stats.crisisCount || 0) + (stats.slaBreachedCount || 0),
            },
            {
              id: 'CHANNELS',
              label: 'Omnichannel Ingestion & Webhook',
              icon: Globe,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-[#111827] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0B0F19] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: POD TOPOLOGY */}
        {activeTab === 'OVERVIEW' && <CockpitOverviewTab workspaces={workspaces} />}

        {activeTab === 'PRESENCE' && (
          <CockpitPresenceTab
            cockpitData={cockpitData}
            workspaces={workspaces}
            currentTime={currentTime}
            selectedUserHistory={selectedUserHistory}
            setSelectedUserHistory={setSelectedUserHistory}
          />
        )}

        {activeTab === 'PERSONNEL' && (
          <CockpitPersonnelTab
            cockpitData={cockpitData}
            workspaces={workspaces}
            personnelSearchQuery={personnelSearchQuery}
            setPersonnelSearchQuery={setPersonnelSearchQuery}
            handleOpenEditUser={handleOpenEditUser}
            handleOpenPromoteUser={handleOpenPromoteUser}
            handleOpenSwapUser={handleOpenSwapUser}
          />
        )}

        {activeTab === 'TOKENS' && (
          <CockpitTokensTab
            workspaces={workspaces}
            tokenAudit={tokenAudit}
            copiedToken={copiedToken}
            dispatchedTokens={dispatchedTokens}
            regeneratingToken={regeneratingToken}
            freshRegeneratedTokens={freshRegeneratedTokens}
            forcingLogoutUser={forcingLogoutUser}
            handleCopyLink={handleCopyLink}
            handleRegenerateToken={handleRegenerateToken}
            onOpenCreatePod={handleOpenCreatePod}
            onOpenAddSeat={handleOpenAddSeat}
            onRequestForceLogout={setConfirmForceLogoutTarget}
          />
        )}

        {activeTab === 'CRISIS' && (
          <CockpitCrisisTab
            crisisTickets={crisisTickets}
            slaBreachedTickets={slaBreachedTickets}
          />
        )}

        {activeTab === 'CHANNELS' && (
          <CockpitChannelsTab
            copiedChannelItem={copiedChannelItem}
            isCleaningDemo={isCleaningDemo}
            demoNotice={demoNotice}
            handleCopyChannel={handleCopyChannel}
            handleCleanupDemo={handleCleanupDemo}
          />
        )}

        <CockpitPersonnelModals
          cockpitData={cockpitData}
          workspaces={workspaces}
          confirmForceLogoutTarget={confirmForceLogoutTarget}
          setConfirmForceLogoutTarget={setConfirmForceLogoutTarget}
          forcingLogoutUser={forcingLogoutUser}
          handleForceLogout={handleForceLogout}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          editNameInput={editNameInput}
          setEditNameInput={setEditNameInput}
          isSavingName={isSavingName}
          editNameError={editNameError}
          handleSavePersonnelName={handleSavePersonnelName}
          promotingUser={promotingUser}
          setPromotingUser={setPromotingUser}
          isPromoting={isPromoting}
          promoteError={promoteError}
          handleExecutePromote={handleExecutePromote}
          swappingUserA={swappingUserA}
          setSwappingUserA={setSwappingUserA}
          swapTargetPodId={swapTargetPodId}
          setSwapTargetPodId={setSwapTargetPodId}
          swapTargetUserBId={swapTargetUserBId}
          setSwapTargetUserBId={setSwapTargetUserBId}
          isSwapping={isSwapping}
          swapError={swapError}
          handleExecuteSwap={handleExecuteSwap}
        />

        <CockpitPodModals
          isCreatePodOpen={isCreatePodOpen}
          setIsCreatePodOpen={setIsCreatePodOpen}
          autoPodName={autoPodName}
          allAvailableServices={allAvailableServices}
          servicePodMap={servicePodMap}
          newPodServicesSelection={newPodServicesSelection}
          customServicesList={customServicesList}
          newCustomServiceInput={newCustomServiceInput}
          setNewCustomServiceInput={setNewCustomServiceInput}
          editingCustomServiceName={editingCustomServiceName}
          editingCustomServiceText={editingCustomServiceText}
          setEditingCustomServiceText={setEditingCustomServiceText}
          newPodCapacity={newPodCapacity}
          setNewPodCapacity={setNewPodCapacity}
          isDeployingPod={isDeployingPod}
          createPodError={createPodError}
          handleToggleService={handleToggleService}
          handleAddCustomService={handleAddCustomService}
          handleDeleteCustomService={handleDeleteCustomService}
          handleStartEditCustomService={handleStartEditCustomService}
          handleSaveEditCustomService={handleSaveEditCustomService}
          handleCancelEditCustomService={handleCancelEditCustomService}
          handleDeploySpecializedPod={handleDeploySpecializedPod}
          selectedPodForAddSeat={selectedPodForAddSeat}
          setSelectedPodForAddSeat={setSelectedPodForAddSeat}
          additionalSeatsCount={additionalSeatsCount}
          setAdditionalSeatsCount={setAdditionalSeatsCount}
          isProcessingAddSeat={isProcessingAddSeat}
          addSeatError={addSeatError}
          handleAddSeatsToPod={handleAddSeatsToPod}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] px-6 py-4 text-center text-xs text-slate-500">
        Sevaniq Executive Governance &bull; Dynamic Multi-Pod Capacity Architecture
      </footer>
    </div>
  );
}
