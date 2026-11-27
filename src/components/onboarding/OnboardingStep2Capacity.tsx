'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { OnboardingDraft } from '../../lib/types';
import type { PodDraft } from './onboarding.constants';

export interface OnboardingStep2Props {
  typedMembers: number;
  setTypedMembers: React.Dispatch<React.SetStateAction<number>>;
  calculatedPodCount: number;
  isCapacityLocked: boolean;
  setIsCapacityLocked: React.Dispatch<React.SetStateAction<boolean>>;
  pods: PodDraft[];
  totalAllocatedSeats: number;
  isAllocationBalanced: boolean;
  handleLockCapacity: () => void;
  handleUnlockCapacity: () => void;
  handleAdjustPodSeats: (podIndex: number, delta: number) => void;
  handleResetPodSeatsToBalanced: () => void;
  handleNextToStep3: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  persistDraft: (overrides?: Partial<OnboardingDraft>) => void;
}

/** Onboarding Step 2: Team headcount lock & per-pod seat distribution. */
export function OnboardingStep2Capacity({
  typedMembers,
  setTypedMembers,
  calculatedPodCount,
  isCapacityLocked,
  setIsCapacityLocked,
  pods,
  totalAllocatedSeats,
  isAllocationBalanced,
  handleLockCapacity,
  handleUnlockCapacity,
  handleAdjustPodSeats,
  handleResetPodSeatsToBalanced,
  handleNextToStep3,
  setCurrentStep,
  setErrorMessage,
  persistDraft,
}: OnboardingStep2Props) {
  return (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Total Team Member Allocation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify the total customer support headcount for your organization. Sevaniq will automatically structure your team into dedicated operational pods.
                </p>
              </div>

              {/* Interactive Typing Input & Lock Action Card */}
              <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Total Team Members:
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Max 8 members per pod for zero-latency operations
                    </p>
                  </div>

                  {isCapacityLocked ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>LOCKED BY ADMIN</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleUnlockCapacity}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        title="Unlock to edit total headcount"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Edit Total</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      disabled={isCapacityLocked}
                      value={typedMembers}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const nextVal = isNaN(val) ? 1 : Math.max(1, val);
                        setTypedMembers(nextVal);
                        setIsCapacityLocked(false);
                        persistDraft({ typedMembers: nextVal, isCapacityLocked: false, lastActiveStep: 2 });
                      }}
                      className={`w-full bg-[#111827] border-2 text-white text-3xl font-black rounded-xl px-4 py-3 text-center tracking-wide focus:outline-hidden font-mono transition-all ${
                        isCapacityLocked
                          ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-200 cursor-not-allowed'
                          : 'border-blue-500/60 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-bold text-white">
                      <span>Customer Support Personnel</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      With <strong className="text-white">{typedMembers} members</strong>, your organization structures into <strong className="text-emerald-400">{calculatedPodCount} dedicated {calculatedPodCount === 1 ? 'pod' : 'pods'}</strong>.
                    </p>
                  </div>
                </div>

                {/* Primary Lock Trigger when not locked */}
                {!isCapacityLocked && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-400">
                      Click Lock to distribute seat quotas and view pod allocations.
                    </p>
                    <button
                      type="button"
                      onClick={handleLockCapacity}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock &amp; Allocate Capacity</span>
                    </button>
                  </div>
                )}
              </div>

              {/* DYNAMIC PER-POD ALLOCATION SECTION - REVEALED ON LOCKED */}
              {isCapacityLocked && (
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-blue-500/40 space-y-5 shadow-2xl animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Pod Seat Distribution</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Designated seat limits for each frontline pod. Pod Leaders will receive these fixed quotas upon activation.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isAllocationBalanced
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-950/80 border-amber-500/40 text-amber-400 animate-pulse'
                      }`}>
                        {isAllocationBalanced ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{totalAllocatedSeats} / {typedMembers} Seats Allocated</span>
                      </span>

                      {!isAllocationBalanced && (
                        <button
                          type="button"
                          onClick={handleResetPodSeatsToBalanced}
                          className="text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Auto-balance seats evenly across pods"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Auto-Balance</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Warning banner if not balanced */}
                  {!isAllocationBalanced && (
                    <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {(() => {
                          const diff = Math.abs(typedMembers - totalAllocatedSeats);
                          const isUnder = totalAllocatedSeats < typedMembers;
                          const seatWord = diff === 1 ? 'seat' : 'seats';
                          return `Allocation mismatch: ${diff} ${seatWord} ${isUnder ? 'remaining unassigned' : 'over-allocated'}. Adjust pod capacities to match your ${typedMembers}-seat target.`;
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Pod Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pods.map((pod, pIdx) => {
                      const podSeats = pod.seats || 1;
                      const agentsCount = Math.max(0, podSeats - 1);
                      const podLabel = pod.name || `Pod ${pIdx + 1 < 10 ? `0${pIdx + 1}` : pIdx + 1}`;

                      return (
                        <div
                          key={pIdx}
                          className="p-4 rounded-xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>{podLabel}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                              Max 8 Seats
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800">
                            <div>
                              <div className="text-base font-black font-mono text-white">
                                {podSeats} <span className="text-xs font-normal text-slate-400">Seats</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                1 Leader + {agentsCount} {agentsCount === 1 ? 'Agent' : 'Agents'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={podSeats <= 1}
                                onClick={() => handleAdjustPodSeats(pIdx, -1)}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                                title="Decrease seat"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs text-white">
                                {podSeats}
                              </span>
                              <button
                                type="button"
                                disabled={podSeats >= 8}
                                onClick={() => handleAdjustPodSeats(pIdx, 1)}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                                title="Increase seat"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(1);
                    persistDraft({ lastActiveStep: 1 });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer self-start sm:self-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div>
                  <button
                    type="button"
                    disabled={!isCapacityLocked || !isAllocationBalanced}
                    onClick={handleNextToStep3}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                  >
                    <span>Next: Configure Pods &amp; Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
  );
}
