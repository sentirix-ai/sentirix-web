'use client';

import React from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import type { OnboardingDraft } from '../../lib/types';
import {
  CUSTOM_INDUSTRY_DEFAULT_SERVICES,
  INDUSTRY_PRESETS,
  type PodDraft,
  toCorporateTitleCase,
} from './onboarding.constants';

export interface OnboardingStep1Props {
  organizationName: string;
  setOrganizationName: React.Dispatch<React.SetStateAction<string>>;
  selectedIndustry: string;
  setSelectedIndustry: React.Dispatch<React.SetStateAction<string>>;
  customIndustryText: string;
  setCustomIndustryText: React.Dispatch<React.SetStateAction<string>>;
  customInputRef: React.RefObject<HTMLInputElement | null>;
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setAvailableServices: React.Dispatch<React.SetStateAction<string[]>>;
  setPods: React.Dispatch<React.SetStateAction<PodDraft[]>>;
  persistDraft: (overrides?: Partial<OnboardingDraft>) => void;
  onNext: () => void;
}

/** Onboarding Step 1: Organization identity & industry preset selection. */
export function OnboardingStep1Industry({
  organizationName,
  setOrganizationName,
  selectedIndustry,
  setSelectedIndustry,
  customIndustryText,
  setCustomIndustryText,
  customInputRef,
  errorMessage,
  setErrorMessage,
  setAvailableServices,
  setPods,
  persistDraft,
  onNext,
}: OnboardingStep1Props) {
  return (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  What industry is your company in?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sevaniq will recommend specialized pods and tailored services designed for your sector.
                </p>
              </div>

              {/* Organization Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <span>Organization / Company Name</span>
                  <span className="text-red-400 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => {
                    const formatted = toCorporateTitleCase(e.target.value);
                    setOrganizationName(formatted);
                    if (errorMessage && formatted.trim()) setErrorMessage(null);
                    persistDraft({ organizationName: formatted, lastActiveStep: 1 });
                  }}
                  onBlur={() => {
                    const formatted = toCorporateTitleCase(organizationName.trim().replace(/\s+/g, ' '));
                    setOrganizationName(formatted);
                    persistDraft({ organizationName: formatted, lastActiveStep: 1 });
                  }}
                  placeholder="e.g., Acme Global Enterprises"
                  className={`w-full bg-[#0B0F19] border ${
                    !organizationName.trim() && errorMessage ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                  } rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium`}
                />
              </div>

              {/* 12 Industry Preset Cards (3 rows of 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {INDUSTRY_PRESETS.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => {
                        const isChanged = selectedIndustry !== ind.id;
                        setSelectedIndustry(ind.id);
                        if (errorMessage) setErrorMessage(null);
                        if (isChanged) {
                          const newPreset = INDUSTRY_PRESETS.find((p) => p.id === ind.id);
                          const newServices = newPreset ? [...newPreset.defaultServices] : [...CUSTOM_INDUSTRY_DEFAULT_SERVICES];
                          setAvailableServices(newServices);
                          setPods([]);
                          persistDraft({
                            selectedIndustry: ind.id,
                            availableServices: newServices,
                            pods: [],
                            lastActiveStep: 1,
                          });
                        } else {
                          persistDraft({ selectedIndustry: ind.id, lastActiveStep: 1 });
                        }
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? 'bg-[#1E293B] border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                          : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${ind.accentColor}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white tracking-tight">{ind.name}</h3>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 13th Option: Custom Industry / AI Architect Unified Card */}
              <div
                onClick={() => {
                  const isChanged = selectedIndustry !== 'OTHER';
                  setSelectedIndustry('OTHER');
                  if (errorMessage) setErrorMessage(null);
                  if (isChanged) {
                    setAvailableServices([...CUSTOM_INDUSTRY_DEFAULT_SERVICES]);
                    setPods([]);
                    persistDraft({
                      selectedIndustry: 'OTHER',
                      availableServices: [...CUSTOM_INDUSTRY_DEFAULT_SERVICES],
                      pods: [],
                      lastActiveStep: 1,
                    });
                  } else {
                    persistDraft({ selectedIndustry: 'OTHER', lastActiveStep: 1 });
                  }
                  setTimeout(() => customInputRef.current?.focus(), 50);
                }}
                className={`rounded-xl border text-left transition-all cursor-pointer p-4 ${
                  selectedIndustry === 'OTHER'
                    ? 'bg-[#1E293B] border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#151D2F]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/40 text-indigo-400 shrink-0">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white tracking-tight">Custom Industry / Other Sector</h3>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          CUSTOM SETUP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {selectedIndustry === 'OTHER' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>

                {/* Inline Input automatically revealed inside the card when active */}
                {selectedIndustry === 'OTHER' && (
                  <div
                    className="mt-3.5 pt-3.5 border-t border-slate-700/60 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Describe your industry or business domain</span>
                    </label>
                    <input
                      ref={customInputRef}
                      type="text"
                      value={customIndustryText}
                      onChange={(e) => setCustomIndustryText(e.target.value)}
                      onBlur={() => {
                        persistDraft({ customIndustryText, lastActiveStep: 1 });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onNext();
                        }
                      }}
                      placeholder="e.g., Autonomous Agricultural Drones, Renewable Energy Logistics..."
                      className="w-full bg-[#0B0F19] border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/40 transition-all font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  <span>Continue to Team Capacity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
  );
}
