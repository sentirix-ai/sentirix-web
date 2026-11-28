'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GitFork,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type { CockpitWorkspaceItem } from '../../lib/types';
import { cleanPodName } from './cockpit.utils';

export interface NewPodDraftItem {
  name: string;
  seats: number;
  services: string[];
}

export interface CockpitPodModalsProps {
  isCreatePodOpen: boolean;
  setIsCreatePodOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deployPodStep: 1 | 2;
  setDeployPodStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  additionalMembersInput: number;
  setAdditionalMembersInput: React.Dispatch<React.SetStateAction<number>>;
  calculatedNewPodCount: number;
  isNewCapacityLocked: boolean;
  setIsNewCapacityLocked: React.Dispatch<React.SetStateAction<boolean>>;
  newPodsDraft: NewPodDraftItem[];
  handleLockNewPodCapacity: () => void;
  handleUnlockNewPodCapacity: () => void;
  handleAdjustNewPodSeats: (podIndex: number, delta: number) => void;
  handleResetNewPodSeatsToBalanced: () => void;
  allAvailableServices: string[];
  servicePodMap: Record<string, string[]>;
  customServicesList: string[];
  newCustomServiceInput: string;
  setNewCustomServiceInput: React.Dispatch<React.SetStateAction<string>>;
  editingCustomServiceName: string | null;
  editingCustomServiceText: string;
  setEditingCustomServiceText: React.Dispatch<React.SetStateAction<string>>;
  isDeployingPod: boolean;
  createPodError: string | null;
  setCreatePodError: React.Dispatch<React.SetStateAction<string | null>>;
  handleToggleServiceForNewPod: (podIndex: number, svc: string) => void;
  handleAddCustomService: () => void;
  handleDeleteCustomService: (svcToDelete: string) => void;
  handleStartEditCustomService: (svc: string) => void;
  handleSaveEditCustomService: (oldName: string) => void;
  handleCancelEditCustomService: () => void;
  handleDeploySpecializedPod: (e: React.FormEvent) => Promise<void>;
  selectedPodForAddSeat: CockpitWorkspaceItem | null;
  setSelectedPodForAddSeat: React.Dispatch<React.SetStateAction<CockpitWorkspaceItem | null>>;
  additionalSeatsCount: number;
  setAdditionalSeatsCount: React.Dispatch<React.SetStateAction<number>>;
  isProcessingAddSeat: boolean;
  addSeatError: string | null;
  handleAddSeatsToPod: (e: React.FormEvent) => Promise<void>;
}

/** Deploy new operational pods (gated by 8-member capacity) & add seat capacity expansion modals. */
export function CockpitPodModals({
  isCreatePodOpen,
  setIsCreatePodOpen,
  deployPodStep,
  setDeployPodStep,
  additionalMembersInput,
  setAdditionalMembersInput,
  calculatedNewPodCount,
  isNewCapacityLocked,
  setIsNewCapacityLocked,
  newPodsDraft,
  handleLockNewPodCapacity,
  handleUnlockNewPodCapacity,
  handleAdjustNewPodSeats,
  handleResetNewPodSeatsToBalanced,
  allAvailableServices,
  servicePodMap,
  customServicesList,
  newCustomServiceInput,
  setNewCustomServiceInput,
  editingCustomServiceName,
  editingCustomServiceText,
  setEditingCustomServiceText,
  isDeployingPod,
  createPodError,
  setCreatePodError,
  handleToggleServiceForNewPod,
  handleAddCustomService,
  handleDeleteCustomService,
  handleStartEditCustomService,
  handleSaveEditCustomService,
  handleCancelEditCustomService,
  handleDeploySpecializedPod,
  selectedPodForAddSeat,
  setSelectedPodForAddSeat,
  additionalSeatsCount,
  setAdditionalSeatsCount,
  isProcessingAddSeat,
  addSeatError,
  handleAddSeatsToPod,
}: CockpitPodModalsProps) {
  const totalNewAllocatedSeats = newPodsDraft.reduce((sum, p) => sum + (p.seats || 0), 0);
  const isNewAllocationBalanced =
    isNewCapacityLocked && totalNewAllocatedSeats === additionalMembersInput;

  return (
    <>
        {isCreatePodOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center bg-blue-600/20 border-blue-500/40 text-blue-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Deploy New Pod
                      </h3>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Step {deployPodStep} of 2
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {deployPodStep === 1
                        ? 'Specify additional headcount to calculate and lock pod seat allocations.'
                        : 'Assign ticket categories to each new pod while preserving existing service baselines.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeployingPod) setIsCreatePodOpen(false);
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {deployPodStep === 1 && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Additional Team Members
                        </label>
                        {isNewCapacityLocked && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                              <Lock className="w-3 h-3" />
                              <span>LOCKED</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleUnlockNewPodCapacity}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <input
                          type="number"
                          min={1}
                          max={500}
                          disabled={isNewCapacityLocked}
                          value={additionalMembersInput}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            const nextVal = isNaN(val) ? 1 : Math.max(1, val);
                            setAdditionalMembersInput(nextVal);
                            setIsNewCapacityLocked(false);
                          }}
                          className={`w-full sm:w-40 bg-[#111827] border-2 text-white text-2xl font-black rounded-xl px-4 py-2.5 text-center font-mono focus:outline-hidden transition-all ${
                            isNewCapacityLocked
                              ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-200 cursor-not-allowed'
                              : 'border-blue-500/60 focus:border-blue-400'
                          }`}
                        />
                        <p className="text-xs text-slate-400 leading-relaxed">
                          With <strong className="text-white">{additionalMembersInput} {additionalMembersInput === 1 ? 'member' : 'members'}</strong>, Sevaniq provisions{' '}
                          <strong className="text-emerald-400">
                            {calculatedNewPodCount} new {calculatedNewPodCount === 1 ? 'pod' : 'pods'}
                          </strong>{' '}
                          (up to 8 members per pod).
                        </p>
                      </div>

                      {!isNewCapacityLocked && (
                        <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                          <button
                            type="button"
                            onClick={handleLockNewPodCapacity}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Lock &amp; Allocate Capacity</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isNewCapacityLocked && (
                      <div className="p-5 rounded-xl bg-[#0B0F19] border border-blue-500/30 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Pod Seat Distribution</span>
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                                isNewAllocationBalanced
                                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                                  : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                              }`}
                            >
                              {isNewAllocationBalanced ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              <span>
                                {totalNewAllocatedSeats} / {additionalMembersInput} Seats Allocated
                              </span>
                            </span>
                            {!isNewAllocationBalanced && (
                              <button
                                type="button"
                                onClick={handleResetNewPodSeatsToBalanced}
                                className="text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Auto-Balance</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {newPodsDraft.map((pod, idx) => (
                            <div
                              key={pod.name}
                              className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                                <div>
                                  <div className="text-xs font-mono font-bold text-white">
                                    {pod.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    1 Pod Leader + {Math.max(0, pod.seats - 1)} Support {pod.seats - 1 === 1 ? 'Agent' : 'Agents'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg p-1">
                                <button
                                  type="button"
                                  disabled={pod.seats <= 1}
                                  onClick={() => handleAdjustNewPodSeats(idx, -1)}
                                  className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-sm"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-mono font-bold text-white">
                                  {pod.seats}
                                </span>
                                <button
                                  type="button"
                                  disabled={pod.seats >= 8}
                                  onClick={() => handleAdjustNewPodSeats(idx, 1)}
                                  className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {createPodError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">Error:</span>
                        <span>{createPodError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatePodOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!isNewAllocationBalanced}
                        onClick={() => setDeployPodStep(2)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <span>Continue to Services</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {deployPodStep === 2 && (
                  <form onSubmit={handleDeploySpecializedPod} className="space-y-5">
                    {/* Add Custom Ticket Category */}
                    <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        Add Custom Ticket Category
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          disabled={isDeployingPod}
                          placeholder="e.g., VIP Account Escalations"
                          value={newCustomServiceInput}
                          onChange={(e) => setNewCustomServiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomService();
                            }
                          }}
                          className="flex-1 bg-[#111827] border border-slate-700/80 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          disabled={isDeployingPod || !newCustomServiceInput.trim()}
                          onClick={handleAddCustomService}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Category</span>
                        </button>
                      </div>
                    </div>

                    {/* New Pod Cards */}
                    <div className="space-y-4">
                      {newPodsDraft.map((pod, pIdx) => (
                        <div
                          key={pod.name}
                          className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <h4 className="text-sm font-mono font-bold text-white">
                                {pod.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                                {pod.services.length} Selected
                              </span>
                              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                                {pod.seats} {pod.seats === 1 ? 'Seat' : 'Seats'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {allAvailableServices.map((svc, sIdx) => {
                              const isChecked = pod.services.includes(svc);
                              const existingPods = servicePodMap[svc] || [];
                              const siblingPods = newPodsDraft
                                .filter((other, idx) => idx !== pIdx && other.services.includes(svc))
                                .map((other) => other.name);
                              const allCoveringPods = [...existingPods, ...siblingPods];
                              const isCustom = customServicesList.includes(svc);
                              const isEditing = editingCustomServiceName === svc;
                              const indexNumber = sIdx + 1 < 10 ? `0${sIdx + 1}` : `${sIdx + 1}`;

                              if (isEditing) {
                                return (
                                  <div
                                    key={`${pod.name}-${svc}`}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-blue-500/80"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCustomServiceText}
                                      onChange={(e) => setEditingCustomServiceText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveEditCustomService(svc);
                                        } else if (e.key === 'Escape') {
                                          e.preventDefault();
                                          handleCancelEditCustomService();
                                        }
                                      }}
                                      className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditCustomService(svc)}
                                      className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditCustomService}
                                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`${pod.name}-${svc}`}
                                  onClick={() => handleToggleServiceForNewPod(pIdx, svc)}
                                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? 'bg-blue-950/35 border-blue-500/60 text-white'
                                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-6 h-6 rounded-md bg-slate-800/90 border border-slate-700/70 text-[11px] font-mono font-bold text-slate-400 flex items-center justify-center shrink-0">
                                      {indexNumber}
                                    </span>
                                    <span className="text-xs font-medium truncate">{svc}</span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {isCustom && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditCustomService(svc);
                                          }}
                                          title="Rename category"
                                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-300 cursor-pointer"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCustomService(svc);
                                          }}
                                          title="Delete category"
                                          className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                    {allCoveringPods.length > 0 && (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                                        <GitFork className="w-2.5 h-2.5 text-cyan-400" />
                                        <span>{allCoveringPods.join(', ')}</span>
                                      </span>
                                    )}
                                    <div
                                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                                        isChecked
                                          ? 'bg-blue-600 border-blue-500 text-white'
                                          : 'border-slate-600 bg-slate-800/80'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {createPodError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">Error:</span>
                        <span>{createPodError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        disabled={isDeployingPod}
                        onClick={() => {
                          setCreatePodError(null);
                          setDeployPodStep(1);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={isDeployingPod}
                          onClick={() => setIsCreatePodOpen(false)}
                          className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isDeployingPod || newPodsDraft.some((p) => p.services.length === 0)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isDeployingPod ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Provisioning Pods...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>
                                Deploy {newPodsDraft.length} {newPodsDraft.length === 1 ? 'Pod' : 'Pods'} &amp; Issue Tokens
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EXPAND POD SEAT CAPACITY / ADD SEAT (+$30/SEAT/MO) */}
        {selectedPodForAddSeat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Expand Frontline Capacity</h3>
                    </div>
                    <p className="text-[11px] text-slate-400">Vertical Pod Staff Scaling</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isProcessingAddSeat) setSelectedPodForAddSeat(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {(() => {
                  const maxPodCapacity = 8;
                  const currentSeats = selectedPodForAddSeat.assignedQuota || selectedPodForAddSeat.maxMembers || 0;
                  const maxAddable = Math.max(0, maxPodCapacity - currentSeats);
                  const effectiveAdditionalSeats = maxAddable > 0 ? Math.min(Math.max(1, additionalSeatsCount), maxAddable) : 0;

                  return (
                    <form onSubmit={handleAddSeatsToPod} className="space-y-4">
                        {/* Target Operational Pod */}
                        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Target Operational Pod
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">
                              {cleanPodName(selectedPodForAddSeat.name)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Assigned Leader: <strong className="text-slate-200">{selectedPodForAddSeat.leaderName || 'Unclaimed'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Pod Capacity Stats Grid: 1. Max Capacity, 2. Current Roster (Leader + Members), 3. Available Slots */}
                        <div className="grid grid-cols-3 gap-2.5">
                          {/* 1. Max Pod Capacity */}
                          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Max Capacity
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-1">
                              <span className="text-lg font-bold font-mono text-white">{maxPodCapacity}</span>
                              <span className="text-xs text-slate-400">Members</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 mt-1">Pod Ceiling</span>
                          </div>

                          {/* 2. Current Roster (Leader & Members) */}
                          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Current Roster
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-1">
                              <span className="text-lg font-bold font-mono text-blue-400">{currentSeats}</span>
                              <span className="text-xs text-slate-400">Members</span>
                            </div>
                            <span className="text-[9.5px] text-slate-400 mt-1 truncate" title={`1 Leader + ${Math.max(0, currentSeats - 1)} ${Math.max(0, currentSeats - 1) === 1 ? 'Member' : 'Members'}`}>
                              1 Leader + {Math.max(0, currentSeats - 1)} {Math.max(0, currentSeats - 1) === 1 ? 'Member' : 'Members'}
                            </span>
                          </div>

                          {/* 3. Available Slots */}
                          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Available Slots
                            </span>
                            <div className="mt-1.5 flex items-baseline gap-1">
                              <span className={`text-lg font-bold font-mono ${maxAddable > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {maxAddable}
                              </span>
                              <span className="text-xs text-slate-400">Seats</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 mt-1">
                              {maxAddable > 0 ? 'Open Capacity' : 'At Capacity'}
                            </span>
                          </div>
                        </div>

                        {/* 4. Controls (Stepper [-] count [+] & Quick Presets) */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 block">
                              Number of Additional Frontline Seats
                            </label>
                            {maxAddable > 0 && (
                              <span className="text-[11px] text-slate-400">
                                Target Quota: <strong className="text-emerald-400 font-mono">{currentSeats + effectiveAdditionalSeats} Members</strong>
                              </span>
                            )}
                          </div>

                          {maxAddable === 0 ? (
                            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>This pod has reached its maximum capacity of {maxPodCapacity} members. No additional seats can be added.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* Stepper */}
                              <div className="flex items-center bg-[#0B0F19] border border-slate-700 rounded-xl overflow-hidden p-1">
                                <button
                                  type="button"
                                  disabled={isProcessingAddSeat || effectiveAdditionalSeats <= 1}
                                  onClick={() => setAdditionalSeatsCount(Math.max(1, effectiveAdditionalSeats - 1))}
                                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-mono font-bold text-white text-sm">
                                  {effectiveAdditionalSeats}
                                </span>
                                <button
                                  type="button"
                                  disabled={isProcessingAddSeat || effectiveAdditionalSeats >= maxAddable}
                                  onClick={() => setAdditionalSeatsCount(Math.min(maxAddable, effectiveAdditionalSeats + 1))}
                                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              {/* Quick Presets */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[1, 2, 3, 5].filter((preset) => preset <= maxAddable).map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAdditionalSeatsCount(preset)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      effectiveAdditionalSeats === preset
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    +{preset} {preset === 1 ? 'Seat' : 'Seats'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {addSeatError && (
                          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                            <span className="text-red-400 font-bold">Error:</span>
                            <span>{addSeatError}</span>
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            disabled={isProcessingAddSeat}
                            onClick={() => setSelectedPodForAddSeat(null)}
                            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isProcessingAddSeat || maxAddable === 0}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isProcessingAddSeat ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Adding Seat...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Seat</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    );
                  })()}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
