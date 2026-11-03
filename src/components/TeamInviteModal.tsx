'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  UserCheck,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';
import { WorkspaceData } from '../lib/types';
import {
  regenerateWorkspaceToken,
  removeWorkspaceMember,
  fetchMyWorkspace,
  generateSingleUseToken,
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
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Manual & automatic refresh function
  const refreshLatestData = useCallback(async () => {
    if (!ownerIdentifier) return;
    try {
      const fresh = await fetchMyWorkspace(ownerIdentifier);
      if (fresh) {
        onWorkspaceUpdated(fresh);
      }
    } catch {
      // Ignore background refresh errors
    }
  }, [ownerIdentifier, onWorkspaceUpdated]);

  // Real-time polling while modal is open (every 2.5 seconds)
  useEffect(() => {
    if (!isOpen || !ownerIdentifier) return;

    // Immediately fetch the freshest data upon opening
    refreshLatestData();

    const interval = setInterval(() => {
      refreshLatestData();
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, ownerIdentifier, refreshLatestData]);

  if (!isOpen || !workspace) return null;

  const inviteUrl =
    workspace.inviteUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${workspace.inviteToken}`
      : `http://localhost:3000/join?token=${workspace.inviteToken}`);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGenerateNextLink = async () => {
    if (workspace.remainingSeats <= 0) {
      alert('Workspace capacity full (8/8 members).');
      return;
    }
    setIsRegenerating(true);
    const res = await generateSingleUseToken(ownerIdentifier);
    setIsRegenerating(false);

    if (res.success && res.inviteToken) {
      onWorkspaceUpdated({
        ...workspace,
        inviteToken: res.inviteToken,
        inviteUrl: res.inviteUrl || `${window.location.origin}/join?token=${res.inviteToken}`,
      });
      setFeedbackMsg('New single-use link generated! Ready to share with your next member.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLatestData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        'Regenerating the link will invalidate the current link. Anyone who has already joined will remain in the workspace, but new members must use the new link. Continue?',
      )
    ) {
      return;
    }

    setIsRegenerating(true);
    const res = await regenerateWorkspaceToken(ownerIdentifier);
    setIsRegenerating(false);

    if (res.success) {
      if (res.workspace) {
        onWorkspaceUpdated(res.workspace);
      } else {
        await refreshLatestData();
      }
      setFeedbackMsg('New invite link generated. All active members are preserved.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    setRemovingId(memberId);
    const res = await removeWorkspaceMember(ownerIdentifier, memberId);
    setRemovingId(null);

    if (res.success) {
      await refreshLatestData();
      setFeedbackMsg(`${memberName} removed from workspace.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const membersCount = workspace.members?.length ?? workspace.currentMembersCount ?? 0;
  const percentageUsed = Math.min(100, Math.round((membersCount / workspace.maxMembers) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#0e183c] to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Team Workspace Link
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  8 Seats
                </span>
              </div>
              <p className="text-xs text-slate-300">
                One-Click Onboarding for your Support Operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Feedback Message */}
          {feedbackMsg && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Seat Capacity Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Active Team Capacity
              </span>
              <span className="font-bold text-slate-900">
                {membersCount} / {workspace.maxMembers} Seats Active
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percentageUsed >= 100
                    ? 'bg-rose-500'
                    : percentageUsed >= 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {workspace.remainingSeats > 0
                ? `${workspace.remainingSeats} more support team member${workspace.remainingSeats > 1 ? 's' : ''} can join using this link.`
                : 'Workspace is at maximum capacity (8 members). Remove an agent below to free up a seat.'}
            </p>
          </div>

          {/* Shareable Single-Use Link Section (Requirement 1) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Single-Use Workspace Invite Link
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                1 Link per Member
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate select-all">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{inviteUrl}</span>
              </div>
              <button
                onClick={handleCopyLink}
                disabled={workspace.remainingSeats <= 0}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : workspace.remainingSeats <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handleGenerateNextLink}
                disabled={isRegenerating || workspace.remainingSeats <= 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 text-slate-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Generate fresh single-use link for next member"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">Generate New Link</span>
              </button>
            </div>
            <div className="mt-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Single-Use Policy:</strong> Each link can only be used by 1 member. Once a member joins, that link immediately expires. Click <em>Generate New Link</em> to create an invite link for your next member.
              </span>
            </div>
          </div>

          {/* Joined Team Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Joined Team Members ({membersCount})
                </h4>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                  title="Refresh list now"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Replace current link with a fresh link (e.g., if link was leaked)"
              >
                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Link</span>
              </button>
            </div>

            {(!workspace.members || workspace.members.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No team members joined yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Copy and send your team link to up to 8 team members.
                </p>
              </div>
            ) : (
              <div className="space-y-2 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {workspace.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center ring-2 ring-indigo-100">
                        {member.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{member.fullName}</span>
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                            Support Agent
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.id, member.fullName)}
                      disabled={removingId === member.id}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove member from workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Real-time auto-sync & WebSocket presence enabled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
