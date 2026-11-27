'use client';

import React from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  Link,
  Mail,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export interface CockpitChannelsTabProps {
  copiedChannelItem: string | null;
  isCleaningDemo: boolean;
  demoNotice: string | null;
  handleCopyChannel: (text: string, id: string) => void;
  handleCleanupDemo: () => Promise<void>;
}

/** Super Admin Omnichannel Gateways & Webhook Integration tab. */
export function CockpitChannelsTab({
  copiedChannelItem,
  isCleaningDemo,
  demoNotice,
  handleCopyChannel,
  handleCleanupDemo,
}: CockpitChannelsTabProps) {
  return (
          <section className="space-y-6 animate-fadeIn">
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Inbound Channels &amp; Customer Gateways Control Center
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Manage and route customer communication channels directly to the Pod Helpdesk queue (Leaders &amp; Agents).
                    Inbound requests across these channels are automatically triaged by <strong className="text-blue-400">Gemini 3.8 Flash Grounded</strong> and dispatched to the designated Pod.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={isCleaningDemo}
                    onClick={handleCleanupDemo}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    title="Clean all showcase demo tickets from system"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isCleaningDemo ? 'Cleaning...' : 'Clean Demo Tickets'}</span>
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3 Inbound Gateways Active</span>
                  </div>
                </div>
              </div>

              {demoNotice && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{demoNotice}</span>
                </div>
              )}
            </div>

            {/* 3 Channel Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Channel 1: Web Customer Portal */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      ● Live Web &amp; Mobile
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">1. Web Customer Portal</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standalone self-service customer portal. Responsively adapts across mobile and desktop browsers with zero app install required.
                    </p>
                  </div>

                  {/* URL Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Official Portal URL:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-blue-400">
                      <span className="truncate flex-1">{typeof window !== 'undefined' ? `${window.location.origin}/portal` : 'http://localhost:3000/portal'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/portal`, 'portal-url')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedChannelItem === 'portal-url' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">Deployment Recommendations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10.5px]">
                      <li>Embed in corporate website footer navigation</li>
                      <li>Place in customer support social links / Linktree</li>
                      <li>Configure in WhatsApp Business auto-responder template</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/portal"
                    target="_blank"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Customer Portal (Preview)</span>
                  </Link>
                </div>
              </div>

              {/* Channel 2: Mobile App Ingestion */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      ● REST API v1
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">2. Mobile App REST Ingestion</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct integration for in-app &quot;Report an Issue&quot; buttons within native Android / iOS applications.
                    </p>
                  </div>

                  {/* API Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Ingestion API Endpoint:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-emerald-400">
                      <span className="truncate flex-1">POST /api/v1/tickets</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel(`${API_BASE_URL}/tickets`, 'api-url')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy Endpoint"
                      >
                        {copiedChannelItem === 'api-url' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">JSON Payload Schema:</span>
                    <pre className="text-[10px] font-mono text-slate-400 bg-[#0B0F19] p-2 rounded-lg border border-slate-800 overflow-x-auto">
{`{
  "title": "Payment Settlement Delay",
  "description": "Issue details...",
  "customerName": "Client Name",
  "tags": ["mobile-app", "billing"]
}`}
                    </pre>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyChannel(
`curl -X POST ${API_BASE_URL}/tickets \\
  -H "Content-Type: application/json" \\
  -d '{"title":"API Ingested Ticket","description":"Customer report via mobile SDK","customerName":"Demo Customer"}'`,
                      'curl-sample'
                    )}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copiedChannelItem === 'curl-sample' ? 'cURL Copied!' : 'Copy Sample Request (cURL)'}</span>
                  </button>
                </div>
              </div>

              {/* Channel 3: Email Forwarding Gateway */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                      ● Email Gateway
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">3. Email Gateway Forwarding</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customers send emails from Gmail/Outlook to your company domain (e.g. support@company.com), automatically ingested into Sevaniq.
                    </p>
                  </div>

                  {/* Email Inbound Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Inbound Gateway Address:
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-2 font-mono text-xs text-amber-400">
                      <span className="truncate flex-1">inbound@tickets.sevaniq.com</span>
                      <button
                        type="button"
                        onClick={() => handleCopyChannel('inbound@tickets.sevaniq.com', 'email-gw')}
                        className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Copy Gateway Address"
                      >
                        {copiedChannelItem === 'email-gw' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">3-Step Fast Setup Guide:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10.5px]">
                      <li>Open your Google Workspace / cPanel mail administration</li>
                      <li>Create forwarding rule: support@company.com &rarr; inbound@tickets.sevaniq.com</li>
                      <li>Public replies from agents are automatically routed back to customer inbox</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="py-2.5 px-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-center text-xs font-semibold">
                    Zero-Install (Customers use regular email)
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Flow Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sevaniq Unified Message Lifecycle Active</h4>
                  <p className="text-[11px] text-slate-400">
                    All incoming messages across Web Portal, Mobile App, and Email funnel into one unified Pod workbench queue, monitored in real time by the SLA Crisis Radar (&lt; 15 Minutes).
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>View Pod Workstations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
  );
}
