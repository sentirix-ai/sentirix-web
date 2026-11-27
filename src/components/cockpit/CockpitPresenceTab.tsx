'use client';

import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Crown,
  Lock,
  Radio,
  Unlock,
  Users,
} from 'lucide-react';
import type {
  CockpitPresenceUser,
  CockpitWorkspaceItem,
  SuperAdminCockpitData,
} from '../../lib/types';
import { formatDuration } from './cockpit.utils';

export interface CockpitPresenceTabProps {
  cockpitData: SuperAdminCockpitData;
  workspaces: CockpitWorkspaceItem[];
  currentTime: number;
  selectedUserHistory: CockpitPresenceUser | null;
  setSelectedUserHistory: React.Dispatch<React.SetStateAction<CockpitPresenceUser | null>>;
}

/** Super Admin Presence tab: real-time online duration, SLA state, and disconnect history. */
export function CockpitPresenceTab({
  cockpitData,
  workspaces,
  currentTime,
  selectedUserHistory,
  setSelectedUserHistory,
}: CockpitPresenceTabProps) {
  const renderPresenceRow = (user: CockpitPresenceUser, badgePrefix?: React.ReactNode) => {
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
            {user.role === 'SUPER_ADMIN' || user.username?.toLowerCase() === 'pungkyrama' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-950/90 to-yellow-950/80 border border-amber-500/60 text-amber-300 text-[11px] font-bold shadow-xs shadow-amber-500/10">
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Platform Founder Sovereign</span>
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
                Since: {user.latestLoginAt ? new Date(user.latestLoginAt).toLocaleTimeString() : '—'}
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
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>Staff Presence &amp; Online Duration (Leaders &amp; Agents)</span>
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
                (u) => u.role !== 'SUPER_ADMIN',
              );
              const totalStaffCount = staffUsers.length;
              const onlineStaffCount = staffUsers.filter((u) => u.isOnline).length;
              const offlineStaffCount = staffUsers.filter((u) => !u.isOnline).length;
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
              {workspaces.map((ws, wsIdx: number) => {
                const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                  (u) =>
                    u.role !== 'SUPER_ADMIN' &&
                    (u.workspaceId === ws.id || u.podName === ws.name),
                );

                const leaderUser = podUsers.find((u) => u.role === 'LEADER');
                const memberUsers = podUsers
                  .filter((u) => u.role !== 'LEADER')
                  .sort((a, b) => {
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
                            orderedUsers.map((user, uIdx: number) => {
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
                    {(() => {
                      const displaySessions = (selectedUserHistory.sessionHistory || []).filter(
                        (s) => !(s.durationSeconds === 0 && !s.isOnline && s.logoutReason === 'SESI_BARU_DIMULAI')
                      );

                      if (displaySessions.length === 0) {
                        return (
                          <p className="text-slate-500 text-xs text-center py-6">
                            No session history recorded for this user yet.
                          </p>
                        );
                      }

                      return (
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
                            {displaySessions.map((s, idx: number) => (
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
                                  ) : s.logoutReason === 'ADMIN_FORCE_LOGOUT' ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                                      Admin Force Logout
                                    </span>
                                  ) : s.isOnline && !s.logoutAt ? (
                                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                      Active Session
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                                      Session Ended
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
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
  );
}
