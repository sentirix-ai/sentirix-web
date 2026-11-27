'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Crown,
  LogOut,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import type {
  CockpitWorkspaceItem,
  SuperAdminCockpitData,
} from '../../lib/types';
import {
  cleanPodName,
  type EditingUserTarget,
  type ForceLogoutTarget,
  type PromotingUserTarget,
  type SwappingUserTarget,
} from './cockpit.utils';

export interface CockpitPersonnelModalsProps {
  cockpitData: SuperAdminCockpitData;
  workspaces: CockpitWorkspaceItem[];
  confirmForceLogoutTarget: ForceLogoutTarget | null;
  setConfirmForceLogoutTarget: React.Dispatch<React.SetStateAction<ForceLogoutTarget | null>>;
  forcingLogoutUser: string | null;
  handleForceLogout: (target: ForceLogoutTarget) => Promise<void>;
  editingUser: EditingUserTarget | null;
  setEditingUser: React.Dispatch<React.SetStateAction<EditingUserTarget | null>>;
  editNameInput: string;
  setEditNameInput: React.Dispatch<React.SetStateAction<string>>;
  isSavingName: boolean;
  editNameError: string | null;
  handleSavePersonnelName: (e: React.FormEvent) => Promise<void>;
  promotingUser: PromotingUserTarget | null;
  setPromotingUser: React.Dispatch<React.SetStateAction<PromotingUserTarget | null>>;
  isPromoting: boolean;
  promoteError: string | null;
  handleExecutePromote: (e: React.FormEvent) => Promise<void>;
  swappingUserA: SwappingUserTarget | null;
  setSwappingUserA: React.Dispatch<React.SetStateAction<SwappingUserTarget | null>>;
  swapTargetPodId: string;
  setSwapTargetPodId: React.Dispatch<React.SetStateAction<string>>;
  swapTargetUserBId: string;
  setSwapTargetUserBId: React.Dispatch<React.SetStateAction<string>>;
  isSwapping: boolean;
  swapError: string | null;
  handleExecuteSwap: (e: React.FormEvent) => Promise<void>;
}

/** Sovereign identity, force logout, leader promotion, and cross-pod swap modals. */
export function CockpitPersonnelModals({
  cockpitData,
  workspaces,
  confirmForceLogoutTarget,
  setConfirmForceLogoutTarget,
  forcingLogoutUser,
  handleForceLogout,
  editingUser,
  setEditingUser,
  editNameInput,
  setEditNameInput,
  isSavingName,
  editNameError,
  handleSavePersonnelName,
  promotingUser,
  setPromotingUser,
  isPromoting,
  promoteError,
  handleExecutePromote,
  swappingUserA,
  setSwappingUserA,
  swapTargetPodId,
  setSwapTargetPodId,
  swapTargetUserBId,
  setSwapTargetUserBId,
  isSwapping,
  swapError,
  handleExecuteSwap,
}: CockpitPersonnelModalsProps) {
  return (
    <>
        {confirmForceLogoutTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-rose-500/40 rounded-2xl w-full max-w-lg shadow-2xl shadow-rose-950/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Sovereign Session Revocation</h3>
                    <p className="text-[11px] text-rose-400/90 font-medium">Zero-Trust Session Invalidation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!forcingLogoutUser) setConfirmForceLogoutTarget(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Target Personnel</span>
                    <span className="font-bold text-white text-xs">
                      {confirmForceLogoutTarget.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Operational Tier</span>
                    <span className="font-bold text-rose-300 uppercase px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-[10px] tracking-wider">
                      {confirmForceLogoutTarget.role === 'Leader' ? 'POD LEADER • HIGH PRIVILEGE' : 'FRONTLINE AGENT • STANDARD ACCESS'}
                    </span>
                  </div>
                  {confirmForceLogoutTarget.token && (
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Cryptographic Token</span>
                      <span className="font-mono text-amber-300 text-[10.5px] font-bold">
                        {confirmForceLogoutTarget.token}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-rose-300 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    Immediate Revocation Protocol
                  </p>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    This action will terminate all active WebSocket tunnels and purge browser authentication tokens immediately. Re-entry will be prohibited until an administrator re-provisions a single-use token.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={!!forcingLogoutUser}
                    onClick={() => setConfirmForceLogoutTarget(null)}
                    className="px-4 py-2 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!!forcingLogoutUser}
                    onClick={() => handleForceLogout(confirmForceLogoutTarget)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 border border-rose-400/40 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{forcingLogoutUser ? 'Revoking Active Session...' : 'Revoke Session Immediately'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Edit Personnel Profile</h3>
                    <p className="text-[11px] text-slate-400">Administrative Profile Update</p>
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isSavingName}
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    placeholder="Enter full name..."
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
                  />
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
                    <p className="text-[11px] text-slate-400">Reassign pod leadership within this team</p>
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
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Promote to Leader
                      </span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {promotingUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Assumes Pod Leader responsibilities
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Transition to Agent
                      </span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {promotingUser.currentLeaderName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Transitions to Frontline Agent role
                      </span>
                    </div>
                  </div>
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
                    <p className="text-[11px] text-slate-400">Reassign staff between pods while maintaining team capacity</p>
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
                    <span>Selected Personnel</span>
                    <span className="font-bold text-white">{swappingUserA.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Current Pod</span>
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
                    Destination Pod <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    disabled={isSwapping}
                    value={swapTargetPodId}
                    onChange={(e) => {
                      const targetId = e.target.value;
                      setSwapTargetPodId(targetId);
                      const targetPod = workspaces.find((w) => w.id === targetId);
                      const targetUsers = (cockpitData?.presenceMonitoring || []).filter(
                        (u) => u.workspaceId === targetId || (targetPod && u.podName === targetPod.name),
                      );
                      const targetLeader = targetUsers.find((u) => u.role === 'LEADER');
                      const targetMembers = targetUsers
                        .filter((u) => (u.userId || u.id) !== (targetLeader?.userId || targetLeader?.id))
                        .sort((a, b) => {
                          const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                          const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                          return timeA - timeB;
                        });
                      const ordered = targetLeader ? [targetLeader, ...targetMembers] : targetMembers;
                      setSwapTargetUserBId(ordered[0]?.userId || ordered[0]?.id || '');
                    }}
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                  >
                    {workspaces
                      .filter((w) => w.id !== swappingUserA.podId)
                      .map((w) => {
                        const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                          (u) => u.workspaceId === w.id || u.podName === w.name,
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
                    Exchange With (Destination Pod) <span className="text-red-400">*</span>
                  </label>
                  {(() => {
                    const targetPod = workspaces.find((w) => w.id === swapTargetPodId);
                    const targetUsers = (cockpitData?.presenceMonitoring || []).filter(
                      (u) => u.workspaceId === swapTargetPodId || (targetPod && u.podName === targetPod.name),
                    );

                    const targetLeader = targetUsers.find((u) => u.role === 'LEADER');
                    const targetMembers = targetUsers
                      .filter((u) => (u.userId || u.id) !== (targetLeader?.userId || targetLeader?.id))
                      .sort((a, b) => {
                        const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                        const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                        return timeA - timeB;
                      });
                    const orderedTargetUsers = targetLeader ? [targetLeader, ...targetMembers] : targetMembers;

                    if (orderedTargetUsers.length === 0) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs italic">
                          No active personnel available in this pod.
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
                        {orderedTargetUsers.map((u) => (
                          <option key={u.userId || u.id} value={u.userId || u.id}>
                            {u.fullName || u.username} &bull; {u.role === 'LEADER' ? 'Pod Leader' : 'Frontline Agent'}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
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
                        <span>Processing Exchange...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Confirm Exchange</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
