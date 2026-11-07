'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Message, TicketStatus } from '../lib/types';
import {
  Send,
  Lock,
  User,
  ShieldAlert,
  Clock,
  ArrowRightLeft,
  Globe,
  Smartphone,
  Mail,
  FileText,
  Sparkles,
  Ticket as TicketIcon,
  Plus,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket | null;
  messages: Message[];
  onSendMessage: (content: string, type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE') => Promise<void>;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  collisionAgent: string | null;
  composerText: string;
  onComposerTextChange: (text: string) => void;
  onOpenTransferModal?: () => void;
  openTicketTabs?: Ticket[];
  onSelectTicketTab?: (ticket: Ticket) => void;
  onCloseTicketTab?: (ticketId: string) => void;
  onAddTicketTab?: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  messages,
  onSendMessage,
  onStatusChange,
  collisionAgent,
  composerText,
  onComposerTextChange,
  onOpenTransferModal,
  openTicketTabs,
  onSelectTicketTab,
  onCloseTicketTab,
  onAddTicketTab,
}) => {
  const [activeTab, setActiveTab] = useState<'PUBLIC_REPLY' | 'INTERNAL_NOTE'>('PUBLIC_REPLY');
  const [isSending, setIsSending] = useState(false);
  const [ticketToConfirmClose, setTicketToConfirmClose] = useState<Ticket | null>(null);

  const handleAttemptCloseTab = (tabTicket: Ticket) => {
    // If ticket is already resolved or pending, close immediately without prompting
    if (tabTicket.status === 'RESOLVED' || tabTicket.status === 'PENDING') {
      onCloseTicketTab && onCloseTicketTab(tabTicket.id);
    } else {
      // Unresolved active ticket (NEW, OPEN) - trigger corporate soft confirmation guardrail
      setTicketToConfirmClose(tabTicket);
    }
  };

  const handleConfirmClose = () => {
    if (ticketToConfirmClose) {
      onCloseTicketTab && onCloseTicketTab(ticketToConfirmClose.id);
      setTicketToConfirmClose(null);
    }
  };

  useEffect(() => {
    if (!ticketToConfirmClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setTicketToConfirmClose(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketToConfirmClose]);

  const getChannelBadge = (tags?: string[]) => {
    if (tags?.includes('agent-inbound')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
          <TicketIcon className="w-3 h-3 text-purple-600" />
          <span>Support Inbound</span>
        </span>
      );
    }
    if (tags?.includes('inbound-portal')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#2563EB]" />
          <span>Demo Portal Showcase</span>
        </span>
      );
    }
    if (tags?.includes('mobile-app')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <Smartphone className="w-3 h-3 text-emerald-600" />
          <span>Mobile App</span>
        </span>
      );
    }
    if (tags?.includes('email') || tags?.includes('inbound-email')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <Mail className="w-3 h-3 text-amber-600" />
          <span>Email Inbound</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
        <FileText className="w-3 h-3 text-slate-400" />
        <span>Manual / Helpdesk</span>
      </span>
    );
  };

  if (!ticket) {
    return (
      <main className="flex-1 flex items-center justify-center bg-white text-slate-400 text-xs">
        Select a ticket from the queue to view details and start resolving.
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(composerText, activeTab);
      onComposerTextChange('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Multi-Terminal Workspace Tab Bar (On-Demand Pull Concurrency) */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
        {/* Left: Open Active Terminal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {openTicketTabs && openTicketTabs.length > 0 ? (
            openTicketTabs.map((tabTicket) => {
              const isActive = tabTicket.id === ticket.id;
              return (
                <div
                  key={tabTicket.id}
                  onClick={() => onSelectTicketTab && onSelectTicketTab(tabTicket)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white text-slate-900 border-slate-200/90 shadow-xs font-bold border-t-2 border-t-[#2563EB]'
                      : 'bg-slate-200/40 hover:bg-slate-200/80 text-slate-600 border-transparent hover:border-slate-200'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-[#2563EB]' : 'bg-emerald-500 animate-pulse'
                    }`}
                    title={isActive ? 'Active Workspace' : 'Active Customer Session'}
                  />

                  {/* Ticket Number & Customer Name */}
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    #{tabTicket.ticketNumber}
                  </span>
                  <span className="truncate max-w-[110px] sm:max-w-[130px]">
                    {tabTicket.customerName || tabTicket.title}
                  </span>

                  {/* Close Tab Button */}
                  {openTicketTabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttemptCloseTab(tabTicket);
                      }}
                      className="opacity-50 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-all cursor-pointer ml-0.5"
                      title="Close ticket terminal"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          ) : null}

          {/* [+] Button to Add / Claim Next Ticket Terminal */}
          <button
            type="button"
            onClick={onAddTicketTab}
            disabled={openTicketTabs && openTicketTabs.length >= 5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0"
            title={
              openTicketTabs && openTicketTabs.length >= 5
                ? 'Maximum workload capacity reached (5/5 Terminals)'
                : 'Click to add another terminal and claim the next queued ticket'
            }
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {openTicketTabs && openTicketTabs.length >= 5 ? 'Max (5/5)' : 'Add Terminal'}
            </span>
          </button>
        </div>

        {/* Right: Workload Capacity Meter */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-500 font-medium shrink-0 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Workload:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
            <span>{openTicketTabs ? openTicketTabs.length : 1}/5</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`w-1.5 h-3 rounded-xs ${
                    slot <= (openTicketTabs ? openTicketTabs.length : 1)
                      ? 'bg-blue-600'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Collision Alert Banner */}
      {collisionAgent && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>
              Collision Alert: <strong>{collisionAgent}</strong> is also viewing and editing this ticket.
            </span>
          </div>
          <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Live Collision Guard
          </span>
        </div>
      )}

      {/* Ticket Header matching dashboard.jpg */}
      <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              #{ticket.ticketNumber} {ticket.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {ticket.customerName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Created {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            {getChannelBadge(ticket.tags)}
          </div>
        </div>

        {/* Status & Pod Actions */}
        <div className="flex items-center gap-2.5">
          {onOpenTransferModal && (
            <button
              type="button"
              onClick={onOpenTransferModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Transfer ticket to another operational pod"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>{ticket.workspaceName || 'Transfer Pod'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
              className="text-xs font-bold bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer shadow-2xs"
            >
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="PENDING">PENDING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Timeline matching dashboard.jpg */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        {messages.map((msg) => {
          const isInternal = msg.type === 'INTERNAL_NOTE';
          return (
            <div
              key={msg.id}
              className={`rounded-2xl border p-5 transition-all shadow-xs ${
                isInternal
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-slate-900'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isInternal
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-[#EEF2FF] text-[#4F46E5]'
                    }`}
                  >
                    {msg.senderName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">
                    {msg.senderName}
                  </span>
                  {isInternal && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 rounded-md">
                      <Lock className="w-2.5 h-2.5" />
                      Internal Note (Private)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-xs leading-relaxed whitespace-pre-wrap pl-9 text-slate-800 font-medium">
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Composer matching dashboard.jpg */}
      <div className="border-t border-slate-200 bg-white p-5">
        {/* Tab Switcher: Public Reply (Blue) vs Internal Note */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('PUBLIC_REPLY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'PUBLIC_REPLY'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Public Reply
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INTERNAL_NOTE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'INTERNAL_NOTE'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Internal Note
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={composerText}
            onChange={(e) => onComposerTextChange(e.target.value)}
            placeholder={
              activeTab === 'PUBLIC_REPLY'
                ? 'Type your official reply...'
                : 'Write an internal note for your team (customer will not see this)...'
            }
            className={`w-full text-xs p-3.5 rounded-xl border focus:outline-hidden focus:ring-2 resize-none transition-colors ${
              activeTab === 'INTERNAL_NOTE'
                ? 'bg-[#FFFBEB] border-amber-300 focus:ring-amber-500 text-slate-900 placeholder:text-amber-800/50 font-medium'
                : 'bg-white border-slate-200 focus:ring-[#2563EB] text-[#0F172A] placeholder:text-slate-400 font-medium'
            }`}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {activeTab === 'PUBLIC_REPLY'
                ? 'Public reply will be emailed to customer'
                : 'Private internal note for support & engineering team only'}
            </span>
            <button
              type="submit"
              disabled={isSending || !composerText.trim()}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send Reply'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Corporate Soft Confirmation Modal - "Guardrails Instead of Handcuffs" */}
      {ticketToConfirmClose && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setTicketToConfirmClose(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button top right */}
            <button
              type="button"
              onClick={() => setTicketToConfirmClose(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Alert Icon */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-2xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-base font-bold text-slate-900">
                  Close Active Ticket Terminal?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Active customer session safeguard
                </p>
              </div>
            </div>

            {/* Ticket Snapshot Card */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">
                  #{ticketToConfirmClose.ticketNumber}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Status: {ticketToConfirmClose.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-900 truncate">
                {ticketToConfirmClose.customerName || 'Customer'} — {ticketToConfirmClose.title}
              </div>
            </div>

            {/* Gartner Explanatory Guideline Text */}
            <p className="mt-3.5 text-xs text-slate-600 leading-relaxed">
              Ticket <span className="font-semibold text-slate-800">#{ticketToConfirmClose.ticketNumber}</span> ({ticketToConfirmClose.customerName}) is currently active and has not been resolved. Are you sure you want to close this terminal tab? The ticket will safely remain in the queue for later handling.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTicketToConfirmClose(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Keep Working
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
