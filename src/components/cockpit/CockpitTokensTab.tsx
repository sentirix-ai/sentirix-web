'use client';

import React from 'react';
import {
  CheckCircle2,
  Crown,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import type { CockpitTokenAuditItem, CockpitWorkspaceItem } from '../../lib/types';
import type { ForceLogoutTarget } from './cockpit.utils';

export interface CockpitTokensTabProps {
  workspaces: CockpitWorkspaceItem[];
  tokenAudit: CockpitTokenAuditItem[];
  copiedToken: string | null;
  dispatchedTokens: Set<string>;
  regeneratingToken: string | null;
  freshRegeneratedTokens: Set<string>;
  forcingLogoutUser: string | null;
  handleCopyLink: (token: string) => void;
  handleRegenerateToken: (oldToken: string) => Promise<void>;
  onOpenCreatePod: () => void;
  onOpenAddSeat: (ws: CockpitWorkspaceItem) => void;
  onRequestForceLogout: (target: ForceLogoutTarget) => void;
}

/** Super Admin Token Audit Hub: single-use links, pod expansion, and session revocation. */
export function CockpitTokensTab({
  workspaces,
  tokenAudit,
  copiedToken,
  dispatchedTokens,
  regeneratingToken,
  freshRegeneratedTokens,
  forcingLogoutUser,
  handleCopyLink,
  handleRegenerateToken,
  onOpenCreatePod,
  onOpenAddSeat,
  onRequestForceLogout,
}: CockpitTokensTabProps) {
  return (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Single-Use Token Audit &amp; Credential Governance Hub</span>
                  <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                    {tokenAudit.length} Registered Tokens
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic single-use token lifecycle &amp; capacity issuance. Provision new pods or expand agent seats with strict quota lock enforcement.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenCreatePod}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg border cursor-pointer shrink-0 self-start sm:self-auto group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25 border-blue-400/30"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Deploy New Pod</span>
              </button>
            </div>

            {workspaces.length === 0 && tokenAudit.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No operational pods or token records found for this organization.
              </div>
            ) : (
              <div className="space-y-6">
                {workspaces.map((ws, wsIdx: number) => {
                  const podTokens = tokenAudit.filter(
                    (tok) => tok.workspaceId === ws.id || tok.podName === ws.name,
                  );
                  const leaderTokens = podTokens.filter((t) => t.role === 'LEADER');
                  const rawMemberTokens = podTokens.filter((t) => t.role !== 'LEADER');

                  const memberTokens = [...rawMemberTokens].sort((a, b) => {
                    if (a.isUsed && !b.isUsed) return -1;
                    if (!a.isUsed && b.isUsed) return 1;

                    if (a.isUsed && b.isUsed) {
                      const timeA = a.usedAt ? new Date(a.usedAt).getTime() : 0;
                      const timeB = b.usedAt ? new Date(b.usedAt).getTime() : 0;
                      return timeA - timeB;
                    }

                    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return createdA - createdB;
                  });

                  return (
                    <div
                      key={ws.id || wsIdx}
                      className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                      {/* Pod Card Header */}
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
                              Registered Leader: <strong className="text-white">{ws.leaderName || 'Unclaimed'}</strong> &bull; Total Issued Tokens: <strong className="text-white">{podTokens.length}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right sm:block hidden shrink-0">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                              Pod Structure
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              1 Leader + {Math.max(0, (ws.assignedQuota || podTokens.length) - 1)} Members
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenAddSeat(ws)}
                            className="px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer group shrink-0"
                            title="Expand Pod Staff Capacity"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span>Add Seat</span>
                          </button>
                        </div>
                      </div>

                      {/* Token Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="py-2.5 px-4">Position &amp; Role</th>
                              <th className="py-2.5 px-4">Token String</th>
                              <th className="py-2.5 px-4">Activation Status</th>
                              <th className="py-2.5 px-4">Assigned To</th>
                              <th className="py-2.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {/* 1. LEADER POSITION */}
                            {leaderTokens.length === 0 ? (
                              <tr className="bg-amber-950/10">
                                <td colSpan={5} className="py-3 px-4 text-slate-500 italic text-center">
                                  No leader token issued yet for this pod.
                                </td>
                              </tr>
                            ) : (
                              leaderTokens.map((tok) => {
                                const isCopied = copiedToken === tok.token;
                                const isLeaderActive = tok.usedBy || ws.leaderName || ws.isQuotaLocked;
                                const isLeaderLoggedOut = isLeaderActive && !tok.isUserOnline;
                                const leaderNeedsRegen =
                                  isLeaderLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isLeaderFreshTokenReady =
                                  isLeaderLoggedOut && !leaderNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr
                                    key={tok.id}
                                    className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-b border-amber-500/30 hover:bg-amber-950/40 transition-colors"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0 shadow">
                                          <Crown className="w-3.5 h-3.5" />
                                        </span>
                                        <div>
                                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                            LEADER (TOP TIER)
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-amber-300 text-xs tracking-wider">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed || ws.isQuotaLocked || ws.leaderName ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>ACTIVATED</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                                          PENDING ACTIVATION
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy || ws.leaderName ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-white">{tok.usedBy || ws.leaderName}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Leader Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadForceLogout ? (
                                                <div className="flex items-center gap-1 text-rose-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                  <span>&bull; (Session Revoked)</span>
                                                </div>
                                              ) : tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">&bull; (Logged Out)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>&bull; (Browser Closed)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>&bull; (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Pending Activation</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {tok.isUserOnline && (
                                          <button
                                            type="button"
                                            disabled={
                                              forcingLogoutUser === tok.token ||
                                              forcingLogoutUser === (tok.userId || tok.usedBy)
                                            }
                                            onClick={() =>
                                              onRequestForceLogout({
                                                name: tok.usedBy || ws.leaderName || 'Leader',
                                                role: 'Leader',
                                                token: tok.token,
                                                userId: tok.userId ?? undefined,
                                                username: (tok.username || tok.usedBy) ?? undefined,
                                              })
                                            }
                                            className="px-2.5 py-1 rounded text-[11px] font-bold border border-rose-500/50 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                                            title="Revoke active Leader session immediately"
                                          >
                                            <LogOut className="w-3 h-3 text-rose-400" />
                                            <span>
                                              {forcingLogoutUser === tok.token ||
                                              forcingLogoutUser === (tok.userId || tok.usedBy)
                                                ? 'Revoking...'
                                                : 'Revoke Session'}
                                            </span>
                                          </button>
                                        )}
                                        {(() => {
                                          const isDispatched = dispatchedTokens.has(tok.token);
                                          const isOnline = Boolean(tok.isUserOnline);
                                          const isFreshReady = (isLeaderFreshTokenReady || freshRegeneratedTokens.has(tok.token)) && !isDispatched && !isOnline;

                                          if (isOnline) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed opacity-30 select-none flex items-center gap-1"
                                                title="Leader is currently online. Token link cannot be copied while active."
                                              >
                                                <Lock className="w-3 h-3 text-slate-600" />
                                                <span>Copy Link</span>
                                              </button>
                                            );
                                          }

                                          if (leaderNeedsRegen) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-40 select-none flex items-center gap-1"
                                                title="Leader has logged out. You must click Regenerate to issue a fresh link."
                                              >
                                                <Lock className="w-3 h-3 text-slate-600" />
                                                <span>Copy Link</span>
                                              </button>
                                            );
                                          }

                                          if (isDispatched) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-60 select-none flex items-center gap-1"
                                                title="This single-use link has been copied & locked. Click Regenerate to issue a fresh link."
                                              >
                                                <Lock className="w-3 h-3 text-slate-400" />
                                                <span>Copied (Locked)</span>
                                              </button>
                                            );
                                          }

                                          return (
                                            <button
                                              type="button"
                                              onClick={() => handleCopyLink(tok.token)}
                                              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                                isCopied
                                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                                  : isFreshReady
                                                    ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-sm'
                                                    : 'bg-[#0B0F19] border-amber-500/50 text-amber-200 hover:text-white hover:border-amber-400'
                                              }`}
                                              title={isFreshReady ? 'Copy newly regenerated single-use Leader link' : 'Copy single-use Leader access link'}
                                            >
                                              {isCopied ? 'Copied' : isFreshReady ? 'Copy New Link' : 'Copy Link'}
                                            </button>
                                          );
                                        })()}
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleRegenerateToken(tok.token);
                                          }}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            leaderNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isLeaderFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-amber-500/50 text-amber-300 hover:border-amber-400'
                                          }`}
                                          title="Regenerate single-use token"
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              leaderNeedsRegen
                                                ? 'text-white'
                                                : isLeaderFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-amber-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Processing...'
                                              : leaderNeedsRegen
                                                ? 'Regenerate'
                                                : isLeaderFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}

                            {/* 2. MEMBER TOKENS BELOW LEADER */}
                            {memberTokens.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                                  {ws.isQuotaLocked
                                    ? 'No agent tokens issued yet.'
                                    : 'Agent tokens will be automatically issued once the Leader locks quota and activates this pod.'}
                                </td>
                              </tr>
                            ) : (
                              memberTokens.map((tok, mIdx: number) => {
                                const isCopied = copiedToken === tok.token;
                                const isMemberActive = Boolean(tok.usedBy) || tok.isUsed;
                                const isMemberLoggedOut = isMemberActive && !tok.isUserOnline;
                                const memberNeedsRegen =
                                  isMemberLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isMemberFreshTokenReady =
                                  isMemberLoggedOut && !memberNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr key={tok.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2 pl-3">
                                        <span className="text-[10px] text-slate-500 font-mono">{mIdx + 1}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                          AGENT
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-blue-300">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>ACTIVATED</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                                          PENDING ACTIVATION
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-white">{tok.usedBy}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Agent Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadForceLogout ? (
                                                <div className="flex items-center gap-1 text-rose-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                  <span>&bull; (Session Revoked)</span>
                                                </div>
                                              ) : tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">&bull; (Logged Out)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>&bull; (Browser Closed)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>&bull; (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Pending Activation</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {tok.isUserOnline && (
                                          <button
                                            type="button"
                                            disabled={
                                              forcingLogoutUser === tok.token ||
                                              forcingLogoutUser === (tok.userId || tok.usedBy)
                                            }
                                            onClick={() =>
                                              onRequestForceLogout({
                                                name: tok.usedBy || 'Agent',
                                                role: 'Agent',
                                                token: tok.token,
                                                userId: tok.userId ?? undefined,
                                                username: (tok.username || tok.usedBy) ?? undefined,
                                              })
                                            }
                                            className="px-2.5 py-1 rounded text-[11px] font-bold border border-rose-500/50 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                                            title="Revoke active Agent session immediately"
                                          >
                                            <LogOut className="w-3 h-3 text-rose-400" />
                                            <span>
                                              {forcingLogoutUser === tok.token ||
                                              forcingLogoutUser === (tok.userId || tok.usedBy)
                                                ? 'Revoking...'
                                                : 'Revoke Session'}
                                            </span>
                                          </button>
                                        )}
                                        {(() => {
                                          const isDispatched = dispatchedTokens.has(tok.token);
                                          const isOnline = Boolean(tok.isUserOnline);
                                          const isFreshReady = (isMemberFreshTokenReady || freshRegeneratedTokens.has(tok.token)) && !isDispatched && !isOnline;

                                          if (isOnline) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed opacity-30 select-none flex items-center gap-1"
                                                title="Agent is currently online. Token link cannot be copied while active."
                                              >
                                                <Lock className="w-3 h-3 text-slate-600" />
                                                <span>Copy Link</span>
                                              </button>
                                            );
                                          }

                                          if (memberNeedsRegen) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-40 select-none flex items-center gap-1"
                                                title="Agent has logged out. You must click Regenerate to issue a fresh link."
                                              >
                                                <Lock className="w-3 h-3 text-slate-600" />
                                                <span>Copy Link</span>
                                              </button>
                                            );
                                          }

                                          if (isDispatched) {
                                            return (
                                              <button
                                                type="button"
                                                disabled
                                                className="px-2.5 py-1 rounded text-[11px] font-bold border bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-60 select-none flex items-center gap-1"
                                                title="This single-use link has been copied & locked. Click Regenerate to issue a fresh link."
                                              >
                                                <Lock className="w-3 h-3 text-slate-400" />
                                                <span>Copied (Locked)</span>
                                              </button>
                                            );
                                          }

                                          return (
                                            <button
                                              type="button"
                                              onClick={() => handleCopyLink(tok.token)}
                                              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                                isCopied
                                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                                  : isFreshReady
                                                    ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-sm'
                                                    : 'bg-[#0B0F19] border-slate-700 text-slate-300 hover:text-white'
                                              }`}
                                              title={isFreshReady ? 'Copy newly regenerated single-use Agent link' : 'Copy single-use Agent access link'}
                                            >
                                              {isCopied ? 'Copied' : isFreshReady ? 'Copy New Link' : 'Copy Link'}
                                            </button>
                                          );
                                        })()}
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleRegenerateToken(tok.token);
                                          }}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            memberNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isMemberFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-blue-500/40 text-blue-300 hover:border-blue-400'
                                          }`}
                                          title="Regenerate single-use token"
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              memberNeedsRegen
                                                ? 'text-white'
                                                : isMemberFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-blue-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Processing...'
                                              : memberNeedsRegen
                                                ? 'Regenerate'
                                                : isMemberFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
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
