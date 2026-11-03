'use client';

import React, { useState } from 'react';
import { X, Layers, Sparkles, AlertCircle, Check } from 'lucide-react';
import { createCustomPod } from '../lib/api';
import { PodInfo } from '../lib/types';

interface CreatePodModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onPodCreated: (newPod: PodInfo) => void;
}

export const CreatePodModal: React.FC<CreatePodModalProps> = ({
  isOpen,
  onClose,
  username,
  onPodCreated,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CUSTOM');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Pod name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await createCustomPod(username, {
        name: name.trim(),
        podCategory: category,
        description: description.trim() || undefined,
        maxMembers,
      });

      if (!res.success || !res.pod) {
        setErrorMessage(res.error || 'Failed to create pod.');
        return;
      }

      onPodCreated(res.pod);
      onClose();
    } catch {
      setErrorMessage('Network error while creating pod.');
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
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Create Operational Pod</h3>
              <p className="text-[11px] text-slate-500">Autonomous squad for specialized ticket handling</p>
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
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pod Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pod Kurir Instant & Sameday"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category Tag</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="CUSTOM">CUSTOM (Custom Inquiries)</option>
              <option value="TRACKING">TRACKING (Waybill & Resi)</option>
              <option value="CLAIMS">CLAIMS (Damage & Lost Cargo)</option>
              <option value="DISPATCH">DISPATCH (Courier Fleet)</option>
              <option value="BILLING">BILLING (Invoices & Payments)</option>
              <option value="TECHNICAL">TECHNICAL (API & Bugs)</option>
              <option value="VIP">VIP (High-Value Customers)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Semantic AI Routing Guidance</label>
              <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 2.5
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Handles damaged parcels during transit, broken seals, compensation claims"
              rows={2}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Pod Member Capacity</label>
              <span className="text-[11px] text-slate-500 font-mono">Max 8 (Two-Pizza Rule)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="w-12 text-center px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                {maxMembers} {maxMembers === 1 ? 'seat' : 'seats'}
              </span>
            </div>
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
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Pod...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Pod</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
