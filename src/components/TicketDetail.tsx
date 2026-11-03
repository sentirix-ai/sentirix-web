'use client';

import React, { useState } from 'react';
import { Ticket, Message, TicketStatus } from '../lib/types';
import {
  Send,
  Lock,
  User,
  ShieldAlert,
  Clock,
  ArrowRightLeft,
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
}) => {
  const [activeTab, setActiveTab] = useState<'PUBLIC_REPLY' | 'INTERNAL_NOTE'>('PUBLIC_REPLY');
  const [isSending, setIsSending] = useState(false);

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
    </main>
  );
};
