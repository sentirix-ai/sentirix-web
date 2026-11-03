'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, Lightbulb } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isLoading) return;

    try {
      setIsLoading(true);
      await onSubmit(title, description);
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetTitle: string, presetDesc: string) => {
    setTitle(presetTitle);
    setDescription(presetDesc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Support Ticket</h2>
              <p className="text-[11px] text-slate-500">Gemini AI will automatically triage sentiment & urgency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset suggestions */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Test Presets (Click to load):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  'Credit card charged twice for annual subscription plan',
                  'I upgraded my account this morning and our accounting team noticed two consecutive charges of $2,400. We need one refunded immediately!',
                )
              }
              className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2.5 py-1 rounded-md border border-rose-200 cursor-pointer transition-colors"
            >
              🔥 Frustrated / Duplicate Charge
            </button>
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  'Critical webhook latency 504 gateway timeout on production',
                  'All order notifications are timing out with 504 errors on EU-central region. Customers are not receiving order confirmations.',
                )
              }
              className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-md border border-amber-200 cursor-pointer transition-colors"
            >
              ⚠️ Urgent / API Outage
            </button>
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  'Inquiry regarding SAML SSO integration with Azure AD',
                  'Hello, we are planning to migrate our identity provider to Azure AD and would like to review the step-by-step setup documentation.',
                )
              }
              className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold px-2.5 py-1 rounded-md border border-sky-200 cursor-pointer transition-colors"
            >
              ℹ️ Neutral / Tech Inquiry
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ticket Title / Subject
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot access billing invoice PDF"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Customer Issue Details
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem in detail. Gemini AI will read this to extract urgency, sentiment, and tags..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Triaging with Gemini AI...' : 'Submit & Triage Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
