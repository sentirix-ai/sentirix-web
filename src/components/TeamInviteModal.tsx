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
  Clock,
  Radio,
  UserPlus,
} from 'lucide-react';
import { WorkspaceData, WorkspaceMember } from '../lib/types';
import {
  removeWorkspaceMember,
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
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [copiedMemberToken, setCopiedMemberToken] = useState<string | null>(null);

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

  if (!isOpen || !workspace) return null;

  const handleCopyMemberLink = async (tok: string) => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${tok}`
      : `http://localhost:3000/join?token=${tok}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedMemberToken(tok);
      setTimeout(() => setCopiedMemberToken(null), 2500);
    } catch {
      setCopiedMemberToken(tok);
      setTimeout(() => setCopiedMemberToken(null), 2500);
    }
  };

  const handleGenerateNextLink = async () => {
    if (workspace.remainingSeats <= 0) {
      alert(`Kapasitas pod penuh (${workspace.maxMembers}/${workspace.maxMembers} kursi terisi).`);
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
      setFeedbackMsg('Tautan single-use baru berhasil dibuat dan disalin ke clipboard! Siap dibagikan ke anggota baru.');
      setTimeout(() => setFeedbackMsg(null), 4000);
      await refreshLatestData();
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
      const res = await regenerateToken(oldToken);
      if (res.success && res.newToken) {
        const freshJoinUrl = res.joinUrl || `${window.location.origin}/join?token=${res.newToken}`;
        try {
          await navigator.clipboard.writeText(freshJoinUrl);
        } catch {}
        setFeedbackMsg(`Token baru untuk ${memberName} berhasil diterbitkan dan disalin ke clipboard! Bagikan tautan ke ${memberName}.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        await refreshLatestData();
      } else {
        setFeedbackMsg(res.error || 'Gagal menerbitkan ulang token.');
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch {
      setFeedbackMsg('Terjadi kendala jaringan saat menerbitkan token.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setRegeneratingToken(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengeluarkan ${memberName} dari pod ini? Kursi akan kembali kosong.`)) {
      return;
    }

    setRemovingId(memberId);
    const res = await removeWorkspaceMember(ownerIdentifier, memberId);
    setRemovingId(null);

    if (res.success) {
      await refreshLatestData();
      setFeedbackMsg(`${memberName} berhasil dikeluarkan dari pod.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const membersCount = workspace.members?.length ?? workspace.currentMembersCount ?? 0;
  const percentageUsed = Math.min(100, Math.round((membersCount / (workspace.maxMembers || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0e183c] to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-xs">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Team Workspace Link
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {workspace.maxMembers} Seats
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {workspace.name || 'One-Click Onboarding for your Support Operations'}
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
              <span className="font-medium">{feedbackMsg}</span>
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
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
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
              {workspace.remainingSeats > 0 ? (
                `Tersedia ${workspace.remainingSeats} kursi kosong. Gunakan tombol di bawah untuk mengundang anggota baru.`
              ) : (
                `Kapasitas pod telah terisi penuh (${membersCount}/${workspace.maxMembers} anggota). Gunakan tombol regenerate pada baris anggota jika personel membutuhkan tautan login baru.`
              )}
            </p>
          </div>

          {/* Joined Team Members List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Joined Team Members ({membersCount})
                </h4>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                  title="Segarkan data presensi anggota"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Regenerate aktif saat anggota logout
              </span>
            </div>

            {(!workspace.members || workspace.members.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">Belum ada anggota tim yang bergabung</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bagikan tautan undangan ke hingga {workspace.maxMembers} staf helpdesk Anda.
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
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
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
                            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                              Support Agent
                            </span>
                            {/* Real-time Presence Badge */}
                            {member.isOnline ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : member.presenceStatus === 'TERPUTUS' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Terputus (Close Browser)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Logout
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Bergabung {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                            {member.token && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {member.token}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Member Action Buttons matching Cockpit */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Copy Link Button for this Member */}
                        {member.token && (
                          <button
                            type="button"
                            onClick={() => handleCopyMemberLink(member.token!)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              isCopied
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : isFreshTokenReady
                                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                            }`}
                            title={
                              isFreshTokenReady
                                ? 'Salin tautan aktivasi baru untuk dibagikan ke member'
                                : 'Salin tautan login member'
                            }
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isFreshTokenReady ? 'Salin Link Baru' : 'Salin Link'}</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Regenerate Button matching Super Admin Cockpit */}
                        <button
                          type="button"
                          disabled={regeneratingToken === member.token || member.isOnline || !member.token}
                          onClick={() => member.token && handleRegenerateMemberToken(member.token, member.fullName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 disabled:cursor-not-allowed ${
                            member.isOnline
                              ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                              : memberNeedsRegen
                                ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white font-extrabold shadow-md shadow-red-950/40 animate-pulse'
                                : isFreshTokenReady
                                  ? 'bg-emerald-950 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900'
                                  : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
                          }`}
                          title={
                            member.isOnline
                              ? 'Member sedang online melayani'
                              : memberNeedsRegen
                                ? 'Member sedang logout. Klik tombol merah ini terlebih dahulu untuk generate token baru agar member bisa login kembali.'
                                : isFreshTokenReady
                                  ? 'Token baru telah siap digunakan dan dapat dibagikan ke member.'
                                  : 'Terbitkan ulang token single-use untuk member ini'
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
                                    ? 'text-emerald-400'
                                    : 'text-amber-600'
                            }`}
                          />
                          <span>
                            {regeneratingToken === member.token
                              ? 'Proses...'
                              : member.isOnline
                                ? 'Aktif'
                                : memberNeedsRegen
                                  ? 'Regenerate'
                                  : isFreshTokenReady
                                    ? 'Regenerated ✓'
                                    : 'Regenerate'}
                          </span>
                        </button>

                        {/* Remove Member Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id, member.fullName)}
                          disabled={removingId === member.id}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Keluarkan anggota dari pod ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                        <div className="text-xs font-bold text-slate-700">
                          Kursi Kosong ({workspace.remainingSeats} Kursi Tersedia)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Klik tombol di kanan untuk menerbitkan dan menyalin tautan undangan staf baru
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateNextLink}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{isRegenerating ? 'Membuat...' : 'Salin Tautan Kursi Baru'}</span>
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
            Real-time auto-sync & WebSocket presence enabled
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
