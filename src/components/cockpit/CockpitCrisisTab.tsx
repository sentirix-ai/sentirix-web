'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type {
  CockpitCrisisTicket,
  CockpitSlaBreachedTicket,
} from '../../lib/types';

export interface CockpitCrisisTabProps {
  crisisTickets: CockpitCrisisTicket[];
  slaBreachedTickets: CockpitSlaBreachedTicket[];
}

/** Super Admin Crisis & SLA Radar tab. */
export function CockpitCrisisTab({
  crisisTickets,
  slaBreachedTickets,
}: CockpitCrisisTabProps) {
  return (
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Crisis Radar &amp; SLA Escalations</span>
              </h2>
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
                      {crisisTickets.map((t) => (
                        <div
                          key={t.id}
                          className={`p-4 rounded-xl border ${
                            t.isHanging
                              ? 'bg-rose-950/40 border-rose-600/90 shadow-md shadow-rose-950/50'
                              : 'bg-red-950/30 border-red-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-black text-red-400">
                              #{t.ticketNumber}
                            </span>
                            <span className="text-[10px] font-bold bg-red-900/60 text-red-200 px-2 py-0.5 rounded">
                              {t.priority}
                            </span>
                            {t.isHanging && (
                              <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>TIKET MENGGANTUNG ({t.hangingReason || 'Staf Terputus'})</span>
                              </span>
                            )}
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
                      {slaBreachedTickets.map((t) => (
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
  );
}
