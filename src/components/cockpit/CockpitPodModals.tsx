'use client';

import React from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type { CockpitWorkspaceItem } from '../../lib/types';
import { cleanPodName } from './cockpit.utils';

export interface CockpitPodModalsProps {
  isCreatePodOpen: boolean;
  setIsCreatePodOpen: React.Dispatch<React.SetStateAction<boolean>>;
  autoPodName: string;
  allAvailableServices: string[];
  servicePodMap: Record<string, string[]>;
  newPodServicesSelection: string[];
  customServicesList: string[];
  newCustomServiceInput: string;
  setNewCustomServiceInput: React.Dispatch<React.SetStateAction<string>>;
  editingCustomServiceName: string | null;
  editingCustomServiceText: string;
  setEditingCustomServiceText: React.Dispatch<React.SetStateAction<string>>;
  newPodCapacity: number;
  setNewPodCapacity: React.Dispatch<React.SetStateAction<number>>;
  isDeployingPod: boolean;
  createPodError: string | null;
  handleToggleService: (svc: string) => void;
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

/** Deploy specialized pod & add seat capacity expansion modals. */
export function CockpitPodModals({
  isCreatePodOpen,
  setIsCreatePodOpen,
  autoPodName,
  allAvailableServices,
  servicePodMap,
  newPodServicesSelection,
  customServicesList,
  newCustomServiceInput,
  setNewCustomServiceInput,
  editingCustomServiceName,
  editingCustomServiceText,
  setEditingCustomServiceText,
  newPodCapacity,
  setNewPodCapacity,
  isDeployingPod,
  createPodError,
  handleToggleService,
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
  return (
    <>
        {isCreatePodOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Deploy New Pod</h3>
                    </div>
                    <p className="text-[11px] text-slate-400">Set up a dedicated operational unit and assign service coverage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeployingPod) setIsCreatePodOpen(false);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <form onSubmit={handleDeploySpecializedPod} className="space-y-4">
                    {/* 1. Pod Name (Auto-calculated & Locked) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Pod Name
                      </label>
                      <div className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center">
                        <span className="text-xs font-mono font-bold text-white tracking-wide flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          {autoPodName}
                        </span>
                      </div>
                    </div>

                    {/* 2. Service Selection (Checklist Model with Informative Badges) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 block">
                          Service Coverage
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {newPodServicesSelection.length} Selected
                        </span>
                      </div>

                      <div className="bg-[#0B0F19] border border-slate-700/80 rounded-xl p-2 max-h-56 overflow-y-auto space-y-1.5">
                        {allAvailableServices.map((svc) => {
                          const isChecked = newPodServicesSelection.includes(svc);
                          const assignedPods = servicePodMap[svc] || [];
                          const isCustom = customServicesList.includes(svc);
                          const isEditing = editingCustomServiceName === svc;

                          if (isEditing) {
                            return (
                              <div
                                key={svc}
                                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-blue-500/80 shadow-md"
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
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                                  placeholder="Service name..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCustomService(svc)}
                                  title="Save Changes"
                                  className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditCustomService}
                                  title="Cancel"
                                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={svc}
                              onClick={() => handleToggleService(svc)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none group/item ${
                                isChecked
                                  ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-sm shadow-blue-950/50'
                                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                    isChecked
                                      ? 'bg-blue-600 border-blue-500 text-white'
                                      : 'border-slate-600 bg-slate-800/80'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-medium truncate">{svc}</span>
                              </div>

                              {/* Option A Informative Badges & Actions */}
                              <div className="shrink-0 flex items-center gap-1.5">
                                {isCustom ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditCustomService(svc);
                                      }}
                                      title="Edit Custom Service Name"
                                      className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCustomService(svc);
                                      }}
                                      title="Delete Custom Service"
                                      className="p-1 rounded-md hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  assignedPods.length > 0 ? (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                      In {assignedPods.join(', ')}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                                      Unassigned
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Inline Add Custom Service */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          disabled={isDeployingPod}
                          placeholder="e.g., VIP Account Escalations..."
                          value={newCustomServiceInput}
                          onChange={(e) => setNewCustomServiceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomService();
                            }
                          }}
                          className="flex-1 bg-[#0B0F19] border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          disabled={isDeployingPod || !newCustomServiceInput.trim()}
                          onClick={handleAddCustomService}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Pod Capacity (Flexible 2 - 8 Members) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 block">
                        Pod Capacity
                      </label>
                      <div className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-white font-mono">
                              {newPodCapacity} Members
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              1 Pod Leader + {newPodCapacity - 1} Support Agent{newPodCapacity - 1 > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Stepper Controls: Strict Bounds [2, 8] */}
                        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1">
                          <button
                            type="button"
                            disabled={isDeployingPod || newPodCapacity <= 2}
                            onClick={() => setNewPodCapacity((prev) => Math.max(2, prev - 1))}
                            className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed select-none text-sm"
                            title="Decrease capacity"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white select-none">
                            {newPodCapacity}
                          </span>
                          <button
                            type="button"
                            disabled={isDeployingPod || newPodCapacity >= 8}
                            onClick={() => setNewPodCapacity((prev) => Math.min(8, prev + 1))}
                            className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed select-none text-sm"
                            title="Increase capacity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {createPodError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">Error:</span>
                        <span>{createPodError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2.5">
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
                        disabled={isDeployingPod || newPodServicesSelection.length === 0}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isDeployingPod ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating {autoPodName}...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Deploy {autoPodName} &amp; Issue Token</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
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
