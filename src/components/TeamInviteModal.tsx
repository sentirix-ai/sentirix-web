'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  X,
  UserCheck,
  Link as LinkIcon,
  Clock,
  Radio,
  UserPlus,
  Lock,
  Users,
} from 'lucide-react';
import { WorkspaceData, WorkspaceMember } from '../lib/types';
import {
  fetchMyWorkspace,
  generateSingleUseToken,
  regenerateToken,
} from '../lib/api';

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceData | null;
  ownerIdentifier: string;
  onWorkspaceUpdated: (updated: WorkspaceData) => void;
}

export const TeamInviteModal: React.FC<TeamInviteModalProps> = ({
  isOpen,
  onClose,
  workspace,
  ownerIdentifier,
  onWorkspaceUpdated,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [copiedMemberToken, setCopiedMemberToken] = useState<string | null>(null);
  const [copiedGeneralToken, setCopiedGeneralToken] = useState(false);

  // Manual & automatic refresh function
  const refreshLatestData = useCallback(async () => {
    if (!ownerIdentifier) return;
    try {
      const fresh = await fetchMyWorkspace(ownerIdentifier);
      if (fresh) {
        if (fresh.isLeader === false) {
          onClose();
          alert('Authority Revoked: Super Admin has reassigned leadership of this pod. You are no longer authorized as Pod Leader.');
          return;
        }
        onWorkspaceUpdated(fresh);
      }
    } catch {
      // Ignore background refresh errors
    }
  }, [ownerIdentifier, onWorkspaceUpdated, onClose]);

  // Real-time polling while modal is open (every 3 seconds)
  useEffect(() => {
    if (!isOpen || !ownerIdentifier) return;

    // Immediately fetch the freshest data upon opening
    refreshLatestData();

    const interval = setInterval(() => {
      refreshLatestData();
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, ownerIdentifier, refreshLatestData]);

  if (!isOpen || !workspace || workspace.isLeader === false) return null;

  const handleCopyMemberLink = async (tok: string, memberName: string) => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${tok}`
      : `http://localhost:3000/join?token=${tok}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedMemberToken(tok);
      setFeedbackMsg(`Login link for ${memberName} copied to clipboard!`);
      setTimeout(() => {
        setCopiedMemberToken(null);
        setFeedbackMsg(null);
      }, 2500);
    } catch {
      setCopiedMemberToken(tok);
      setTimeout(() => setCopiedMemberToken(null), 2500);
    }
  };

  const handleCopyGeneralLink = async () => {
    if (!workspace.inviteToken) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${workspace.inviteToken}`
      : `http://localhost:3000/join?token=${workspace.inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGeneralToken(true);
      setFeedbackMsg('Unclaimed single-use invite link copied to clipboard!');
      setTimeout(() => {
        setCopiedGeneralToken(false);
        setFeedbackMsg(null);
      }, 2500);
    } catch {
      setCopiedGeneralToken(true);
      setTimeout(() => setCopiedGeneralToken(false), 2500);
    }
  };

  const handleGenerateNextLink = async () => {
    if (workspace.remainingSeats <= 0) {
      alert(`Pod capacity is fully allocated (${workspace.maxMembers}/${workspace.maxMembers} seats claimed).`);
      return;
    }
    setIsRegenerating(true);
    const res = await generateSingleUseToken(ownerIdentifier);
    setIsRegenerating(false);

    if (res.success && res.inviteToken) {
      const newUrl = res.inviteUrl || `${window.location.origin}/join?token=${res.inviteToken}`;
      try {
        await navigator.clipboard.writeText(newUrl);
      } catch {}
      setFeedbackMsg('New single-use invitation token generated and copied to clipboard! Ready to share with agent.');
      setTimeout(() => setFeedbackMsg(null), 4000);
      await refreshLatestData();
    } else if (res.error) {
      if (res.error.toLowerCase().includes('access denied') || res.error.toLowerCase().includes('not authorized')) {
        onClose();
        alert('Authority Revoked: You are no longer authorized as Pod Leader to generate tokens.');
        return;
      }
      setFeedbackMsg(res.error);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLatestData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRegenerateMemberToken = async (oldToken: string, memberName: string) => {
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken, ownerIdentifier);
      if (res.success && res.newToken) {
        const freshJoinUrl = res.joinUrl || `${window.location.origin}/join?token=${res.newToken}`;
        try {
          await navigator.clipboard.writeText(freshJoinUrl);
        } catch {}
        setFeedbackMsg(`Fresh single-use token issued and copied to clipboard! Share the link with ${memberName}.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        await refreshLatestData();
      } else {
        if (res.error?.toLowerCase().includes('access denied') || res.error?.toLowerCase().includes('not authorized')) {
          onClose();
          alert('Authority Revoked: You are no longer authorized as Pod Leader to regenerate credentials.');
          return;
        }
        setFeedbackMsg(res.error || 'Failed to regenerate token.');
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch {
      setFeedbackMsg('Network error occurred while regenerating token.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setRegeneratingToken(null);
    }
  };

  const membersCount = workspace.members?.length ?? workspace.currentMembersCount ?? 0;
  const percentageUsed = Math.min(100, Math.round((membersCount / (workspace.maxMembers || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Ultra-Clean without redundant subtitle */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0e183c] to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-base tracking-tight text-white">
                Pod Member Access &amp; Single-Use Tokens
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Quota Locked ({workspace.maxMembers} Staff)</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Feedback Message Toast */}
          {feedbackMsg && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{feedbackMsg}</span>
            </div>
          )}

          {/* Locked Team Capacity Card - Compact & Clutter-Free */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Locked Agent Seat Capacity
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                {membersCount} / {workspace.maxMembers} Staff Allocated
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percentageUsed >= 100
                    ? 'bg-emerald-600'
                    : percentageUsed >= 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>

          {/* Authorized Frontline Agents List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Authorized Frontline Agents ({membersCount})
                </h4>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                  title="Refresh presence and token status"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Regenerate active when agent is offline
              </span>
            </div>

            {(!workspace.members || workspace.members.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No frontline agents have joined this pod yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distribute the official invitation tokens below to onboard up to {workspace.maxMembers} authorized support agents.
                </p>
              </div>
            ) : (
              <div className="space-y-2 border border-slate-200 rounded-xl divide-y divide-slate-100">
                {workspace.members.map((member: WorkspaceMember) => {
                  const isMemberLoggedOut = !member.isOnline;
                  const memberNeedsRegen = isMemberLoggedOut && (member.needsRegeneration ?? true);
                  const isFreshTokenReady = isMemberLoggedOut && !memberNeedsRegen && (member.freshTokenReady || member.tokenIsUsed === false);
                  const isCopied = copiedMemberToken === member.token;

                  return (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center ring-2 ring-indigo-100 shrink-0 shadow-xs">
                          {member.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{member.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              @{member.username}
                            </span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                              Frontline Agent
                            </span>

                            {/* Real-time Presence Badge */}
                            {member.isOnline ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : member.presenceStatus === 'TERPUTUS' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5" title="Browser closed or disconnected unexpectedly">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Browser Closed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Logged Out
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                            {member.token && (
                              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {member.token}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Member Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Copy Link Button for this Member */}
                        {member.token && (
                          <button
                            type="button"
                            disabled={member.isOnline}
                            onClick={() => !member.isOnline && handleCopyMemberLink(member.token!, member.fullName)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-2xs ${
                              member.isOnline
                                ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                : isCopied
                                  ? 'bg-emerald-600 border-emerald-600 text-white cursor-pointer'
                                  : isFreshTokenReady
                                    ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-xs cursor-pointer'
                                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 cursor-pointer'
                            }`}
                            title={
                              member.isOnline
                                ? 'Agent is currently online and active. Token link is locked.'
                                : isFreshTokenReady
                                  ? 'Copy fresh activation link to share with agent'
                                  : 'Copy agent single-use login link'
                            }
                          >
                            {isCopied && !member.isOnline ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isFreshTokenReady ? 'Copy Fresh Link' : 'Copy Link'}</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Regenerate Button - Quiet state when idle, reactive on hover */}
                        <button
                          type="button"
                          disabled={regeneratingToken === member.token || member.isOnline || !member.token}
                          onClick={() => member.token && handleRegenerateMemberToken(member.token, member.fullName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 flex items-center gap-1.5 ${
                            member.isOnline
                              ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                              : memberNeedsRegen
                                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border-rose-600 hover:border-rose-700 text-white shadow-2xs hover:shadow-md cursor-pointer'
                                : isFreshTokenReady
                                  ? 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border-emerald-300 hover:border-emerald-400 text-emerald-800 shadow-2xs hover:shadow-xs cursor-pointer'
                                  : 'bg-white hover:bg-amber-50 active:bg-amber-100 border-amber-300 text-amber-700 cursor-pointer'
                          }`}
                          title={
                            member.isOnline
                              ? 'Agent is currently online and active'
                              : memberNeedsRegen
                                ? 'Agent is logged out. Click to issue a fresh single-use login token.'
                                : isFreshTokenReady
                                  ? 'Fresh single-use token is ready to share with this agent.'
                                  : 'Regenerate single-use token for this agent'
                          }
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              regeneratingToken === member.token ? 'animate-spin' : ''
                            } ${
                              member.isOnline
                                ? 'text-slate-400'
                                : memberNeedsRegen
                                  ? 'text-white'
                                  : isFreshTokenReady
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                            }`}
                          />
                          <span>
                            {regeneratingToken === member.token
                              ? 'Processing...'
                              : member.isOnline
                                ? 'Active'
                                : memberNeedsRegen
                                  ? 'Regenerate'
                                  : isFreshTokenReady
                                    ? 'Regenerated ✓'
                                    : 'Regenerate'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Seat Slot if pod is not full */}
                {workspace.remainingSeats > 0 && (
                  <div className="p-3.5 flex items-center justify-between bg-slate-50 border-t border-dashed border-slate-300 rounded-b-xl gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <span>Unclaimed Seat ({workspace.remainingSeats} Seat{workspace.remainingSeats > 1 ? 's' : ''} Available)</span>
                          {workspace.inviteToken && (
                            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                              {workspace.inviteToken}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pre-allocated single-use token ready for frontline agent onboarding
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyGeneralLink}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      {copiedGeneralToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Copy Invite Link</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            Real-time auto-sync &amp; WebSocket presence enabled
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
