'use client';

import React from 'react';
import { CheckCircle2, Layers, Lock, Unlock } from 'lucide-react';
import type { CockpitWorkspaceItem } from '../../lib/types';
import { cleanPodName } from './cockpit.utils';

export interface CockpitOverviewTabProps {
  workspaces: CockpitWorkspaceItem[];
}

/** Super Admin Overview tab: pod topology and domain service mapping. */
export function CockpitOverviewTab({ workspaces }: CockpitOverviewTabProps) {
  return (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Specialized Pod Topology</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time quota lock status per Pod Leader and active ticket load.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workspaces.map((ws, idx: number) => {
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
  );
}
