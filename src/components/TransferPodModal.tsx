'use client';

import React, { useState } from 'react';
import { X, ArrowRightLeft, Sparkles, AlertCircle, Check } from 'lucide-react';
import { transferTicketPod } from '../lib/api';
import { Ticket, PodInfo } from '../lib/types';

interface TransferPodModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  pods: PodInfo[];
  onTransferred: (updatedTicket: Ticket) => void;
  currentUserId?: string;
}

export const TransferPodModal: React.FC<TransferPodModalProps> = ({
  isOpen,
  onClose,
  ticket,
  pods,
  onTransferred,
  currentUserId,
}) => {
  const eligiblePods = pods.filter((p) => p.id !== ticket.workspaceId);
  const [targetPodId, setTargetPodId] = useState<string>(eligiblePods[0]?.id || '');
  const [handoverNote, setHandoverNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAiNote = () => {
    const targetPod = pods.find((p) => p.id === targetPodId);
    const targetName = targetPod ? targetPod.name : 'Target Pod';
    const note = `Handing over Ticket #${ticket.ticketNumber} to ${targetName}. Core issue: "${ticket.title}". Customer sentiment is ${ticket.sentiment}. Priority: ${ticket.priority}.`;
    setHandoverNote(note);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPodId) {
      setErrorMessage('Please select a target pod.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await transferTicketPod(
        ticket.id,
        targetPodId,
        handoverNote.trim() || undefined,
        currentUserId,
      );

      if (!res.success || !res.ticket) {
        setErrorMessage(res.error || 'Failed to transfer ticket.');
        return;
      }

      onTransferred(res.ticket);
      onClose();
    } catch {
      setErrorMessage('Network error while transferring ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Transfer Ticket Between Pods</h3>
              <p className="text-[11px] text-slate-500">Cross-Pod Handover for Ticket #{ticket.ticketNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="text-slate-500 text-[11px]">Active Ticket:</div>
            <div className="font-semibold text-slate-900 line-clamp-1">{ticket.title}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">
              Current Pod:{' '}
              <strong className="text-slate-600">
                {ticket.workspaceName || 'General Queue'}
              </strong>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Target Operational Pod *</label>
            <select
              value={targetPodId}
              onChange={(e) => setTargetPodId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              required
            >
              {eligiblePods.length === 0 ? (
                <option value="">No other pods available</option>
              ) : (
                eligiblePods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCatchAll ? '(Catch-All Triage)' : `(${p.openTicketsCount} open)`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Handover Context Note</label>
              <button
                type="button"
                onClick={handleGenerateAiNote}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Auto-Draft AI Summary
              </button>
            </div>
            <textarea
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="Explain why this ticket is being handed over to the new pod..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetPodId}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
