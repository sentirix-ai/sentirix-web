'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Layers,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  LogOut,
  Building2,
  Radio,
  Clock,
  Sparkles,
  BarChart3,
  ExternalLink,
  Bell,
  X,
  Globe,
  Smartphone,
  Mail,
  Code2,
  Trash2,
  Pencil,
  Search,
  ArrowRightLeft,
  Plus,
  UserPlus,
} from 'lucide-react';
import { getSession, logoutUser, UserSession } from '../../../lib/auth';
import {
  fetchSuperAdminCockpit,
  regenerateToken,
  cleanupDemoTickets,
  renamePersonnel,
  transferPersonnel,
  promoteLeader,
  swapPersonnel,
  createSpecializedPod,
  addSeatToPod,
} from '../../../lib/api';

const cleanPodName = (name?: string) => {
  if (!name) return '';
  return name.replace(/\s+Pod$/i, '').trim();
};

const INDUSTRY_DISPLAY_NAMES: Record<string, string> = {
  PROFESSIONAL_SERVICES: 'Legal & CPA Tax Services',
  ECOMMERCE: 'E-Commerce & D2C Brands',
  LOGISTICS: 'Logistics, Freight & 3PLs',
  FINTECH: 'FinTech & Digital Payments',
  SAAS: 'B2B SaaS & Tech Enterprise',
  HEALTHCARE: 'Healthcare & Telemedicine',
  EDTECH: 'Education & Bootcamps',
};

const getSectorName = (industry?: string, customDesc?: string) => {
  if (industry && INDUSTRY_DISPLAY_NAMES[industry]) {
    return INDUSTRY_DISPLAY_NAMES[industry];
  }
  if (customDesc && customDesc.trim()) {
    return customDesc.trim();
  }
  return industry || 'Legal & CPA Tax Services';
};

export default function SuperAdminCockpitPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [cockpitData, setCockpitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedChannelItem, setCopiedChannelItem] = useState<string | null>(null);
  const [isCleaningDemo, setIsCleaningDemo] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PRESENCE' | 'PERSONNEL' | 'TOKENS' | 'CRISIS' | 'CHANNELS'
  >('OVERVIEW');
  const [selectedUserHistory, setSelectedUserHistory] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Personnel & Identity Governance State (Approach A)
  const [editingUser, setEditingUser] = useState<{
    id: string;
    fullName: string;
    role: string;
    podName?: string;
  } | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [personnelSearchQuery, setPersonnelSearchQuery] = useState('');

  // Personnel Transfer (Job Mutation) State
  const [transferringUser, setTransferringUser] = useState<{
    id: string;
    fullName: string;
    role: string;
    currentWorkspaceId: string;
    currentPodName: string;
  } | null>(null);
  const [transferTargetPodId, setTransferTargetPodId] = useState<string>('');
  const [transferTargetRole, setTransferTargetRole] = useState<'AGENT' | 'LEADER'>('AGENT');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Commercial Monetization & Horizontal Expansion: Deploy Specialized Pod ($149/mo)
  const [isCreatePodOpen, setIsCreatePodOpen] = useState(false);
  const [newPodNameInput, setNewPodNameInput] = useState('');
  const [newPodCategoryInput, setNewPodCategoryInput] = useState('ENTERPRISE_VIP');
  const [newPodServicesInput, setNewPodServicesInput] = useState('VIP Priority, Dispute Resolution, Incident Hub');
  const [newPodQuotaInput, setNewPodQuotaInput] = useState(3);
  const [isDeployingPod, setIsDeployingPod] = useState(false);
  const [createPodError, setCreatePodError] = useState<string | null>(null);
  const [createPodSuccess, setCreatePodSuccess] = useState<{
    podName: string;
    leaderToken: string;
    joinUrl: string;
  } | null>(null);

  // Commercial Monetization & Vertical Capacity Expansion: Add Seat (+$30/seat/mo)
  const [selectedPodForAddSeat, setSelectedPodForAddSeat] = useState<any | null>(null);
  const [additionalSeatsCount, setAdditionalSeatsCount] = useState<number>(1);
  const [isProcessingAddSeat, setIsProcessingAddSeat] = useState(false);
  const [addSeatError, setAddSeatError] = useState<string | null>(null);
  const [addSeatSuccess, setAddSeatSuccess] = useState<{
    podName: string;
    newQuota: number;
    tokens: { token: string; joinUrl: string }[];
  } | null>(null);

  const handleOpenEditUser = (user: any, podName?: string) => {
    setEditingUser({
      id: user.userId || user.id,
      fullName: user.fullName || user.username,
      role: user.role,
      podName: podName || user.podName,
    });
    setEditNameInput(user.fullName || user.username);
    setEditNameError(null);
  };

  const handleOpenTransferUser = (user: any, podId: string, podName: string) => {
    const currentWsId = podId || user.workspaceId;
    setTransferringUser({
      id: user.userId || user.id,
      fullName: user.fullName || user.username,
      role: user.role,
      currentWorkspaceId: currentWsId,
      currentPodName: podName || user.podName,
    });

    const eligiblePods = (cockpitData?.workspaces || []).filter(
      (w: any) => w.id !== currentWsId,
    );
    setTransferTargetPodId(eligiblePods[0]?.id || '');
    setTransferTargetRole(user.role === 'LEADER' ? 'LEADER' : 'AGENT');
    setTransferError(null);
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
      setCockpitData((prev: any) => {
        if (!prev) return prev;
        const updatedPresence = (prev.presenceMonitoring || []).map((u: any) => {
          if (u.userId === editingUser.id || u.id === editingUser.id) {
            return { ...u, fullName: editNameInput.trim() };
          }
          return u;
        });

        const updatedWorkspaces = (prev.workspaces || []).map((w: any) => {
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

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringUser || !transferTargetPodId) return;

    try {
      setIsTransferring(true);
      setTransferError(null);
      const res = await transferPersonnel(
        transferringUser.id,
        transferTargetPodId,
        transferTargetRole,
      );

      if (!res.success) {
        setTransferError(res.error || 'Failed to transfer personnel to target pod.');
        return;
      }

      if (session) {
        await loadData(session, false);
      }

      setTransferringUser(null);
    } catch {
      setTransferError('Network error while processing personnel transfer.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Promote to Leader State (Intra-pod Role Switch, Capacity Fixed)
  const [promotingUser, setPromotingUser] = useState<{
    id: string;
    fullName: string;
    podId: string;
    podName: string;
    currentLeaderName?: string;
    quota: number;
  } | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  // Swap Personnel Across Pods State (1-to-1 Exchange, Capacities Fixed)
  const [swappingUserA, setSwappingUserA] = useState<{
    id: string;
    fullName: string;
    role: string;
    podId: string;
    podName: string;
  } | null>(null);
  const [swapTargetPodId, setSwapTargetPodId] = useState<string>('');
  const [swapTargetUserBId, setSwapTargetUserBId] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const handleOpenPromoteUser = (user: any, pod: any) => {
    setPromotingUser({
      id: user.userId || user.id,
      fullName: user.fullName || user.username,
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

  const handleOpenSwapUser = (user: any, pod: any) => {
    const currentWsId = pod.id;
    setSwappingUserA({
      id: user.userId || user.id,
      fullName: user.fullName || user.username,
      role: user.role,
      podId: currentWsId,
      podName: cleanPodName(pod.name),
    });

    const otherPods = (cockpitData?.workspaces || []).filter((w: any) => w.id !== currentWsId);
    const firstTargetPod = otherPods[0];
    const firstTargetPodId = firstTargetPod?.id || '';
    setSwapTargetPodId(firstTargetPodId);

    if (firstTargetPod) {
      const targetPodUsers = (cockpitData?.presenceMonitoring || []).filter(
        (u: any) => u.workspaceId === firstTargetPodId || u.podName === firstTargetPod.name,
      );
      setSwapTargetUserBId(targetPodUsers[0]?.userId || targetPodUsers[0]?.id || '');
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

  const handleDeploySpecializedPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPodNameInput.trim()) {
      setCreatePodError('Please specify an enterprise pod division name.');
      return;
    }
    try {
      setIsDeployingPod(true);
      setCreatePodError(null);
      const parsedServices = newPodServicesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await createSpecializedPod({
        name: newPodNameInput.trim(),
        podCategory: newPodCategoryInput,
        services: parsedServices.length > 0 ? parsedServices : ['VIP Priority Escalation', 'Dispute Resolution'],
        quota: newPodQuotaInput,
      });

      if (!res.success) {
        setCreatePodError(res.error || 'Failed to deploy specialized pod.');
        return;
      }

      setCreatePodSuccess({
        podName: newPodNameInput.trim(),
        leaderToken: res.leaderToken || '',
        joinUrl: `http://localhost:3000/join?token=${res.leaderToken}`,
      });

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
    try {
      setIsProcessingAddSeat(true);
      setAddSeatError(null);

      const res = await addSeatToPod({
        workspaceId: selectedPodForAddSeat.id,
        seatCount: additionalSeatsCount,
      });

      if (!res.success) {
        setAddSeatError(res.error || 'Failed to expand pod seat capacity.');
        return;
      }

      setAddSeatSuccess({
        podName: selectedPodForAddSeat.name,
        newQuota: (selectedPodForAddSeat.assignedQuota || 0) + additionalSeatsCount,
        tokens: res.newTokens || [],
      });

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
    setCurrentTime(Date.now());
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const loadData = async (activeUser: UserSession, showSpinner: boolean = true) => {
    if (showSpinner) setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSuperAdminCockpit(activeUser.username);
      if (!data) {
        if (showSpinner) {
          setErrorMessage('Failed to load organization cockpit data. Please ensure setup is completed.');
        }
      } else {
        if (data?.organization?.onboardingCompleted === false) {
          router.push('/onboarding?step=4');
          return;
        }
        setCockpitData(data);
      }
    } catch {
      if (showSpinner) {
        setErrorMessage('An error occurred while loading data from the server.');
      }
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }
    if (active.onboardingCompleted === false) {
      router.push('/onboarding?step=4');
      return;
    }
    setLocalSession(active);
    loadData(active, true);

    const interval = setInterval(() => {
      loadData(active, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const handleCopyLink = (token: string) => {
    const url = `http://localhost:3000/join?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
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
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken);
      if (res.success && session) {
        await loadData(session);
      } else {
        setErrorMessage(res.error || 'Failed to regenerate token.');
      }
    } catch {
      setErrorMessage('Network connection error.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.setItem('is_manual_logout', 'true');
    } catch {}
    await logoutUser();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Sentirix Executive Cockpit...</span>
        </div>
      </div>
    );
  }

  const org = cockpitData?.organization || {};
  const stats = cockpitData?.stats || {};
  const workspaces = cockpitData?.workspaces || [];
  const tokenAudit = cockpitData?.tokenAudit || [];
  const crisisTickets = cockpitData?.crisisTickets || [];
  const slaBreachedTickets = cockpitData?.slaBreachedTickets || [];

  const renderPresenceRow = (user: any, badgePrefix?: React.ReactNode) => {
    const isOnline = user.isOnline;
    const liveOnlineSeconds =
      isOnline && user.latestLoginAt
        ? Math.max(0, Math.floor((currentTime - new Date(user.latestLoginAt).getTime()) / 1000))
        : user.currentOnlineSeconds || 0;

    return (
      <tr key={user.userId} className="hover:bg-[#1E293B]/40 transition-colors">
        {/* Personnel Name & Role */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            {badgePrefix}
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{user.fullName}</span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : user.role === 'LEADER'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                {user.role === 'SUPER_ADMIN'
                  ? 'SUPER ADMIN'
                  : user.role === 'LEADER'
                    ? 'LEADER'
                    : 'AGENT'}
              </span>
            </div>
          </div>
        </td>

        {/* Readiness & Workload */}
        <td className="py-3.5 px-4">
          <div className="space-y-1">
            {user.role === 'SUPER_ADMIN' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[11px] font-bold">
                <Crown className="w-3 h-3 text-purple-400" />
                <span>Executive Supervision</span>
              </span>
            ) : user.operationalState === 'SERVING' || (isOnline && (user.activeTicketsCount || 0) > 0) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Serving Customers</span>
              </span>
            ) : isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Standby (Ready)</span>
              </span>
            ) : user.operationalState === 'ABRUPT_DISCONNECT' || user.status === 'TERPUTUS' || user.status === 'LOGOUT_CLOSE_BROWSER' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Disconnected (Browser Closed)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Off-Duty (Shift Ended)</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 block font-medium">
              {user.workloadDescription ||
                (isOnline
                  ? (user.activeTicketsCount || 0) > 0
                    ? `${user.activeTicketsCount} Active Tickets Handled`
                    : 'Ready to Receive Tickets'
                  : 'Queue Idle')}
            </span>
          </div>
        </td>

        {/* Online Duration */}
        <td className="py-3.5 px-4">
          {isOnline ? (
            <div className="space-y-0.5">
              <div className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(liveOnlineSeconds)}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Since: {new Date(user.latestLoginAt).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">
              <span className="text-slate-500 text-[11px] block">Last Session:</span>
              <span className="font-mono">
                {formatDuration(user.sessionHistory?.[0]?.durationSeconds || 0)}
              </span>
            </div>
          )}
        </td>

        {/* Disconnect & Reconnect Logs */}
        <td className="py-3.5 px-4">
          {user.hadUnexpectedDisconnect ? (
            <div className="space-y-0.5 text-[11px]">
              <div className="text-amber-400 flex items-center gap-1">
                <span>Disconnected:</span>
                <strong className="font-mono">
                  {user.unexpectedDisconnectTime
                    ? new Date(user.unexpectedDisconnectTime).toLocaleTimeString()
                    : '-'}
                </strong>
              </div>
              {user.reconnectedTime ? (
                <div className="text-emerald-400 flex items-center gap-1">
                  <span>Reconnected:</span>
                  <strong className="font-mono">
                    {new Date(user.reconnectedTime).toLocaleTimeString()}
                  </strong>
                  <span className="text-slate-500 font-mono">
                    (Downtime: {formatDuration(user.disconnectDowntimeSeconds)})
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 italic text-[10px]">
                  Not reconnected yet
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 text-[11px] italic">
              Normal (No Disconnects)
            </span>
          )}
        </td>

        {/* View History Button */}
        <td className="py-3.5 px-4 text-right">
          <button
            type="button"
            onClick={() => setSelectedUserHistory(user)}
            className="px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>View History</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Titanium Navbar */}
      <header className="border-b border-slate-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-700 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">Sentirix</span>
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
              {stats.totalEvaluatedTickets > 0
                ? ` &bull; ${stats.slaMetCount}/${stats.totalEvaluatedTickets} Tickets Met`
                : ' &bull; No Tickets Evaluated Yet'}
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
              count: (cockpitData?.presenceMonitoring || []).filter((u: any) => u.role !== 'SUPER_ADMIN').length,
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
                onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'OVERVIEW' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Specialized Pod Topology</h2>
                <p className="text-xs text-slate-400">
                  Real-time quota lock status per Pod Leader and active ticket load.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workspaces.map((ws: any, idx: number) => {
                const isLocked = ws.isQuotaLocked;
                return (
                  <div
                    key={ws.id}
                    className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 text-xs font-black flex items-center justify-center border border-blue-800">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                          isLocked
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{isLocked ? 'QUOTA LOCKED' : 'PENDING LEADER'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-snug">
                        {cleanPodName(ws.name)}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-400">Leader:</span>
                        {ws.leaderClaimed ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{ws.leaderName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Activated</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-400/90 italic font-medium">
                            Pending Activation
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Services Tags with numbering */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1.5">
                        Assigned Domain Services:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {ws.services?.map((svc: string, sIdx: number) => (
                          <span
                            key={svc}
                            className="text-[10px] bg-[#0B0F19] text-blue-300 px-2.5 py-1 rounded-lg border border-slate-800 font-medium flex items-center gap-1.5"
                          >
                            <span className="text-blue-400 font-bold shrink-0">{sIdx + 1}.</span>
                            <span>{svc}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Pod Capacity:</span>
                        <span className="font-bold">
                          {ws.membersCount} / {ws.assignedQuota} Staff
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Ticket Queue:</span>
                        <span className="font-bold text-blue-400">{ws.openTicketsCount} Open</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB: PRESENCE & ONLINE TIME MONITORING */}
        {activeTab === 'PRESENCE' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Staff Presence &amp; Online Duration (Leaders &amp; Agents)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time online duration tracking, login/logout session audit, and automated disconnection logging when browsers close.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Real-time sync:</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="text-xs font-mono text-emerald-400 font-bold">LIVE</span>
              </div>
            </div>

            {/* Presence Barometer Cards */}
            {(() => {
              const staffUsers = (cockpitData?.presenceMonitoring || []).filter(
                (u: any) => u.role !== 'SUPER_ADMIN',
              );
              const totalStaffCount = staffUsers.length;
              const onlineStaffCount = staffUsers.filter((u: any) => u.isOnline).length;
              const offlineStaffCount = staffUsers.filter((u: any) => !u.isOnline).length;
              const attendanceRate =
                totalStaffCount > 0
                  ? Math.round((onlineStaffCount / totalStaffCount) * 1000) / 10
                  : 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Online Personnel</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-400">{onlineStaffCount}</span>
                        <span className="text-xs text-slate-500">Active Personnel</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Currently on Active Duty</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Offline Personnel</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-300">{offlineStaffCount}</span>
                        <span className="text-xs text-slate-500">Staff</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Inactive / Off-Duty</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Team Attendance Rate</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-blue-400">{attendanceRate}%</span>
                        <span
                          className={`text-xs font-bold ${
                            attendanceRate >= 80
                              ? 'text-emerald-400'
                              : attendanceRate >= 50
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {attendanceRate >= 80 ? 'Optimal' : attendanceRate >= 50 ? 'Moderate' : 'Low'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {onlineStaffCount} of {totalStaffCount} Staff Present
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pod Presence Roster Header */}
            <div className="pb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <span>Specialized Division Pods</span>
                <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                  {workspaces.length} Active {workspaces.length === 1 ? 'Pod' : 'Pods'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous operational units with dedicated Leader governance, specialized copilot models, and strict quota locks.
              </p>
            </div>

            {/* Pod Presence Roster */}
            <div className="space-y-6">
              {workspaces.map((ws: any, wsIdx: number) => {
                const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                  (u: any) =>
                    u.role !== 'SUPER_ADMIN' &&
                    (u.workspaceId === ws.id || u.podName === ws.name),
                );

                const leaderUser = podUsers.find((u: any) => u.role === 'LEADER');
                const memberUsers = podUsers
                  .filter((u: any) => u.role !== 'LEADER')
                  .sort((a: any, b: any) => {
                    const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                    const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                    return timeA - timeB;
                  });

                const orderedUsers = leaderUser ? [leaderUser, ...memberUsers] : memberUsers;

                return (
                  <div
                    key={ws.id || wsIdx}
                    className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                  >
                    {/* Header Pod Presence Box */}
                    <div className="bg-[#0F172A] border-b border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-md">
                          {wsIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {ws.isQuotaLocked ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Quota Locked ({ws.assignedQuota} Staff)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Pending Leader Setup</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Registered Leader: <strong className="text-white">{ws.leaderName || 'Unclaimed'}</strong> &bull; Active Personnel: <strong className="text-white">{orderedUsers.length}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:block hidden">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Pod Team Structure
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          1 Leader + {Math.max(0, (ws.assignedQuota || orderedUsers.length) - 1)} Members
                        </span>
                      </div>
                    </div>

                    {/* Table Presence */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="py-3 px-4">Personnel &amp; Role</th>
                            <th className="py-3 px-4">Readiness &amp; Workload</th>
                            <th className="py-3 px-4">Online Duration</th>
                            <th className="py-3 px-4">Disconnect &amp; Reconnect Logs</th>
                            <th className="py-3 px-4 text-right">Session History</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {orderedUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                                No personnel activated in this pod yet.
                              </td>
                            </tr>
                          ) : (
                            orderedUsers.map((user: any, uIdx: number) => {
                              const isLeader = user.role === 'LEADER';
                              return renderPresenceRow(
                                user,
                                isLeader ? (
                                  <span className="w-5 h-5 rounded bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0 text-center">
                                    {leaderUser ? uIdx : uIdx + 1}
                                  </span>
                                ),
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Detail Session History */}
            {selectedUserHistory && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Login &amp; Logout History: {selectedUserHistory.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Role:{' '}
                        <strong className="text-white">
                          {selectedUserHistory.role === 'LEADER'
                            ? 'Pod Leader'
                            : selectedUserHistory.role === 'SUPER_ADMIN'
                              ? 'Executive Super Admin'
                              : 'Frontline Agent'}
                        </strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUserHistory(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {selectedUserHistory.sessionHistory?.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-6">
                        No session history recorded for this user yet.
                      </p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Login Timestamp</th>
                            <th className="py-2.5 px-3">Logout Timestamp</th>
                            <th className="py-2.5 px-3">Duration</th>
                            <th className="py-2.5 px-3">Status / Termination Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {selectedUserHistory.sessionHistory.map((s: any, idx: number) => (
                            <tr key={s.id || idx} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-[11px] text-white">
                                {new Date(s.loginAt).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px]">
                                {s.logoutAt ? (
                                  new Date(s.logoutAt).toLocaleString()
                                ) : (
                                  <span className="text-emerald-400 font-bold">Active Now</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-300">
                                {formatDuration(s.durationSeconds)}
                              </td>
                              <td className="py-2.5 px-3">
                                {s.logoutReason === 'BROWSER_CLOSED' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                                    Browser Closed (Auto-Logout)
                                  </span>
                                ) : s.logoutReason === 'UNEXPECTED_DISCONNECT' ? (
                                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                                    Unexpected Disconnect
                                  </span>
                                ) : s.logoutReason === 'MANUAL_LOGOUT' ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                                    Manual Logout
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                    Active Session
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-[#0B0F19] text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUserHistory(null)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB: PERSONNEL DIRECTORY & IDENTITY GOVERNANCE (APPROACH A) */}
        {activeTab === 'PERSONNEL' && (
          <section className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Personnel Directory &amp; Identity Governance</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit, filter, and manage staff identities across all operational pods. Super Admins have sovereign override authority to rename leaders and frontline members, and reassign workforce across pods.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personnelSearchQuery}
                  onChange={(e) => setPersonnelSearchQuery(e.target.value)}
                  placeholder="Search personnel by name..."
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                />
                {personnelSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPersonnelSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Overview */}
            {(() => {
              const allStaff = (cockpitData?.presenceMonitoring || []).filter(
                (u: any) => u.role !== 'SUPER_ADMIN',
              );
              const totalLeaders = allStaff.filter((u: any) => u.role === 'LEADER').length;
              const totalMembers = allStaff.filter((u: any) => u.role !== 'LEADER').length;
              const onlineCount = allStaff.filter((u: any) => u.isOnline).length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Total Registered Personnel
                      </span>
                      <span className="text-xl font-black text-white font-mono mt-0.5 block">
                        {allStaff.length} Staff
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {onlineCount} currently online
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Pod Leaders (Commanders)
                      </span>
                      <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                        {totalLeaders} Assigned
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {workspaces.length} active operational pods
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Crown className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Frontline Pod Agents
                      </span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                        {totalMembers} Active
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Distributed across operational units
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pod-Grouped Personnel Cards */}
            {workspaces.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No active operational pods found for this organization.
              </div>
            ) : (
              <div className="space-y-6">
                {workspaces.map((ws: any, wsIdx: number) => {
                  const cleanedPod = cleanPodName(ws.name);
                  const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                    (u: any) =>
                      u.role !== 'SUPER_ADMIN' &&
                      (u.workspaceId === ws.id || u.podName === ws.name),
                  );

                  const leaderUser = podUsers.find((u: any) => u.role === 'LEADER');
                  const memberUsers = podUsers
                    .filter((u: any) => u.role !== 'LEADER')
                    .sort((a: any, b: any) => {
                      const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                      const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                      return timeA - timeB;
                    });

                  const orderedUsers = leaderUser ? [leaderUser, ...memberUsers] : memberUsers;

                  // Filter by search query
                  const filteredUsers = orderedUsers.filter((u: any) => {
                    if (!personnelSearchQuery.trim()) return true;
                    const q = personnelSearchQuery.toLowerCase();
                    return (
                      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                      (u.username && u.username.toLowerCase().includes(q)) ||
                      (u.role && u.role.toLowerCase().includes(q))
                    );
                  });

                  return (
                    <div
                      key={ws.id || wsIdx}
                      className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                      {/* Pod Card Header */}
                      <div className="bg-[#0F172A] border-b border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-md shrink-0 mt-0.5">
                            {wsIdx + 1}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              {ws.isQuotaLocked ? (
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                                  <Lock className="w-3 h-3" />
                                  <span>Quota Locked ({ws.assignedQuota} Staff)</span>
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                                  <Unlock className="w-3 h-3" />
                                  <span>Pending Leader Setup</span>
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Assigned Leader: <strong className="text-white">{ws.leaderName || 'Unclaimed'}</strong> &bull; Active Personnel: <strong className="text-white">{orderedUsers.length}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:block hidden shrink-0">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Pod Structure
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            1 Leader + {Math.max(0, (ws.assignedQuota || orderedUsers.length) - 1)} Members
                          </span>
                        </div>
                      </div>

                      {/* Personnel Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="py-3 px-4">Personnel &amp; Role</th>
                              <th className="py-3 px-4">Served Today (Daily)</th>
                              <th className="py-3 px-4">Lifetime Served</th>
                              <th className="py-3 px-4">Avg Handling Time</th>
                              <th className="py-3 px-4 text-right">Super Admin Authority</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                                  {personnelSearchQuery.trim()
                                    ? `No personnel found matching "${personnelSearchQuery}" in this pod.`
                                    : 'No personnel activated in this pod yet.'}
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user: any) => {
                                const isLeader = user.role === 'LEADER';
                                const memberIndex = memberUsers.findIndex(
                                  (m: any) => (m.userId || m.id) === (user.userId || user.id),
                                );
                                const memberNumber = memberIndex !== -1 ? memberIndex + 1 : 1;

                                return (
                                  <tr
                                    key={user.userId || user.id}
                                    className="hover:bg-slate-800/30 transition-colors"
                                  >
                                    {/* Personnel & Role */}
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        {isLeader ? (
                                          <span className="w-5 h-5 rounded bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0">
                                            <Crown className="w-3 h-3 text-amber-400" />
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0 text-center">
                                            {memberNumber}
                                          </span>
                                        )}
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-xs">
                                              {user.fullName || user.username}
                                            </span>
                                            {isLeader ? (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                                <span>Pod Leader</span>
                                              </span>
                                            ) : (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40">
                                                Frontline Agent
                                              </span>
                                            )}
                                          </div>
                                          {user.username && user.fullName && user.fullName !== user.username && (
                                            <span className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                                              @{user.username}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* 1. Customers Served Today (Resets Daily at 00:00) */}
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-white text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg shadow-inner">
                                          {user.customersServedToday ?? 0}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">Customers</span>
                                      </div>
                                    </td>

                                    {/* 2. Lifetime Customers Served (Cumulative, No Reset) */}
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg shadow-inner">
                                          {user.lifetimeCustomersServed ?? 0}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">Total</span>
                                      </div>
                                    </td>

                                    {/* 3. Average Handling Time (AHT) */}
                                    <td className="py-3.5 px-4">
                                      {user.avgHandlingTimeSeconds && user.avgHandlingTimeSeconds > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30">
                                          <Clock className="w-3 h-3 text-blue-400" />
                                          <span className="font-mono text-xs font-bold text-blue-300">
                                            {formatDuration(user.avgHandlingTimeSeconds)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 text-xs font-mono">&mdash;</span>
                                      )}
                                    </td>

                                    {/* Super Admin Authority (Action) */}
                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditUser(user, cleanedPod)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-blue-500/20 cursor-pointer"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                          <span>Edit Name</span>
                                        </button>
                                        {!isLeader && (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenPromoteUser(user, ws)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/20 cursor-pointer"
                                            title="Promote to Pod Leader (Intra-pod role switch, capacity stays fixed)"
                                          >
                                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Make Leader</span>
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenSwapUser(user, ws)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-purple-500/20 cursor-pointer"
                                          title="1-to-1 Cross-Pod Swap (Both pod capacities remain strictly fixed)"
                                        >
                                          <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                                          <span>Swap Pod</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SINGLE-USE TOKEN AUDIT HUB (GROUPED PER POD: 1 LEADER ON TOP + MEMBERS BELOW) */}
        {activeTab === 'TOKENS' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Single-Use Token Audit &amp; Credential Governance Hub</span>
                  <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                    {tokenAudit.length} Active Tokens
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic single-use token lifecycle &amp; capacity issuance. Provision new pods or expand agent seats with strict quota lock enforcement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewPodNameInput('');
                  setNewPodCategoryInput('ENTERPRISE_VIP');
                  setNewPodServicesInput('VIP Priority, Dispute Resolution, Incident Hub');
                  setNewPodQuotaInput(3);
                  setCreatePodSuccess(null);
                  setCreatePodError(null);
                  setIsCreatePodOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-blue-600/25 border border-blue-400/30 cursor-pointer shrink-0 self-start sm:self-auto group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Create Specialized Pod</span>
                <span className="text-[10px] bg-blue-950/90 text-blue-200 font-mono px-2 py-0.5 rounded-md border border-blue-700/50">
                  $149/mo
                </span>
              </button>
            </div>

            {workspaces.length === 0 && tokenAudit.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No operational pods or token records found for this organization.
              </div>
            ) : (
              <div className="space-y-6">
                {workspaces.map((ws: any, wsIdx: number) => {
                  const podTokens = tokenAudit.filter(
                    (tok: any) => tok.workspaceId === ws.id || tok.podName === ws.name,
                  );
                  const leaderTokens = podTokens.filter((t: any) => t.role === 'LEADER');
                  const rawMemberTokens = podTokens.filter((t: any) => t.role !== 'LEADER');

                  const memberTokens = [...rawMemberTokens].sort((a: any, b: any) => {
                    if (a.isUsed && !b.isUsed) return -1;
                    if (!a.isUsed && b.isUsed) return 1;

                    if (a.isUsed && b.isUsed) {
                      const timeA = a.usedAt ? new Date(a.usedAt).getTime() : 0;
                      const timeB = b.usedAt ? new Date(b.usedAt).getTime() : 0;
                      return timeA - timeB;
                    }

                    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return createdA - createdB;
                  });

                  return (
                    <div
                      key={ws.id || wsIdx}
                      className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                      {/* Pod Card Header */}
                      <div className="bg-[#0F172A] border-b border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-md">
                            {wsIdx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {ws.isQuotaLocked ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Quota Locked ({ws.assignedQuota} Staff)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Pending Leader Setup</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Registered Leader: <strong className="text-white">{ws.leaderName || 'Unclaimed'}</strong> &bull; Total Issued Tokens: <strong className="text-white">{podTokens.length}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right sm:block hidden shrink-0">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                              Pod Structure
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              1 Leader + {Math.max(0, (ws.assignedQuota || podTokens.length) - 1)} Members
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPodForAddSeat(ws);
                              setAdditionalSeatsCount(1);
                              setAddSeatSuccess(null);
                              setAddSeatError(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer group shrink-0"
                            title="Expand Pod Staff Capacity (+$30/seat/mo)"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span>Add Seat</span>
                            <span className="text-[9.5px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              +$30/mo
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Token Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="py-2.5 px-4">Position &amp; Role</th>
                              <th className="py-2.5 px-4">Token String</th>
                              <th className="py-2.5 px-4">Activation Status</th>
                              <th className="py-2.5 px-4">Assigned To</th>
                              <th className="py-2.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {/* 1. LEADER POSITION */}
                            {leaderTokens.length === 0 ? (
                              <tr className="bg-amber-950/10">
                                <td colSpan={5} className="py-3 px-4 text-slate-500 italic text-center">
                                  No leader token issued yet for this pod.
                                </td>
                              </tr>
                            ) : (
                              leaderTokens.map((tok: any) => {
                                const isCopied = copiedToken === tok.token;
                                const isLeaderActive = tok.usedBy || ws.leaderName || ws.isQuotaLocked;
                                const isLeaderLoggedOut = isLeaderActive && !tok.isUserOnline;
                                const leaderNeedsRegen =
                                  isLeaderLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isLeaderFreshTokenReady =
                                  isLeaderLoggedOut && !leaderNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr
                                    key={tok.id}
                                    className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-b border-amber-500/30 hover:bg-amber-950/40 transition-colors"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0 shadow">
                                          <Crown className="w-3.5 h-3.5" />
                                        </span>
                                        <div>
                                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                            LEADER (TOP TIER)
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-amber-300 text-xs tracking-wider">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed || ws.isQuotaLocked || ws.leaderName ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>ACTIVATED</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                                          PENDING ACTIVATION
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy || ws.leaderName ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-white">{tok.usedBy || ws.leaderName}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Leader Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">&bull; (Logged Out)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>&bull; (Browser Closed)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>&bull; (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Pending Activation</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyLink(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                            isCopied
                                              ? 'bg-emerald-600 border-emerald-500 text-white'
                                              : isLeaderFreshTokenReady
                                                ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-sm'
                                                : 'bg-[#0B0F19] border-amber-500/50 text-amber-200 hover:text-white hover:border-amber-400'
                                          }`}
                                          title="Copy Leader access link"
                                        >
                                          {isCopied ? 'Copied' : isLeaderFreshTokenReady ? 'Copy New Link' : 'Copy Link'}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={() => handleRegenerateToken(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            leaderNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isLeaderFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-amber-500/50 text-amber-300 hover:border-amber-400'
                                          }`}
                                          title="Regenerate single-use token"
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              leaderNeedsRegen
                                                ? 'text-white'
                                                : isLeaderFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-amber-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Processing...'
                                              : leaderNeedsRegen
                                                ? 'Regenerate'
                                                : isLeaderFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}

                            {/* 2. MEMBER TOKENS BELOW LEADER */}
                            {memberTokens.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                                  {ws.isQuotaLocked
                                    ? 'No agent tokens issued yet.'
                                    : 'Agent tokens will be automatically issued once the Leader locks quota and activates this pod.'}
                                </td>
                              </tr>
                            ) : (
                              memberTokens.map((tok: any, mIdx: number) => {
                                const isCopied = copiedToken === tok.token;
                                const isMemberActive = Boolean(tok.usedBy) || tok.isUsed;
                                const isMemberLoggedOut = isMemberActive && !tok.isUserOnline;
                                const memberNeedsRegen =
                                  isMemberLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isMemberFreshTokenReady =
                                  isMemberLoggedOut && !memberNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr key={tok.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2 pl-3">
                                        <span className="text-[10px] text-slate-500 font-mono">{mIdx + 1}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                          AGENT
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-blue-300">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>ACTIVATED</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                                          PENDING ACTIVATION
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-white">{tok.usedBy}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Agent Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">&bull; (Logged Out)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>&bull; (Browser Closed)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>&bull; (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Pending Activation</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyLink(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                            isCopied
                                              ? 'bg-emerald-600 border-emerald-500 text-white'
                                              : isMemberFreshTokenReady
                                                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-sm'
                                                : 'bg-[#0B0F19] border-slate-700 text-slate-300 hover:text-white'
                                          }`}
                                          title="Copy Agent access link"
                                        >
                                          {isCopied ? 'Copied' : isMemberFreshTokenReady ? 'Copy New Link' : 'Copy Link'}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={() => handleRegenerateToken(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            memberNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isMemberFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-blue-500/40 text-blue-300 hover:border-blue-400'
                                          }`}
                                          title="Regenerate single-use token"
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              memberNeedsRegen
                                                ? 'text-white'
                                                : isMemberFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-blue-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Processing...'
                                              : memberNeedsRegen
                                                ? 'Regenerate'
                                                : isMemberFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: CRISIS & SLA RADAR */}
        {activeTab === 'CRISIS' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Crisis Radar &amp; SLA Escalations</h2>
              <p className="text-xs text-slate-400">
                Tickets flagged with CRITICAL urgency by AI triage and tickets exceeding the 15-minute SLA response threshold.
              </p>
            </div>

            {crisisTickets.length === 0 && slaBreachedTickets.length === 0 ? (
              <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">No Active Crises</h3>
                <p className="text-xs text-slate-400 mt-1">
                  All operational pods are running within normal SLA thresholds with no emergency escalations.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {crisisTickets.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>High-Severity Crisis Escalations (AI Triage Detected)</span>
                    </h3>
                    <div className="space-y-3">
                      {crisisTickets.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl bg-red-950/30 border border-red-800/80"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-black text-red-400">
                              #{t.ticketNumber}
                            </span>
                            <span className="text-[10px] font-bold bg-red-900/60 text-red-200 px-2 py-0.5 rounded">
                              {t.priority}
                            </span>
                            <span className="text-xs text-slate-400">in {t.podName}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{t.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slaBreachedTickets.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>SLA Threshold Breaches (&gt; 15 Minutes Unresponsive)</span>
                    </h3>
                    <div className="space-y-3">
                      {slaBreachedTickets.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/70"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-black text-amber-400">
                              #{t.ticketNumber}
                            </span>
                            <span className="text-[10px] font-bold bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded">
                              Delayed {t.elapsedMinutes} Min
                            </span>
                            <span className="text-xs text-slate-400">in {t.podName}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{t.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab 5: Inbound Channels & Customer Gateways */}
        {activeTab === 'CHANNELS' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Inbound Channels &amp; Customer Gateways Control Center
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Manage and route customer communication channels directly to the Pod Helpdesk queue (Leaders &amp; Agents).
                    Inbound requests across these channels are automatically triaged by <strong className="text-blue-400">Gemini 3.8 Flash Grounded</strong> and dispatched to the designated Pod.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={isCleaningDemo}
                    onClick={handleCleanupDemo}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    title="Clean all showcase demo tickets from system"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isCleaningDemo ? 'Cleaning...' : 'Clean Demo Tickets'}</span>
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3 Inbound Gateways Active</span>
                  </div>
                </div>
              </div>

              {demoNotice && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{demoNotice}</span>
                </div>
              )}
            </div>

            {/* 3 Channel Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Channel 1: Web Customer Portal */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      ● Live Web &amp; Mobile
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">1. Web Customer Portal</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standalone self-service customer portal. Responsively adapts across mobile and desktop browsers with zero app install required.
                    </p>
                  </div>

                  {/* URL Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Official Portal URL:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-blue-400">
                      <span className="truncate flex-1">http://localhost:3000/portal</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel('http://localhost:3000/portal', 'portal-url')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedChannelItem === 'portal-url' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">Deployment Recommendations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10.5px]">
                      <li>Embed in corporate website footer navigation</li>
                      <li>Place in customer support social links / Linktree</li>
                      <li>Configure in WhatsApp Business auto-responder template</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/portal"
                    target="_blank"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Customer Portal (Preview)</span>
                  </Link>
                </div>
              </div>

              {/* Channel 2: Mobile App Ingestion */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      ● REST API v1
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">2. Mobile App REST Ingestion</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct integration for in-app "Report an Issue" buttons within native Android / iOS applications.
                    </p>
                  </div>

                  {/* API Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Ingestion API Endpoint:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-emerald-400">
                      <span className="truncate flex-1">POST /api/v1/tickets</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel('http://localhost:4000/api/v1/tickets', 'api-url')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy Endpoint"
                      >
                        {copiedChannelItem === 'api-url' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">JSON Payload Schema:</span>
                    <pre className="text-[10px] font-mono text-slate-400 bg-[#0B0F19] p-2 rounded-lg border border-slate-800 overflow-x-auto">
{`{
  "title": "Payment Settlement Delay",
  "description": "Issue details...",
  "customerName": "Client Name",
  "tags": ["mobile-app", "billing"]
}`}
                    </pre>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyChannel(
`curl -X POST http://localhost:4000/api/v1/tickets \\
  -H "Content-Type: application/json" \\
  -d '{"title":"API Ingested Ticket","description":"Customer report via mobile SDK","customerName":"Demo Customer"}'`,
                      'curl-sample'
                    )}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copiedChannelItem === 'curl-sample' ? 'cURL Copied!' : 'Copy Sample Request (cURL)'}</span>
                  </button>
                </div>
              </div>

              {/* Channel 3: Email Forwarding Gateway */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                      ● Email Gateway
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">3. Email Gateway Forwarding</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customers send emails from Gmail/Outlook to your company domain (e.g. support@company.com), automatically ingested into Sentirix.
                    </p>
                  </div>

                  {/* Email Inbound Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Inbound Gateway Address:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-amber-400">
                      <span className="truncate flex-1">inbound@tickets.sentirix.com</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel('inbound@tickets.sentirix.com', 'email-gw')}
                        className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy Gateway Address"
                      >
                        {copiedChannelItem === 'email-gw' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">3-Step Fast Setup Guide:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10.5px]">
                      <li>Open your Google Workspace / cPanel mail administration</li>
                      <li>Create forwarding rule: support@company.com &rarr; inbound@tickets.sentirix.com</li>
                      <li>Public replies from agents are automatically routed back to customer inbox</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="py-2.5 px-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-center text-xs font-semibold">
                    Zero-Install (Customers use regular email)
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Flow Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sentirix Unified Message Lifecycle Active</h4>
                  <p className="text-[11px] text-slate-400">
                    All incoming messages across Web Portal, Mobile App, and Email funnel into one unified Pod workbench queue, monitored in real time by the SLA Crisis Radar (&lt; 15 Minutes).
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>View Pod Workstations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* MODAL: EDIT PERSONNEL IDENTITY (SUPER ADMIN SOVEREIGN OVERRIDE) */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Edit Personnel Identity</h3>
                    <p className="text-[11px] text-slate-400">Super Admin Sovereign Override</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSavingName) setEditingUser(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePersonnelName} className="p-5 space-y-4">
                {/* Info Box */}
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Current Role</span>
                    <span className="font-bold text-white uppercase px-2 py-0.5 rounded bg-slate-800 text-[10px]">
                      {editingUser.role === 'LEADER' ? 'Pod Leader' : 'Frontline Agent'}
                    </span>
                  </div>
                  {editingUser.podName && (
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Assigned Pod</span>
                      <span className="font-semibold text-slate-200">{editingUser.podName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Account Identifier</span>
                    <span className="font-mono text-slate-400 text-[10px]">{editingUser.id}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isSavingName}
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    placeholder="Enter personnel full name..."
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Updating this will synchronize the name across attendance logs, ticket assignments, and invite token records.
                  </p>
                </div>

                {editNameError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <span className="text-red-400 font-bold">Error:</span>
                    <span>{editNameError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isSavingName}
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingName || !editNameInput.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingName ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PROMOTE TO POD LEADER (INTRA-POD ROLE SWITCH - CAPACITY FIXED) */}
        {promotingUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Promote to Pod Leader</h3>
                    <p className="text-[11px] text-slate-400">Intra-Pod Role Switch &bull; Strict Fixed Quota</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPromoting) setPromotingUser(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecutePromote} className="p-5 space-y-4">
                {/* Role Switch Exchange Visual */}
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Target Pod</span>
                    <span className="font-semibold text-slate-200">{promotingUser.podName}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Promote to Leader
                      </span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {promotingUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Will become new Pod Leader
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Demote to Agent
                      </span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {promotingUser.currentLeaderName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Will step down to Frontline Agent
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity Fixed Notice */}
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Strict Fixed Capacity Governance:</strong> Role switch occurs entirely within this pod. The total pod headcount remains strictly locked at <strong>{promotingUser.quota} Staff</strong> (0 seat increase or decrease).
                  </p>
                </div>

                {promoteError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <span className="text-red-400 font-bold">Error:</span>
                    <span>{promoteError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isPromoting}
                    onClick={() => setPromotingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPromoting}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isPromoting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Leadership...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3.5 h-3.5" />
                        <span>Confirm Promotion</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SWAP PERSONNEL ACROSS PODS (1-TO-1 RECIPROCAL EXCHANGE - FIXED CAPACITY) */}
        {swappingUserA && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Swap Personnel Across Pods</h3>
                    <p className="text-[11px] text-slate-400">1-to-1 Reciprocal Exchange &bull; Fixed Quotas Preserved</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSwapping) setSwappingUserA(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteSwap} className="p-5 space-y-4">
                {/* Personnel A Info */}
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Source Personnel (User A)</span>
                    <span className="font-bold text-white">{swappingUserA.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Source Pod</span>
                    <span className="font-semibold text-slate-200">{swappingUserA.podName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Current Role</span>
                    <span className="font-bold text-white uppercase px-2 py-0.5 rounded bg-slate-800 text-[10px]">
                      {swappingUserA.role === 'LEADER' ? 'Pod Leader' : 'Frontline Agent'}
                    </span>
                  </div>
                </div>

                {/* Target Pod Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Target Operational Pod <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    disabled={isSwapping}
                    value={swapTargetPodId}
                    onChange={(e) => {
                      const targetId = e.target.value;
                      setSwapTargetPodId(targetId);
                      const targetPod = workspaces.find((w: any) => w.id === targetId);
                      const targetUsers = (cockpitData?.presenceMonitoring || []).filter(
                        (u: any) => u.workspaceId === targetId || (targetPod && u.podName === targetPod.name),
                      );
                      setSwapTargetUserBId(targetUsers[0]?.userId || targetUsers[0]?.id || '');
                    }}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                  >
                    {workspaces
                      .filter((w: any) => w.id !== swappingUserA.podId)
                      .map((w: any) => {
                        const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                          (u: any) => u.workspaceId === w.id || u.podName === w.name,
                        );
                        return (
                          <option key={w.id} value={w.id}>
                            {cleanPodName(w.name)} (Locked: {w.assignedQuota || podUsers.length} Staff)
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Target Personnel B Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Exchange Partner in Target Pod (User B) <span className="text-red-400">*</span>
                  </label>
                  {(() => {
                    const targetPod = workspaces.find((w: any) => w.id === swapTargetPodId);
                    const targetUsers = (cockpitData?.presenceMonitoring || []).filter(
                      (u: any) => u.workspaceId === swapTargetPodId || (targetPod && u.podName === targetPod.name),
                    );

                    if (targetUsers.length === 0) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs italic">
                          No personnel available in this pod to swap with.
                        </div>
                      );
                    }

                    return (
                      <select
                        required
                        disabled={isSwapping}
                        value={swapTargetUserBId}
                        onChange={(e) => setSwapTargetUserBId(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                      >
                        {targetUsers.map((u: any) => (
                          <option key={u.userId || u.id} value={u.userId || u.id}>
                            {u.fullName || u.username} &bull; {u.role === 'LEADER' ? 'Pod Leader' : 'Frontline Agent'}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* Fixed Quota Guarantee Notice */}
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Zero-Quota Fluctuation Guarantee:</strong> This is a strict 1-to-1 reciprocal exchange. Source Pod capacity remains 100% unchanged, and Target Pod capacity remains 100% unchanged. Open tickets assigned to both staff will safely return to unassigned status in their respective pods.
                  </p>
                </div>

                {swapError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <span className="text-red-400 font-bold">Error:</span>
                    <span>{swapError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isSwapping}
                    onClick={() => setSwappingUserA(null)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSwapping || !swapTargetUserBId}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSwapping ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Executing Swap...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Confirm 1-to-1 Swap</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: DEPLOY SPECIALIZED POD ($149/MO) */}
        {isCreatePodOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Deploy Specialized Pod</h3>
                      <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                        $149/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Horizontal Multi-Division Expansion</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeployingPod) setIsCreatePodOpen(false);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {createPodSuccess ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Specialized Pod Successfully Deployed</span>
                      </div>
                      <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                        Pod <strong>{createPodSuccess.podName}</strong> has been provisioned with dedicated copilot domain routing and isolated ticket isolation.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Pod Leader Single-Use Token
                        </span>
                        <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-md border border-amber-800 font-mono">
                          LEADER TIER
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#111827] px-3.5 py-2.5 rounded-xl border border-slate-700/80">
                        <span className="font-mono text-xs font-black text-white tracking-wider">
                          {createPodSuccess.leaderToken}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(createPodSuccess.leaderToken);
                            setCopiedToken(createPodSuccess.leaderToken);
                            setTimeout(() => setCopiedToken(null), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedToken === createPodSuccess.leaderToken ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Token</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(createPodSuccess.joinUrl);
                            setCopiedToken('URL-' + createPodSuccess.leaderToken);
                            setTimeout(() => setCopiedToken(null), 2000);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {copiedToken === 'URL-' + createPodSuccess.leaderToken ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Onboarding Link Copied</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Direct Leader Onboarding Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[10.5px] text-slate-400 leading-relaxed italic">
                        &bull; Send this single-use link to your newly appointed Pod Leader. When they complete authentication, their initial team quota will be strictly locked.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatePodOpen(false);
                        setCreatePodSuccess(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      Done &amp; View in Cockpit
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDeploySpecializedPod} className="space-y-4">
                    {/* Pod Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Specialized Pod Division Name
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isDeployingPod}
                        placeholder="e.g. VIP Priority & Dispute Resolution Operations"
                        value={newPodNameInput}
                        onChange={(e) => setNewPodNameInput(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                      />
                      <p className="text-[10.5px] text-slate-500">
                        This name identifies the operational domain across customer routing and executive cockpits.
                      </p>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Specialization Domain Category
                      </label>
                      <select
                        disabled={isDeployingPod}
                        value={newPodCategoryInput}
                        onChange={(e) => setNewPodCategoryInput(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                      >
                        <option value="ENTERPRISE_VIP">Enterprise VIP &amp; Executive Client Accounts</option>
                        <option value="SECURITY_FRAUD">Trust, Security &amp; Fraud Prevention Incident Hub</option>
                        <option value="BILLING_RETENTION">Billing Disputes, Refunds &amp; Subscription Retention</option>
                        <option value="TIER_3_ESCALATION">Tier-3 SLA &amp; Critical Infrastructure Engineering</option>
                        <option value="GLOBAL_EXPANSION">Global Markets &amp; Multilingual Support Division</option>
                      </select>
                    </div>

                    {/* Services Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Core Domain Services &amp; Routing Keywords
                      </label>
                      <input
                        type="text"
                        disabled={isDeployingPod}
                        placeholder="e.g. VIP Priority, Dispute Resolution, Incident Hub"
                        value={newPodServicesInput}
                        onChange={(e) => setNewPodServicesInput(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                      />
                      <p className="text-[10.5px] text-slate-500">
                        Comma-separated service topics used by Sentirix Copilot for ticket auto-classification.
                      </p>
                    </div>

                    {/* Initial Capacity */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Initial Pod Staff Allocation
                      </label>
                      <div className="flex items-center gap-3">
                        <select
                          disabled={isDeployingPod}
                          value={newPodQuotaInput}
                          onChange={(e) => setNewPodQuotaInput(Number(e.target.value))}
                          className="w-40 bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all cursor-pointer"
                        >
                          <option value={2}>2 Staff (1 Ldr + 1 Agt)</option>
                          <option value={3}>3 Staff (1 Ldr + 2 Agt)</option>
                          <option value={4}>4 Staff (1 Ldr + 3 Agt)</option>
                          <option value={5}>5 Staff (1 Ldr + 4 Agt)</option>
                          <option value={8}>8 Staff (1 Ldr + 7 Agt)</option>
                        </select>
                        <span className="text-[11px] text-slate-400">
                          1 Leader token will be generated immediately.
                        </span>
                      </div>
                    </div>

                    {/* Commercial Prorated Billing Box */}
                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Commercial Subscription Summary
                      </span>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Dedicated Division License:</span>
                        <span className="font-mono font-bold text-white">$149.00 / mo</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Autonomous Copilot Engine:</span>
                        <span className="text-emerald-400 font-semibold">Included</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Leader Sovereign Governance:</span>
                        <span className="text-emerald-400 font-semibold">Included</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                        <span className="text-white">Total Recurring License:</span>
                        <span className="font-mono text-emerald-400 text-sm">$149.00 / month</span>
                      </div>
                    </div>

                    {/* Security Invariant Notice */}
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong>Security Invariant:</strong> Generates a pristine single-use token (<code className="font-mono text-blue-200">STX-LDR-</code>). Quota locking remains in strict compliance with Sentirix enterprise isolation standards.
                      </p>
                    </div>

                    {createPodError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">Error:</span>
                        <span>{createPodError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        disabled={isDeployingPod}
                        onClick={() => setIsCreatePodOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isDeployingPod || !newPodNameInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isDeployingPod ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Deploying Division...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Deploy Specialized Pod ($149/mo)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EXPAND POD SEAT CAPACITY / ADD SEAT (+$30/SEAT/MO) */}
        {selectedPodForAddSeat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Expand Frontline Capacity</h3>
                      <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                        +$30/seat/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Vertical Pod Staff Scaling</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isProcessingAddSeat) setSelectedPodForAddSeat(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {addSeatSuccess ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Seat Capacity Successfully Expanded</span>
                      </div>
                      <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                        Pod <strong>{addSeatSuccess.podName}</strong> capacity expanded. Total quota is now <strong>{addSeatSuccess.newQuota} staff</strong>. Single-use invitation tokens have been generated below.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        New Single-Use Frontline Tokens ({addSeatSuccess.tokens.length})
                      </span>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {addSeatSuccess.tokens.map((tok, tIdx) => (
                          <div
                            key={tok.token || tIdx}
                            className="flex items-center justify-between bg-[#111827] px-3.5 py-2 rounded-xl border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono">#{tIdx + 1}</span>
                              <span className="font-mono font-bold text-white">{tok.token}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(tok.token);
                                  setCopiedToken(tok.token);
                                  setTimeout(() => setCopiedToken(null), 2000);
                                }}
                                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10.5px] font-medium transition-colors"
                              >
                                {copiedToken === tok.token ? 'Copied' : 'Copy'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(tok.joinUrl);
                                  setCopiedToken('URL-' + tok.token);
                                  setTimeout(() => setCopiedToken(null), 2000);
                                }}
                                className="px-2 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[10.5px] font-bold transition-colors"
                              >
                                {copiedToken === 'URL-' + tok.token ? 'Link Copied' : 'Copy Link'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10.5px] text-slate-400 italic">
                        &bull; Distribute each single-use link to your frontline agents. When an agent joins, their seat is claimed automatically.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPodForAddSeat(null);
                        setAddSeatSuccess(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      Done &amp; Return to Cockpit
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddSeatsToPod} className="space-y-4">
                    {/* Selected Pod Identification */}
                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                        Target Operational Pod
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {cleanPodName(selectedPodForAddSeat.name)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          Current Quota: {selectedPodForAddSeat.assignedQuota || 0} Staff
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Assigned Leader: <strong className="text-slate-200">{selectedPodForAddSeat.leaderName || 'Unclaimed'}</strong>
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        Number of Additional Frontline Seats
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#0B0F19] border border-slate-700 rounded-xl overflow-hidden p-1">
                          <button
                            type="button"
                            disabled={isProcessingAddSeat || additionalSeatsCount <= 1}
                            onClick={() => setAdditionalSeatsCount(Math.max(1, additionalSeatsCount - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-mono font-bold text-white text-sm">
                            {additionalSeatsCount}
                          </span>
                          <button
                            type="button"
                            disabled={isProcessingAddSeat || additionalSeatsCount >= 20}
                            onClick={() => setAdditionalSeatsCount(Math.min(20, additionalSeatsCount + 1))}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 5].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setAdditionalSeatsCount(preset)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                additionalSeatsCount === preset
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              +{preset} {preset === 1 ? 'Seat' : 'Seats'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Commercial Prorated Billing Box */}
                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Prorated Capacity Billing Calculation
                      </span>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Current Pod Quota:</span>
                        <span className="font-mono text-slate-200">{selectedPodForAddSeat.assignedQuota || 0} Staff</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Additional Frontline Capacity:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{additionalSeatsCount} {additionalSeatsCount === 1 ? 'Seat' : 'Seats'} (&times; $30/mo)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Projected New Pod Quota:</span>
                        <span className="font-mono font-black text-white">
                          {(selectedPodForAddSeat.assignedQuota || 0) + additionalSeatsCount} Staff
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                        <span className="text-white">Additional Monthly Billing:</span>
                        <span className="font-mono text-emerald-400 text-sm">
                          +${(additionalSeatsCount * 30).toFixed(2)} / month
                        </span>
                      </div>
                    </div>

                    {/* Invariant Guarantee Notice */}
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong>Quota Invariant Guarantee:</strong> Adding seats immediately locks the pod quota to the new ceiling and generates {additionalSeatsCount} single-use agent token(s) (<code className="font-mono text-emerald-200">STX-AGT-</code>). Existing agent assignments and leader governance are preserved 100%.
                      </p>
                    </div>

                    {addSeatError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">Error:</span>
                        <span>{addSeatError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        disabled={isProcessingAddSeat}
                        onClick={() => setSelectedPodForAddSeat(null)}
                        className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessingAddSeat}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessingAddSeat ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Allocating Seats...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Confirm &amp; Allocate Seats (+${(additionalSeatsCount * 30).toFixed(2)}/mo)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] px-6 py-4 text-center text-xs text-slate-500">
        Sentirix Executive Governance &bull; Dynamic Multi-Pod Capacity Architecture
      </footer>
    </div>
  );
}
