'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Headphones,
  Check,
  Copy,
  MessageCircle,
  Crown,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  fetchLeaderTokenStatus,
  togglePodQuotaLock,
  lockLeaderQuota,
  fetchAgentTokenStatus,
  claimAgentToken,
  validateWorkspaceInvite,
  joinWorkspace,
  regenerateToken,
} from '../../lib/api';
import { setSession, getSession } from '../../lib/auth';

const cleanPodName = (name?: string) => {
  if (!name) return '';
  return name.replace(/\s+Pod$/i, '').trim();
};

function JoinWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [isLoading, setIsLoading] = useState(true);
  const [tokenType, setTokenType] = useState<'LEADER' | 'AGENT' | 'LEGACY'>('LEGACY');
  const [tokenData, setTokenData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLockedToOtherSession, setIsLockedToOtherSession] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSubordinates, setSelectedSubordinates] = useState<number>(1);
  const [isQuotaLocked, setIsQuotaLocked] = useState<boolean>(false);
  const [isLockingQuota, setIsLockingQuota] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state for Leader (Resilient against F5/refresh before clicking Enter Workspace)
  const [leaderLockedResult, setLeaderLockedResult] = useState<{
    workspaceName: string;
    assignedQuota: number;
    agentTokens: Array<{
      token: string;
      joinUrl: string;
      isUsed?: boolean;
      usedBy?: string | null;
      isOpened?: boolean;
    }>;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const currentToken = urlParams.get('token');
      if (currentToken && currentToken.startsWith('STX-LDR-')) {
        const entered =
          sessionStorage.getItem(`sentirix_leader_entered_${currentToken}`) ||
          localStorage.getItem(`sentirix_leader_entered_${currentToken}`);
        if (!entered) {
          const raw = sessionStorage.getItem(`sentirix_leader_locked_${currentToken}`);
          if (raw) return JSON.parse(raw);
        }
      }
    } catch {
      return null;
    }
    return null;
  });
  const [copiedTokens, setCopiedTokens] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const currentToken = urlParams.get('token');
      if (currentToken) {
        const raw = sessionStorage.getItem(`sentirix_copied_tokens_${currentToken}`);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      return [];
    }
    return [];
  });
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);

  const getClientSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sid = sessionStorage.getItem('sentirix_client_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem('sentirix_client_session_id', sid);
    }
    return sid;
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Invitation token not found in URL.');
      return;
    }

    const inspectToken = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setIsLockedToOtherSession(false);
      const sid = getClientSessionId();

      try {
        if (token.startsWith('STX-LDR-')) {
          setTokenType('LEADER');
          const res = await fetchLeaderTokenStatus(token, sid);
          if (!res.valid) {
            if (res.isLockedToOtherSession) setIsLockedToOtherSession(true);
            setErrorMessage(res.error || 'Leader token is invalid or has expired.');
          } else {
            setTokenData(res);
            if (res.isExistingLeader && res.existingLeaderName) {
              setFullName(res.existingLeaderName);
            }

            // If this is an existing leader returning to service, ensure leaderLockedResult is null
            // so they are directly presented with the "Selamat Datang / Welcome Back" screen, NOT the token distribution screen.
            if (res.isExistingLeader) {
              setLeaderLockedResult(null);
              if (typeof window !== 'undefined') {
                try {
                  sessionStorage.removeItem(`sentirix_leader_locked_${token}`);
                } catch {}
              }
            } else if (typeof window !== 'undefined' && token.startsWith('STX-LDR-')) {
              const alreadyEntered =
                sessionStorage.getItem(`sentirix_leader_entered_${token}`) ||
                localStorage.getItem(`sentirix_leader_entered_${token}`);

              if (!alreadyEntered) {
                const cached = sessionStorage.getItem(`sentirix_leader_locked_${token}`);
                if (cached) {
                  try {
                    const parsed = JSON.parse(cached);
                    if (parsed?.workspaceName && Array.isArray(parsed?.agentTokens)) {
                      setLeaderLockedResult(parsed);
                    }
                  } catch {}
                }

                // Restore persistent copiedTokens
                const rawCopied = sessionStorage.getItem(`sentirix_copied_tokens_${token}`);
                if (rawCopied) {
                  try {
                    const parsedCopied = JSON.parse(rawCopied);
                    if (Array.isArray(parsedCopied)) {
                      setCopiedTokens(parsedCopied);
                    }
                  } catch {}
                }
              }
            }

            if (res.workspace?.isQuotaLocked) {
              setIsQuotaLocked(true);
              if (res.workspace.assignedQuota > 1) {
                setSelectedSubordinates(res.workspace.assignedQuota - 1);
              }
            } else if (res.quotaStats?.allowedOptions?.length > 0) {
              const opts = res.quotaStats.allowedOptions;
              // Penambahan kuota bawahan selalu default dimulai dari 1 anggota (opts[0]), bukan nilai maksimal
              setSelectedSubordinates(opts[0]);
            }
          }
        } else if (token.startsWith('STX-AGT-')) {
          setTokenType('AGENT');
          const res = await fetchAgentTokenStatus(token, sid);
          if (!res.valid) {
            if (res.isLockedToOtherSession) setIsLockedToOtherSession(true);
            setErrorMessage(res.error || 'Agent token is invalid or has already been used.');
          } else {
            setTokenData(res);
            if (res.assignedMemberName) {
              setFullName(res.assignedMemberName);
            }
          }
        } else {
          // Fallback for legacy invite link
          setTokenType('LEGACY');
          try {
            const res = await validateWorkspaceInvite(token, sid);
            if (!res.valid) {
              if (res.isLockedToOtherSession) setIsLockedToOtherSession(true);
              setErrorMessage(res.error || 'Invitation link is invalid.');
            } else {
              setTokenData(res);
            }
          } catch {
            setErrorMessage('Failed to connect to server to validate token.');
          }
        }
      } catch (err) {
        setErrorMessage('Failed to connect to server to validate token.');
      } finally {
        setIsLoading(false);
      }
    };

    inspectToken();
  }, [token]);

  // Real-time synchronization when switching tabs/windows or polling while on Leader screen
  useEffect(() => {
    if (tokenType !== 'LEADER' || isSubmitting || leaderLockedResult) return;
    const refreshQuota = async () => {
      const sid = getClientSessionId();
      const res = await fetchLeaderTokenStatus(token, sid);
      if (res?.valid && res.quotaStats) {
        setTokenData((prev: any) => ({ ...prev, ...res }));
        if (res.workspace?.isQuotaLocked) {
          setIsQuotaLocked(true);
          if (res.workspace.assignedQuota > 1) {
            setSelectedSubordinates(res.workspace.assignedQuota - 1);
          }
        } else if (res.quotaStats.isLastPod && res.quotaStats.allowedOptions?.length > 0) {
          setSelectedSubordinates(res.quotaStats.allowedOptions[0]);
        }
      }
    };

    window.addEventListener('focus', refreshQuota);
    const timer = setInterval(refreshQuota, 3000);
    return () => {
      window.removeEventListener('focus', refreshQuota);
      clearInterval(timer);
    };
  }, [tokenType, token, isSubmitting, leaderLockedResult]);

  // Real-time synchronization of agent tokens status when on Leader Activation success view
  useEffect(() => {
    if (tokenType !== 'LEADER' || !leaderLockedResult) return;

    const refreshTokens = async () => {
      const sid = getClientSessionId();
      const res = await fetchLeaderTokenStatus(token, sid);
      if (res?.valid && res.agentTokens && res.agentTokens.length > 0) {
        setLeaderLockedResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            agentTokens: res.agentTokens,
          };
        });
      }
    };

    window.addEventListener('focus', refreshTokens);
    const timer = setInterval(refreshTokens, 2500);
    return () => {
      window.removeEventListener('focus', refreshTokens);
      clearInterval(timer);
    };
  }, [tokenType, token, leaderLockedResult]);

  // Handle Interactive Quota Lock Toggle from Step 2
  const handleToggleQuotaLock = async () => {
    if (isLockingQuota) return;
    try {
      setIsLockingQuota(true);
      setFormError(null);
      const targetLock = !isQuotaLocked;
      const sid = getClientSessionId();
      const res = await togglePodQuotaLock({
        token,
        chosenSubordinates: selectedSubordinates,
        lock: targetLock,
        sessionId: sid,
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update quota lock.');
        return;
      }
      setIsQuotaLocked(targetLock);
      if (res.quotaStats) {
        setTokenData((prev: any) => ({
          ...prev,
          quotaStats: res.quotaStats,
          workspace: {
            ...prev?.workspace,
            isQuotaLocked: targetLock,
            assignedQuota: res.workspace?.assignedQuota || selectedSubordinates + 1,
          },
        }));
      }
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with server.');
    } finally {
      setIsLockingQuota(false);
    }
  };

  // Handle Leader Quota Locking (Click [✓ Lock Pod Quota])
  const handleLockLeaderQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = (tokenData?.existingLeaderName || fullName || '').trim();
    if (!tokenData?.isExistingLeader && (!effectiveName || effectiveName.length < 2)) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const maxAllowed = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
      const safeSubordinates = Math.min(Number(selectedSubordinates) || 1, maxAllowed);
      const sid = getClientSessionId();

      const res = await lockLeaderQuota({
        token,
        fullName: effectiveName || 'Leader',
        password: password.trim() || undefined,
        chosenSubordinates: safeSubordinates,
        sessionId: sid,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to lock pod quota.');
        return;
      }

      // Store leader session
      if (res.leader) {
        setSession({
          id: res.leader.id,
          username: res.leader.username,
          fullName: res.leader.fullName,
          email: res.leader.email,
          role: 'LEADER',
          workspaceRole: 'LEADER',
          isVerified: true,
          avatarText: res.leader.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
          workspaceId: res.workspace?.id || res.leader.workspaceId,
        });

        if (res.isReLogin || tokenData?.isExistingLeader) {
          if (typeof window !== 'undefined' && token) {
            try {
              sessionStorage.setItem(`sentirix_leader_entered_${token}`, 'true');
              localStorage.setItem(`sentirix_leader_entered_${token}`, 'true');
            } catch {}
          }
          window.location.href = '/dashboard';
          return;
        }
      }

      const lockedData = {
        workspaceName: res.workspace?.name || tokenData?.workspace?.name,
        assignedQuota: res.workspace?.assignedQuota || selectedSubordinates + 1,
        agentTokens: res.agentTokens || [],
      };

      if (typeof window !== 'undefined' && token) {
        sessionStorage.setItem(`sentirix_leader_locked_${token}`, JSON.stringify(lockedData));
      }

      setLeaderLockedResult(lockedData);
    } catch {
      setErrorMessage('A network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Agent Joining
  const handleJoinAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const sid = getClientSessionId();
      const res = await claimAgentToken({
        token,
        fullName: fullName.trim(),
        password: password.trim() || undefined,
        sessionId: sid,
      });

      if (!res.success) {
        if (
          res.error?.toLowerCase().includes('token') ||
          res.error?.toLowerCase().includes('session') ||
          res.error?.toLowerCase().includes('expired') ||
          res.error?.toLowerCase().includes('regenerated')
        ) {
          setErrorMessage(res.error);
        } else {
          setFormError(res.error || 'Failed to claim agent token.');
        }
        return;
      }

      if (res.user) {
        setSession({
          id: res.user.id,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          role: 'USER',
          workspaceRole: 'AGENT',
          isVerified: true,
          avatarText: res.user.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
          workspaceId: res.workspace?.id || res.user.workspaceId,
          isGuestMember: true,
        });
      }

      window.location.href = '/dashboard';
    } catch {
      setFormError('A network error occurred while joining.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Legacy Link
  const handleJoinLegacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await joinWorkspace(token, fullName.trim());
      if (res.success && res.user) {
        setSession(res.user);
        window.location.href = '/dashboard';
      } else {
        setErrorMessage(res.error || 'Failed to join workspace.');
      }
    } catch {
      setErrorMessage('Connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAgentToken = (tok: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTokens((prev) => {
      if (prev.includes(tok)) return prev;
      const next = [...prev, tok];
      if (typeof window !== 'undefined' && token) {
        try {
          sessionStorage.setItem(`sentirix_copied_tokens_${token}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const handleRegenerateAgentToken = async (oldTok: string) => {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    try {
      setRegeneratingToken(oldTok);
      const res = await regenerateToken(oldTok);
      if (res.success && res.newToken) {
        // Reset copied status for this slot (turn "Copied" back to "Copy")
        setCopiedTokens((prev) => {
          const next = prev.filter((t) => t !== oldTok && t !== res.newToken);
          if (typeof window !== 'undefined' && token) {
            try {
              sessionStorage.setItem(`sentirix_copied_tokens_${token}`, JSON.stringify(next));
            } catch {}
          }
          return next;
        });

        setLeaderLockedResult((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            agentTokens: prev.agentTokens.map((t) =>
              t.token === oldTok
                ? {
                    token: res.newToken!,
                    joinUrl: res.joinUrl!,
                    isUsed: false,
                    usedBy: null,
                    isOpened: false,
                  }
                : t,
            ),
          };
          if (typeof window !== 'undefined' && token) {
            sessionStorage.setItem(`sentirix_leader_locked_${token}`, JSON.stringify(updated));
          }
          return updated;
        });
      } else {
        setErrorMessage(res.error || 'Failed to regenerate team member token.');
      }
    } catch {
      setErrorMessage('Connection error occurred.');
    } finally {
      setRegeneratingToken(null);
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-white p-1 flex items-center justify-center shadow-lg">
            <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Sentirix</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                {tokenType === 'LEADER' ? 'LEADER ACTIVATION' : 'AI COPILOT'}
              </span>
            </div>
            <p className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase">
              AUTONOMOUS SUPPORT INTELLIGENCE
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Single-Use Token Security</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-2xl">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs text-slate-400">Validating activation token...</span>
          </div>
        ) : errorMessage ? (
          <div
            className={`p-8 bg-[#111827] rounded-2xl text-center space-y-4 shadow-2xl border ${
              isLockedToOtherSession
                ? 'border-amber-500/60 ring-1 ring-amber-500/20'
                : 'border-red-800/80'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border shadow-lg ${
                isLockedToOtherSession
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-amber-950/40'
                  : 'bg-red-950 text-red-400 border-red-800 shadow-red-950/40'
              }`}
            >
              {isLockedToOtherSession ? (
                <Lock className="w-7 h-7 text-amber-400" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            {isLockedToOtherSession && (
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/90 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 font-mono">
                SECURITY NOTICE • SINGLE-USE BROWSER LOCKED
              </span>
            )}

            <h2 className="text-lg font-bold text-white tracking-tight">
              {isLockedToOtherSession
                ? 'Link Active in Another Browser Session'
                : 'Token Access Denied'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all font-semibold"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : tokenType === 'LEADER' && leaderLockedResult ? (
          /* LEADER SUCCESS SCREEN AFTER CLICKING CHECKMARK [✓] */
          <div className="p-8 bg-[#111827] border border-emerald-500/40 rounded-2xl shadow-2xl space-y-6 animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                ● STATUS: PERMANENT QUOTA LOCKED
              </span>
              <h1 className="text-xl font-black text-white">
                Pod &amp; Quota Successfully Activated
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                <strong>{cleanPodName(leaderLockedResult.workspaceName)}</strong> capacity:{' '}
                <strong>{leaderLockedResult.assignedQuota} seats</strong> (1 Leader,{' '}
                {leaderLockedResult.agentTokens.length} Agents).
              </p>
            </div>

            {/* Generated Single-Use Agent Tokens */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Share {leaderLockedResult.agentTokens.length} Single-Use Tokens with Your Team Members:</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderLockedResult.agentTokens.map((agt, idx) => {
                  const isCopied = copiedTokens.includes(agt.token);
                  const isClaimed = !!agt.isUsed;
                  const isOpened = !!agt.isOpened;
                  const isLocked = isClaimed || isOpened;

                  return (
                    <div
                      key={agt.token}
                      className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-blue-300 font-bold">{agt.token}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isLocked ? (
                          <div
                            className="px-2.5 py-1 rounded text-[11px] font-bold border bg-[#111827] border-slate-800 text-slate-500 cursor-not-allowed opacity-75 flex items-center gap-1.5 select-none"
                            title={
                              isClaimed
                                ? `Token has been claimed by ${agt.usedBy || 'member'}`
                                : 'Token link is currently opened by member'
                            }
                          >
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>
                              {isClaimed
                                ? `Claimed${agt.usedBy ? ` (${agt.usedBy})` : ''}`
                                : 'Opened'}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopyAgentToken(agt.token, agt.joinUrl)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              isCopied
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-[#111827] border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isCopied && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={regeneratingToken === agt.token}
                          onClick={() => handleRegenerateAgentToken(agt.token)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                            isCopied || isLocked
                              ? 'bg-blue-950/90 border border-blue-500/80 text-blue-300 hover:bg-blue-900 hover:border-blue-400 shadow-sm shadow-blue-950/60'
                              : 'bg-[#111827] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                          title="Regenerate token for this team member slot if link is lost or revoked"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              regeneratingToken === agt.token ? 'animate-spin text-blue-400' : ''
                            }`}
                          />
                          <span>{regeneratingToken === agt.token ? 'Processing...' : 'Regenerate'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try {
                    if (token) {
                      sessionStorage.removeItem(`sentirix_leader_locked_${token}`);
                      sessionStorage.removeItem(`sentirix_copied_tokens_${token}`);
                      sessionStorage.setItem(`sentirix_leader_entered_${token}`, 'true');
                      localStorage.setItem(`sentirix_leader_entered_${token}`, 'true');
                    }

                    // Strictly enforce LEADER role in session so Leader enters frontline helpdesk, not Admin Cockpit
                    const cur = getSession();
                    const leaderUser = tokenData?.leaderUser;
                    const leaderName = tokenData?.existingLeaderName || leaderUser?.fullName || fullName || 'Leader';
                    
                    const sessionData = {
                      ...(cur || {}),
                      id: cur?.id || leaderUser?.id || tokenData?.existingLeaderId || `leader_${token}`,
                      username: cur?.username || leaderUser?.username || tokenData?.existingLeaderUsername || `leader_${token.slice(0, 8)}`,
                      fullName: cur?.fullName || leaderName,
                      email: cur?.email || leaderUser?.email || `leader@sentrix.local`,
                      role: 'LEADER' as const,
                      workspaceRole: 'LEADER',
                      isVerified: true,
                      avatarText: (cur?.fullName || leaderName).slice(0, 2).toUpperCase(),
                      onboardingCompleted: true,
                      workspaceId: cur?.workspaceId || tokenData?.workspace?.id,
                    };
                    setSession(sessionData);
                  } catch {}
                }
                window.location.href = '/dashboard';
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>Enter Pod Ticket Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : tokenType === 'LEADER' ? (
          tokenData?.isExistingLeader ? (
            /* LEADER RE-LOGIN VIEW (Meta, Tita entering with regenerated token) */
            <div className="p-6 sm:p-8 bg-[#111827] border border-blue-500/40 rounded-2xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pod Leader</span>
                </div>

                {tokenData?.organization?.name && (
                  <div className="text-xs font-bold text-slate-400 tracking-wide">
                    {tokenData.organization.name}
                  </div>
                )}

                <h1 className="text-xl font-black text-white pt-1">
                  Welcome back, {tokenData?.existingLeaderName || fullName || 'Leader'}!
                </h1>
              </div>

              {/* Specialization Unit Card */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-white leading-snug">
                    {cleanPodName(tokenData?.workspace?.name)}
                  </h2>
                </div>

                {tokenData?.workspace?.services && tokenData.workspace.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Covered Domain Services:
                    </span>
                    <div className="space-y-1">
                      {tokenData.workspace.services.map((svc: string, sIdx: number) => (
                        <div
                          key={svc}
                          className="text-[11px] text-slate-300 flex items-start gap-1.5 font-medium leading-relaxed"
                        >
                          <span className="text-blue-400 font-bold shrink-0">({sIdx + 1})</span>
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Locked Team Capacity:</span>
                  <strong className="text-emerald-400 font-bold">
                    {tokenData?.workspace?.assignedQuota} Personnel
                  </strong>
                </div>
              </div>

              <form onSubmit={handleLockLeaderQuota} className="space-y-4 max-w-md mx-auto">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying &amp; Entering...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enter Leader Pod Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
          /* LEADER ACTIVATION & CAPACITY SELECTION FORM */
          <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold mx-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Pod Leader</span>
              </div>
              {tokenData?.organization?.name && (
                <div className="text-xs font-bold text-slate-400 tracking-wide">
                  {tokenData.organization.name}
                </div>
              )}
              <h1 className="text-xl font-black text-white pt-1">
                Leader Activation: {cleanPodName(tokenData?.workspace?.name)}
              </h1>
            </div>

            <form onSubmit={handleLockLeaderQuota} className="space-y-5">
              {/* Form Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2.5 shadow-lg shadow-red-950/40 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Leader Profile Details */}
              <div className="space-y-4 p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Step 1: Complete Your Profile
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Interconnected Quota Allocation Box with Dropdown + [✓] Checkmark button */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                    Step 2: Allocate Your Pod Quota
                  </span>
                </div>

                {/* Quota Stats Overview */}
                <div className="p-3 rounded-lg bg-[#111827] border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Organization Quota:</span>
                    <strong className="text-white">{tokenData?.quotaStats?.totalSeats} Seats</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Locked by Other Pods:</span>
                    <strong className="text-amber-400">{tokenData?.quotaStats?.lockedSeats} Seats</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-blue-300">
                    <span>Max Available for Your Pod:</span>
                    <strong className="text-emerald-400">
                      {((tokenData?.quotaStats?.maxSubordinatesAllowed ?? 0) + 1)} Seats
                    </strong>
                  </div>
                </div>

                {/* Dropdown Selection & Checkmark Locking Button */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Select Allocation Seats:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={selectedSubordinates}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const max = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
                          if (val > max) {
                            setFormError(`Subordinate quota exceeds maximum allowed (${max} seats).`);
                          } else {
                            if (formError) setFormError(null);
                            setSelectedSubordinates(val);
                          }
                        }}
                        className={`w-full ${
                          isQuotaLocked || tokenData?.quotaStats?.isLastPod
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-[#111827] border-2 border-blue-500 text-white'
                        } font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-80`}
                        disabled={isQuotaLocked || tokenData?.quotaStats?.isLastPod}
                      >
                        {tokenData?.quotaStats?.allowedOptions?.map((num: number) => (
                          <option key={num} value={num} className="bg-[#111827] text-white">
                            {num + 1} Seats (1 Leader + {num} Agent{num > 1 ? 's' : ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={isLockingQuota}
                      onClick={handleToggleQuotaLock}
                      className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 ${
                        isQuotaLocked
                          ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      } disabled:opacity-50`}
                    >
                      {isLockingQuota ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )}
                      <span>{isQuotaLocked ? 'Quota Locked' : 'Lock Quota'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Submit Button at bottom */}
              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !isQuotaLocked}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Account &amp; Generating Tokens...</span>
                  </div>
                ) : (
                  <>
                    <span>Activate Pod &amp; Continue to Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          )
        ) : tokenType === 'AGENT' ? (
          tokenData?.assignedMemberName ? (
            /* AGENT RETURNING VIEW (e.g. moko returning) */
            <div className="p-6 sm:p-8 bg-[#111827] border border-blue-500/40 rounded-2xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Frontline Agent</span>
                </div>

                {tokenData?.organization?.name && (
                  <div className="text-xs font-bold text-slate-400 tracking-wide">
                    {tokenData.organization.name}
                  </div>
                )}

                <h1 className="text-xl font-black text-white pt-1">
                  Welcome back, {tokenData.assignedMemberName}!
                </h1>
              </div>

              {/* Specialization Unit Card */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-white leading-snug">
                    {cleanPodName(tokenData?.workspace?.name)}
                  </h2>
                </div>

                {tokenData?.workspace?.services && tokenData.workspace.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Covered Domain Services:
                    </span>
                    <div className="space-y-1">
                      {tokenData.workspace.services.map((svc: string, sIdx: number) => (
                        <div
                          key={svc}
                          className="text-[11px] text-slate-300 flex items-start gap-1.5 font-medium leading-relaxed"
                        >
                          <span className="text-blue-400 font-bold shrink-0">({sIdx + 1})</span>
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tokenData?.leaderName && (
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Team Lead:</span>
                    <strong className="text-white font-bold">{tokenData.leaderName}</strong>
                  </div>
                )}
              </div>

              <form onSubmit={handleJoinAgent} className="space-y-4 max-w-md mx-auto">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2.5 shadow-lg shadow-red-950/40 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching Workspace...</span>
                    </div>
                  ) : (
                    <>
                      <span>Launch Pod Ticket Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* AGENT FIRST-TIME CLAIM FORM */
            <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Frontline Agent</span>
                </div>

                {tokenData?.organization?.name && (
                  <div className="text-xs font-bold text-slate-400 tracking-wide">
                    {tokenData.organization.name}
                  </div>
                )}

                <h1 className="text-xl font-black text-white pt-1">
                  Join {cleanPodName(tokenData?.workspace?.name)}
                </h1>
              </div>

              {/* Specialization Unit Card */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-white leading-snug">
                    {cleanPodName(tokenData?.workspace?.name)}
                  </h2>
                </div>

                {tokenData?.workspace?.services && tokenData.workspace.services.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Covered Domain Services:
                    </span>
                    <div className="space-y-1">
                      {tokenData.workspace.services.map((svc: string, sIdx: number) => (
                        <div
                          key={svc}
                          className="text-[11px] text-slate-300 flex items-start gap-1.5 font-medium leading-relaxed"
                        >
                          <span className="text-blue-400 font-bold shrink-0">({sIdx + 1})</span>
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tokenData?.leaderName && (
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Team Lead:</span>
                    <strong className="text-white font-bold">{tokenData.leaderName}</strong>
                  </div>
                )}
              </div>

              <form onSubmit={handleJoinAgent} className="space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2.5 shadow-lg shadow-red-950/40 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !fullName.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Activating Agent Account...</span>
                  ) : (
                    <>
                      <span>Join &amp; Launch Ticket Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )
        ) : (
          /* LEGACY JOIN FORM */
          <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white">Join Team</h1>
              <p className="text-xs text-slate-400 mt-1">
                Workspace: <strong className="text-white">{tokenData?.workspaceName}</strong>
              </p>
            </div>
            <form onSubmit={handleJoinLegacy} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Join Workspace
              </button>
            </form>
          </div>
        )}
      </main>


    </div>
  );
}

export default function JoinWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-xs">
          Loading invitation...
        </div>
      }
    >
      <JoinWorkspaceContent />
    </Suspense>
  );
}
