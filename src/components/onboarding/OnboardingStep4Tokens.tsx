'use client';

import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { OnboardingDraft } from '../../lib/types';
import type { LeaderTokenPreview } from './onboarding.constants';

export interface OnboardingStep4Props {
  generatedLeaderTokens: LeaderTokenPreview[];
  copiedToken: string | null;
  regeneratingToken: string | null;
  dispatchedTokens: Set<string>;
  regeneratedTokens: Set<string>;
  handleCopyLink: (token: string, joinUrl: string) => void;
  handleRegenerateLeaderToken: (oldToken: string, workspaceId?: string) => Promise<void>;
  handleDoneSharing: () => Promise<void>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  persistDraft: (overrides?: Partial<OnboardingDraft>) => void;
}

/** Onboarding Step 4: Single-use Pod Leader activation link distribution. */
export function OnboardingStep4Tokens({
  generatedLeaderTokens,
  copiedToken,
  regeneratingToken,
  dispatchedTokens,
  regeneratedTokens,
  handleCopyLink,
  handleRegenerateLeaderToken,
  handleDoneSharing,
  setCurrentStep,
  setErrorMessage,
  persistDraft,
}: OnboardingStep4Props) {
  return (
            <div className="space-y-6">
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-white">
                  Organization created
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  Distribute the one-time activation links below to designated Pod Leaders to initialize workspace governance.
                  <br />
                  <strong className="text-blue-400">Security Policy:</strong> Each link is <strong>single-use and invalidates immediately upon redemption</strong>.
                </p>
              </div>

              {/* Leader Tokens Grid */}
              <div className="space-y-3.5">
                {generatedLeaderTokens.map((item, idx) => {
                  const isCopied = copiedToken === item.token;
                  const isDispatched = dispatchedTokens.has(item.token);
                  const isRegenerated = regeneratedTokens.has(item.token);

                  return (
                    <div
                      key={item.token}
                      className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white">{item.workspaceName}</h4>
                          {item.isClaimed ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              LEADER ASSIGNED • {item.leaderName || 'ACTIVE'}
                            </span>
                          ) : isDispatched ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-blue-400" />
                              LINK DISPATCHED • LOCKED
                            </span>
                          ) : isRegenerated ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              REGENERATED • SINGLE-USE
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                              SINGLE-USE • UNCLAIMED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>Token:</span>
                          <span className="text-blue-300 font-bold bg-[#111827] px-2 py-0.5 rounded border border-slate-800">
                            {item.token}
                          </span>
                        </div>
                      </div>

                      {/* Single Smart Action Button: Copy Link -> Morphs to Regenerate & Copy New Link */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.isClaimed ? (
                          <div
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border bg-slate-900/90 border-slate-800 text-slate-300 cursor-default select-none shadow-sm"
                            title={`Pod leadership is assigned to ${item.leaderName || 'its leader'}. Under organizational governance policy, each operational pod maintains exactly one Team Lead seat. To rotate leadership, manage members in the Admin Cockpit.`}
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Seat Occupied</span>
                          </div>
                        ) : isDispatched ? (
                          <button
                            type="button"
                            disabled={regeneratingToken === item.token}
                            onClick={() => handleRegenerateLeaderToken(item.token, item.workspaceId)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                              regeneratingToken === item.token
                                ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-wait'
                                : isCopied
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                                : 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 border-amber-500/60 text-amber-300 hover:text-amber-200 cursor-pointer shadow-amber-500/10'
                            }`}
                            title="Revokes active link, provisions a new single-use token, and automatically copies it to clipboard"
                          >
                            {regeneratingToken === item.token ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                <span>Generating &amp; Copying...</span>
                              </>
                            ) : isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>New Link Copied! ✓</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Regenerate &amp; Copy New Link</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item.token, item.joinUrl)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20'
                                : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-600/20'
                            }`}
                            title="Copy single-use activation link to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Link Copied! ✓</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: Back to Step 3 & Done Sharing */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentStep(3);
                    persistDraft({ lastActiveStep: 3 });
                  }}
                  title="Back to Pod Architecture Setup (Step 3)"
                  className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleDoneSharing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Complete Setup &amp; Enter Executive Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
  );
}
