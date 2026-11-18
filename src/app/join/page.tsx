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
  lockLeaderQuota,
  fetchAgentTokenStatus,
  claimAgentToken,
  validateWorkspaceInvite,
  joinWorkspace,
  regenerateToken,
} from '../../lib/api';
import { setSession } from '../../lib/auth';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state for Leader
  const [leaderLockedResult, setLeaderLockedResult] = useState<{
    workspaceName: string;
    assignedQuota: number;
    agentTokens: Array<{ token: string; joinUrl: string }>;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
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
      setIsLoading(false);
      setErrorMessage(null);
      setIsLockedToOtherSession(false);
      const sid = getClientSessionId();

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
          if (res.workspace?.isQuotaLocked) {
            setIsQuotaLocked(true);
            if (res.workspace.assignedQuota > 1) {
              setSelectedSubordinates(res.workspace.assignedQuota - 1);
            }
          } else if (res.quotaStats?.allowedOptions?.length > 0) {
            setSelectedSubordinates(
              res.quotaStats.allowedOptions[res.quotaStats.allowedOptions.length - 1],
            );
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
    };

    inspectToken();
  }, [token]);

  // Handle Leader Quota Locking (Click [✓ Lock Pod Quota])
  const handleLockLeaderQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
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
        fullName: fullName.trim(),
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
          role: 'ADMIN',
          isVerified: true,
          avatarText: res.leader.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
          workspaceId: res.workspace?.id || res.leader.workspaceId,
        });

        if (res.isReLogin) {
          window.location.href = '/dashboard';
          return;
        }
      }

      setLeaderLockedResult({
        workspaceName: res.workspace?.name || tokenData?.workspace?.name,
        assignedQuota: res.workspace?.assignedQuota || selectedSubordinates + 1,
        agentTokens: res.agentTokens || [],
      });
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
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const sid = getClientSessionId();
      const res = await claimAgentToken({
        token,
        fullName: fullName.trim(),
        password: password.trim() || undefined,
        sessionId: sid,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to claim agent token.');
        return;
      }

      if (res.user) {
        setSession({
          id: res.user.id,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          role: 'USER',
          isVerified: true,
          avatarText: res.user.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
          workspaceId: res.workspace?.id || res.user.workspaceId,
          isGuestMember: true,
        });
      }

      window.location.href = '/dashboard';
    } catch {
      setErrorMessage('A network error occurred while joining.');
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
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRegenerateAgentToken = async (oldTok: string) => {
    try {
      setRegeneratingToken(oldTok);
      const res = await regenerateToken(oldTok);
      if (res.success && res.newToken) {
        setLeaderLockedResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            agentTokens: prev.agentTokens.map((t) =>
              t.token === oldTok
                ? { token: res.newToken!, joinUrl: res.joinUrl! }
                : t,
            ),
          };
        });
      } else {
        setErrorMessage(res.error || 'Failed to regenerate subordinate token.');
      }
    } catch {
      setErrorMessage('Connection error occurred.');
    } finally {
      setRegeneratingToken(null);
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
                Pod &amp; Quota Successfully Activated!
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You officially lead <strong>{cleanPodName(leaderLockedResult.workspaceName)}</strong> with a total team capacity of{' '}
                <strong>{leaderLockedResult.assignedQuota} personnel</strong> (1 Leader +{' '}
                {leaderLockedResult.agentTokens.length} Agents).
              </p>
            </div>

            {/* Generated Single-Use Agent Tokens */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Share {leaderLockedResult.agentTokens.length} Single-Use Tokens with Your Subordinates:</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderLockedResult.agentTokens.map((agt, idx) => {
                  const isCopied = copiedToken === agt.token;
                  const waText = encodeURIComponent(
                    `Hello, please join my team at ${cleanPodName(leaderLockedResult.workspaceName)} on Sentirix via this official invitation: ${agt.joinUrl}`,
                  );
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
                        <button
                          type="button"
                          onClick={() => handleCopyAgentToken(agt.token, agt.joinUrl)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                            isCopied
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-[#111827] border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <a
                          href={`https://wa.me/?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                        >
                          WA
                        </a>
                        <button
                          type="button"
                          disabled={regeneratingToken === agt.token}
                          onClick={() => handleRegenerateAgentToken(agt.token)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#111827] border border-blue-500/40 text-blue-300 hover:border-blue-400 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Regenerate token for this subordinate slot if link is lost"
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
              onClick={() => (window.location.href = '/dashboard')}
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Specialized Operational Pod
                  </span>
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
                  Step 1: Complete Your Leader Profile
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
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step 2: Allocate Your Pod Subordinate Quota
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
                      {tokenData?.quotaStats?.maxSubordinatesAllowed} Subordinates (+ 1 Leader)
                    </strong>
                  </div>
                </div>

                {/* Highlighted Maximum Quota Callout */}
                <div className="p-3 rounded-xl bg-blue-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-300">Pod Quota Capacity Limit:</span>
                  </div>
                  <span className="font-mono font-black text-cyan-300 bg-blue-900/90 px-2.5 py-1 rounded-lg border border-cyan-400/40 text-xs">
                    Max {tokenData?.quotaStats?.maxSubordinatesAllowed || 1} Subordinates (+ 1 Leader)
                  </span>
                </div>

                {/* Dropdown Selection & Checkmark Locking Button */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>Select Subordinate Seats:</span>
                    {tokenData?.quotaStats?.isLastPod ? (
                      <span className="text-[11px] text-amber-400 font-bold">
                        (Final Pod: Only 1 Max Allocation Available)
                      </span>
                    ) : (
                      <span className="text-[11px] text-cyan-400 font-medium">
                        (Available: 1 to {tokenData?.quotaStats?.maxSubordinatesAllowed || 1} seats)
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        disabled={isQuotaLocked}
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
                          isQuotaLocked
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-[#111827] border-2 border-blue-500 text-white'
                        } font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-80`}
                      >
                        {tokenData?.quotaStats?.allowedOptions?.map((num: number) => (
                          <option key={num} value={num} className="bg-[#111827] text-white">
                            {num} Subordinates (+ 1 Leader = {num + 1} Total Seats)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const max = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
                        if (selectedSubordinates > max) {
                          setFormError(`Subordinate quota exceeds maximum allowed (${max} seats).`);
                          return;
                        }
                        setFormError(null);
                        setIsQuotaLocked(!isQuotaLocked);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 ${
                        isQuotaLocked
                          ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isQuotaLocked ? 'Quota Locked' : 'Lock Quota'}</span>
                    </button>
                  </div>
                  {tokenData?.quotaStats?.isLastPod ? (
                    <p className="text-[10px] text-amber-300 mt-2 font-medium bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 leading-relaxed">
                      *Because other pods have locked their quotas, this final pod automatically receives exactly {tokenData?.quotaStats?.maxSubordinatesAllowed} subordinates (+ 1 leader = {tokenData?.quotaStats?.maxSubordinatesAllowed + 1} people) to ensure 100% full organizational capacity allocation.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-2">
                      *Dropdown options are capped at {tokenData?.quotaStats?.maxSubordinatesAllowed} people to ensure balanced inter-pod allocation. Once locked and confirmed, click the activation button below.
                    </p>
                  )}
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Specialized Operational Pod
                  </span>
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Specialized Operational Pod
                  </span>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center text-[11px] text-slate-500">
        Sentirix Autonomous Support Intelligence • Amazon Two-Pizza Quota Architecture
      </footer>
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
