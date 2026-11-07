'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Ticket as TicketIcon,
  Sparkles,
  Hash,
} from 'lucide-react';

export interface NewTicketPayload {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  referenceId?: string;
}

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewTicketPayload) => Promise<void>;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // Aligned Customer Fields (Matching /portal structure)
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Silicon Valley Keyboard Shortcuts: Esc to close, ⌘/Ctrl + Enter to submit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const form = document.getElementById('new-ticket-modal-form') as HTMLFormElement | null;
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer full name.');
      return;
    }

    if (!customerEmail.trim()) {
      setErrorMessage('Please enter the customer email address for official follow-up.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a ticket subject and customer issue details.');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
      });

      // Reset form on success
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setReferenceId('');
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      setErrorMessage('Failed to create ticket. Please verify system connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
              <TicketIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">New Support Ticket</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Capture customer details and issue summary for AI triage and routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form - Scrollable */}
        <form
          id="new-ticket-modal-form"
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto flex-1"
        >
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Identity Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Identity</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                Requester
              </span>
            </div>

            {/* Row 1.1: Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Jordan Lee"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Row 1.2: Customer Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@company.com"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / Mobile{' '}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ticket Specifications Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Ticket Specifications</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                Inbound
              </span>
            </div>

            {/* Row 2.1: Order Number or Transaction ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order / Reference ID{' '}
                <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. ORD-84920 or TRX-948201"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Row 2.2: Ticket Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ticket Subject <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Payment processed twice for annual subscription"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Row 2.3: Detailed Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Details &amp; Agent Notes <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the customer issue, chronology of events, and initial agent troubleshooting observations..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 leading-relaxed font-sans shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">AI Sentiment &amp; Priority Triage Enabled</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !customerName.trim() ||
                  !customerEmail.trim() ||
                  !title.trim() ||
                  !description.trim()
                }
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
