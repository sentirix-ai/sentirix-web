'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  GitFork,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { OnboardingDraft } from '../../lib/types';
import type {
  LeaderTokenPreview,
  PodDraft,
  SemanticWarningState,
} from './onboarding.constants';

export interface OnboardingStep3Props {
  pods: PodDraft[];
  calculatedPodCount: number;
  availableServices: string[];
  newServiceInput: string;
  setNewServiceInput: React.Dispatch<React.SetStateAction<string>>;
  editingServiceIndex: number | null;
  setEditingServiceIndex: React.Dispatch<React.SetStateAction<number | null>>;
  editingServiceText: string;
  setEditingServiceText: React.Dispatch<React.SetStateAction<string>>;
  isValidatingSemantic: boolean;
  semanticWarning: SemanticWarningState | null;
  setSemanticWarning: React.Dispatch<React.SetStateAction<SemanticWarningState | null>>;
  isGeneratingPods: boolean;
  isSubmitting: boolean;
  generatedLeaderTokens: LeaderTokenPreview[];
  handleAddGlobalService: () => void;
  handleStartEditService: (index: number, currentText: string) => void;
  handleSaveEditService: (index: number) => Promise<void>;
  handleDeleteService: (index: number, serviceName: string) => void;
  handleToggleServiceForPod: (podIndex: number, serviceName: string) => void;
  handleResetServicesToDefault: () => void;
  handleAddDivergentAsNewCategory: (proposedName: string) => void;
  handleFinalSubmit: () => Promise<void>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  persistDraft: (overrides?: Partial<OnboardingDraft>) => void;
}

/** Onboarding Step 3: Multi-pod domain service routing & semantic alignment. */
export function OnboardingStep3Pods({
  pods,
  calculatedPodCount,
  availableServices,
  newServiceInput,
  setNewServiceInput,
  editingServiceIndex,
  setEditingServiceIndex,
  editingServiceText,
  setEditingServiceText,
  isValidatingSemantic,
  semanticWarning,
  setSemanticWarning,
  isGeneratingPods,
  isSubmitting,
  generatedLeaderTokens,
  handleAddGlobalService,
  handleStartEditService,
  handleSaveEditService,
  handleDeleteService,
  handleToggleServiceForPod,
  handleResetServicesToDefault,
  handleAddDivergentAsNewCategory,
  handleFinalSubmit,
  setCurrentStep,
  setErrorMessage,
  persistDraft,
}: OnboardingStep3Props) {
  return (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Configure Operational Pods &amp; Assign Ticket Categories
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Assign customer issue categories to your {calculatedPodCount} operational pods. Pods can operate exclusively or share high-volume scopes with dynamic AI load balancing.
                </p>
              </div>

              {/* Quick Add Custom Service Tag - American Corporate Style */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/90 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Plus className="w-4 h-4 text-blue-400" />
                      Add Custom Ticket Category
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter a new service specialization or customer complaint category. It will appear for all pods below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetServicesToDefault}
                    title="Reset all categories back to standard industry presets"
                    className="text-[11px] font-mono text-slate-400 hover:text-blue-400 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGlobalService();
                      }
                    }}
                    placeholder="e.g., VIP Priority Concierge & White-Glove Support"
                    className="flex-1 bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddGlobalService();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 transition-all shrink-0 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* Pod Cards List */}
              {isGeneratingPods ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <span>AI Architect is designing {calculatedPodCount} operational pods...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {pods.map((pod, pIdx) => {
                    return (
                      <div
                        key={pIdx}
                        className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/80 shadow-xl shadow-black/40 space-y-5"
                      >
                        {/* Header: Fixed Paten Pod Identity */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-base font-bold text-white tracking-tight font-mono">
                              {`Pod ${pIdx + 1 < 10 ? `0${pIdx + 1}` : pIdx + 1}`}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold">
                              {pod.services.length} Categories Selected
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-emerald-400" />
                              <span>{pod.seats || 8} Dedicated Seats</span>
                            </span>
                          </div>
                        </div>

                        {/* Vertical Stack: Numbered 1 to 6, then 7+ from top to bottom */}
                        <div className="space-y-2">
                            {availableServices.map((svc, sIdx) => {
                              const isChecked = pod.services.includes(svc);
                              const otherPodsSharing = pods.filter((p, idx) => idx !== pIdx && p.services.includes(svc));
                              const isCoveredByOther = otherPodsSharing.length > 0;
                              const otherPodNames = otherPodsSharing.map((p) => p.name).join(', ');
                              const indexNumber = sIdx + 1 < 10 ? `0${sIdx + 1}` : `${sIdx + 1}`;
                              const isEditingThis = editingServiceIndex === sIdx;

                              if (isEditingThis) {
                                return (
                                  <div key={`${svc}-${sIdx}`} className="space-y-2">
                                    <div className="w-full p-2.5 rounded-xl bg-[#111827] border border-blue-500/80 shadow-md flex items-center gap-3">
                                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50 shrink-0">
                                        {indexNumber}
                                      </span>
                                      <input
                                        type="text"
                                        value={editingServiceText}
                                        onChange={(e) => {
                                          setEditingServiceText(e.target.value);
                                          if (semanticWarning) setSemanticWarning(null);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveEditService(sIdx);
                                          } else if (e.key === 'Escape') {
                                            setEditingServiceIndex(null);
                                            setSemanticWarning(null);
                                          }
                                        }}
                                        className="flex-1 bg-[#0B0F19] border border-blue-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden font-medium"
                                        autoFocus
                                      />
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          disabled={isValidatingSemantic}
                                          onClick={() => handleSaveEditService(sIdx)}
                                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                          {isValidatingSemantic ? (
                                            <>
                                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              <span>Checking...</span>
                                            </>
                                          ) : (
                                            <span>Save</span>
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingServiceIndex(null);
                                            setSemanticWarning(null);
                                          }}
                                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-md transition-all cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>

                                    {/* AI Semantic Guardian Divergence Warning Dialog - Corporate American Style */}
                                    {semanticWarning && semanticWarning.index === sIdx && (
                                      <div className="p-4 rounded-xl bg-[#13110C] border border-amber-500/80 text-amber-200 text-xs space-y-3 animate-fadeIn shadow-2xl ring-1 ring-amber-500/20">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertTriangle className="w-4 h-4" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-bold text-white text-xs tracking-tight">
                                                Operational Scope Notice
                                              </h4>
                                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">
                                                AI GOVERNANCE
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                                              {semanticWarning.explanation}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                                          <button
                                            type="button"
                                            onClick={() => handleAddDivergentAsNewCategory(semanticWarning.proposed)}
                                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                                          >
                                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                            <span>+ Add as New Category</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingServiceText(semanticWarning.original);
                                              setSemanticWarning(null);
                                            }}
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                                            title="Restore the baseline category name"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Revert to Original Name</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`${svc}-${sIdx}`}
                                  onClick={() => handleToggleServiceForPod(pIdx, svc)}
                                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-3 border group cursor-pointer ${
                                    isChecked
                                      ? isCoveredByOther
                                        ? 'bg-indigo-950/25 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                                        : 'bg-blue-950/30 border-blue-500/70 text-white shadow-sm ring-1 ring-blue-500/30'
                                      : 'bg-[#111827]/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#111827]'
                                  }`}
                                  title={
                                    isChecked
                                      ? isCoveredByOther
                                        ? `Click to remove from this pod (currently shared with ${otherPodNames})`
                                        : 'Click to remove from this pod'
                                      : isCoveredByOther
                                      ? `Click to assign to this pod and enable AI load balancing with ${otherPodNames}`
                                      : 'Click to assign to this pod'
                                  }
                                >
                                  {/* Left: Index Number */}
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                                      isChecked
                                        ? isCoveredByOther
                                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                                          : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 group-hover:text-slate-300'
                                    }`}
                                  >
                                    {indexNumber}
                                  </span>

                                  {/* Middle: Service Name */}
                                  <span className="flex-1 text-xs font-semibold tracking-wide truncate">
                                    {svc}
                                  </span>

                                  {/* Actions: Rename & Delete buttons */}
                                  <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditService(sIdx, svc);
                                      }}
                                      title="Rename this category"
                                      className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Delete button: ONLY available for custom added categories (index 6+, #07 onwards) */}
                                    {sIdx >= 6 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteService(sIdx, svc);
                                        }}
                                        title="Delete this custom category"
                                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Right Section: Inline Shared Scope Badge (if shared or covered) + Checkbox */}
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    {isChecked && isCoveredByOther ? (
                                      <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1527] border border-cyan-500/30 text-[10px] font-mono shadow-xs shrink-0 select-none transition-all group-hover:border-cyan-500/50"
                                        title={`Shared with ${otherPodNames}: Inbound tickets will be dynamically balanced by AI Triage based on real-time agent availability.`}
                                      >
                                        <GitFork className="w-3 h-3 text-cyan-400 shrink-0" />
                                        <span className="text-slate-300 font-semibold tracking-wide uppercase">
                                          SHARED SCOPE &bull; {otherPodNames}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                                        <span className="text-cyan-300 font-bold uppercase tracking-wider text-[9px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/25">
                                          AI BALANCED
                                        </span>
                                      </div>
                                    ) : !isChecked && isCoveredByOther ? (
                                      <div
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0 select-none group-hover:border-slate-700 transition-colors"
                                        title={`Covered by ${otherPodNames}. Click checkbox to include this pod in shared load balancing.`}
                                      >
                                        <GitFork className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="text-slate-400 font-medium">Covered by {otherPodNames}</span>
                                        <span className="text-[9px] text-slate-500">&bull; Click to share</span>
                                      </div>
                                    ) : null}

                                    {/* Checkbox */}
                                    <div
                                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                                        isChecked
                                          ? isCoveredByOther
                                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-400 text-white shadow-md shadow-indigo-500/30'
                                            : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/40'
                                          : 'border-slate-700 bg-slate-800/40 group-hover:border-slate-600'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(2);
                    persistDraft({ lastActiveStep: 2 });
                  }}
                  title="Back to Member Capacity Selection (Step 2)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={
                    generatedLeaderTokens.length > 0
                      ? () => {
                          setCurrentStep(4);
                          persistDraft({ lastActiveStep: 4 });
                        }
                      : handleFinalSubmit
                  }
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Organization &amp; Tokens...</span>
                    </>
                  ) : generatedLeaderTokens.length > 0 ? (
                    <>
                      <span>Continue to Leader Activation (Step 4)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Complete Setup &amp; Issue Tokens</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
  );
}
