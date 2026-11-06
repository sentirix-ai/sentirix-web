'use client';

import React, { useState } from 'react';
import { Ticket, Message } from '../lib/types';
import { generateAiReply, summarizeThread } from '../lib/api';
import {
  Sparkles,
  FileText,
  Check,
  Copy,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface AiCopilotSidebarProps {
  ticket: Ticket | null;
  messages: Message[];
  onInsertToComposer: (draftText: string) => void;
}

export const AiCopilotSidebar: React.FC<AiCopilotSidebarProps> = ({
  ticket,
  messages,
  onInsertToComposer,
}) => {
  const [tone, setTone] = useState<'professional' | 'empathetic' | 'concise'>('professional');
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [groundedSources, setGroundedSources] = useState<string[]>([]);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryPoints, setSummaryPoints] = useState<string[] | null>(null);

  const [copied, setCopied] = useState(false);

  if (!ticket) {
    return (
      <aside className="w-88 border-l border-slate-200 bg-white p-6 flex items-center justify-center text-xs text-slate-400 shrink-0">
        AI Copilot will activate once a ticket is selected.
      </aside>
    );
  }

  const handleGenerateDraft = async () => {
    try {
      setIsDrafting(true);
      const history = messages.map((m) => ({ sender: m.senderName, content: m.content }));
      const result = await generateAiReply(ticket.title, ticket.description, history, tone);
      setAiDraft(result.draft);
      setGroundedSources(result.groundedSources);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      const history = messages.map((m) => ({ sender: m.senderName, content: m.content }));
      const result = await summarizeThread(ticket.title, history);
      setSummaryPoints(result.bulletPoints);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-88 border-l border-slate-200 bg-[#F8FAFC] flex flex-col h-[calc(100vh-4rem)] shrink-0 overflow-y-auto">
      {/* Header matching dashboard.jpg */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#0F172A]">AI Copilot Hub</h2>
            <p className="text-[10px] text-slate-500 font-medium">Gemini 3.8 Flash Grounded</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] flex items-center gap-1 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-[#059669]" />
          RAG Ready
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* SECTION 1: AI Reply Drafter matching dashboard.jpg */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              Reply Drafter
            </span>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SELECTED TONE:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['professional', 'empathetic', 'concise'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`text-[11px] font-bold py-1.5 px-1 rounded-lg capitalize transition-all cursor-pointer border ${
                    tone === t
                      ? 'bg-[#EEF2FF] border-[#3B82F6] text-[#2563EB] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={isDrafting}
            className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDrafting ? 'Generating Draft...' : 'Draft Response with AI'}</span>
          </button>

          {aiDraft && (
            <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                  Generated Draft
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {aiDraft}
              </p>

              {groundedSources.length > 0 && (
                <div className="flex items-center gap-1 text-[9px] text-indigo-600 pt-1 border-t border-indigo-100/60">
                  <BookOpen className="w-3 h-3" />
                  <span>Grounded on: {groundedSources.join(', ')}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onInsertToComposer(aiDraft)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span>Insert to Composer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: AI Thread Summarizer matching dashboard.jpg */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Thread Summarizer
            </span>
          </div>

          <button
            type="button"
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="w-full flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{isSummarizing ? 'Summarizing Thread...' : 'Summarize Thread (3 Bullets)'}</span>
          </button>

          {summaryPoints && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Key Points
              </span>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pl-3 list-disc">
                {summaryPoints.map((point, idx) => (
                  <li key={idx} className="leading-snug">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION 3: Customer Intel & SLA matching dashboard.jpg */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            CUSTOMER PROFILE
          </span>
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#0F172A]">{ticket.customerName}</div>
            <div className="text-[11px] text-slate-500 font-medium">Enterprise Plan - SLA: 2 Hours</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              SLA Target
            </span>
            <span className="font-bold text-[#059669]">On Track (34m remaining)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
