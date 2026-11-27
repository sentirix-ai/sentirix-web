'use client';

import React from 'react';
import {
  ArrowRightLeft,
  Clock,
  Crown,
  Lock,
  Pencil,
  Search,
  ShieldCheck,
  Unlock,
  Users,
} from 'lucide-react';
import type {
  CockpitPresenceUser,
  CockpitWorkspaceItem,
  CompanyCockpitData,
} from '../../lib/types';
import { cleanPodName, formatDuration } from './cockpit.utils';

export interface CockpitPersonnelTabProps {
  cockpitData: CompanyCockpitData;
  workspaces: CockpitWorkspaceItem[];
  personnelSearchQuery: string;
  setPersonnelSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleOpenEditUser: (user: CockpitPresenceUser, podName?: string) => void;
  handleOpenPromoteUser: (user: CockpitPresenceUser, pod: CockpitWorkspaceItem) => void;
  handleOpenSwapUser: (user: CockpitPresenceUser, pod: CockpitWorkspaceItem) => void;
}

/** Company Personnel Directory: governance actions, KPI metrics, and pod roster. */
export function CockpitPersonnelTab({
  cockpitData,
  workspaces,
  personnelSearchQuery,
  setPersonnelSearchQuery,
  handleOpenEditUser,
  handleOpenPromoteUser,
  handleOpenSwapUser,
}: CockpitPersonnelTabProps) {
  return (
          <section className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Personnel Directory &amp; Identity Governance</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit, filter, and manage staff identities across all operational pods. Company owners can rename leaders and frontline members, and reassign workforce across pods.
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
                (u) => u.role !== 'TENANT_OWNER' && u.role !== 'ADMIN',
              );
              const totalLeaders = allStaff.filter((u) => u.role === 'LEADER').length;
              const totalMembers = allStaff.filter((u) => u.role !== 'LEADER').length;
              const onlineCount = allStaff.filter((u) => u.isOnline).length;

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
                {workspaces.map((ws, wsIdx: number) => {
                  const cleanedPod = cleanPodName(ws.name);
                  const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                    (u) =>
                      u.role !== 'TENANT_OWNER' &&
                      u.role !== 'ADMIN' &&
                      (u.workspaceId === ws.id || u.podName === ws.name),
                  );

                  const leaderUser = podUsers.find((u) => u.role === 'LEADER');
                  const memberUsers = podUsers
                    .filter((u) => (u.userId || u.id) !== (leaderUser?.userId || leaderUser?.id))
                    .sort((a, b) => {
                      const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                      const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                      return timeA - timeB;
                    });

                  const orderedUsers = leaderUser ? [leaderUser, ...memberUsers] : memberUsers;

                  // Filter by search query
                  const filteredUsers = orderedUsers.filter((u) => {
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
                              <th className="py-3 px-4 text-right">Company Governance</th>
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
                              filteredUsers.map((user) => {
                                const isLeader = user.role === 'LEADER';
                                const memberIndex = memberUsers.findIndex(
                                  (m) => (m.userId || m.id) === (user.userId || user.id),
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
  );
}
