'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Mail,
  User,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createTicket } from '../../lib/api';
import { Ticket } from '../../lib/types';

const CATEGORIES = [
  { id: 'billing', label: 'Billing & Payments', tag: 'billing', desc: 'Invoices, billing, and refunds' },
  { id: 'api', label: 'API & Webhooks', tag: 'api', desc: 'Technical integration & gateway errors' },
  { id: 'security', label: 'Security & Auth', tag: 'security', desc: 'Account access, SSO, and privacy' },
  { id: 'sla', label: 'Enterprise SLA Escalation', tag: 'vip-escalation', desc: 'Critical outages & SLA review' },
];

const PRIORITIES = [
  {
    id: 'LOW',
    label: 'LOW',
    bg: 'bg-[#F1F5F9]',
    text: 'text-slate-600',
    border: 'border-slate-200',
    activeBg: 'bg-[#E2E8F0] border-2 border-slate-400 text-slate-800 font-bold',
  },
  {
    id: 'MEDIUM',
    label: 'MEDIUM',
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    border: 'border-[#FDE68A]',
    activeBg: 'bg-[#FEF3C7] border-2 border-[#D97706] text-[#78350F] font-bold',
  },
  {
    id: 'HIGH',
    label: 'HIGH',
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#9A3412]',
    border: 'border-[#FED7AA]',
    activeBg: 'bg-[#FFEDD5] border-2 border-[#EA580C] text-[#7C2D12] font-bold',
  },
  {
    id: 'CRITICAL',
    label: 'CRITICAL',
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#991B1B]',
    border: 'border-[#FECACA]',
    activeBg: 'bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] font-black',
  },
];

export default function PublicCustomerPortalPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('billing');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('CRITICAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please enter your full name and an active email address.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a subject and a detailed issue description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const chosenTag = CATEGORIES.find((c) => c.id === selectedCategory)?.tag || 'general';
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        customerId: `cust-${Date.now().toString(36)}`,
        customerName: customerName.trim(),
        tags: [chosenTag, 'inbound-portal'],
      });

      setCreatedTicket(ticket);
    } catch {
      setErrorMessage('Failed to submit ticket to server. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCreatedTicket(null);
  };

  const getPriorityBadgeStyle = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-[#FEE2E2] text-[#991B1B] border-2 border-[#DC2626]';
      case 'HIGH':
        return 'bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]';
      default:
        return 'bg-[#F1F5F9] text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white relative">
      {/* Top Navbar matching portal.jpg */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo_warna_s.png"
                alt="Sentirix Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#0F172A] tracking-tight">Sentirix</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EEF2FF] text-[#2563EB] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
                  AI COPILOT PORTAL
                </span>
              </div>
              <p className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase">
                AUTONOMOUS SUPPORT INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* Right Status Indicator from portal.jpg: Real-time Live Ticketing Active + Internal Login */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#065F46] font-medium">Real-time Live Ticketing Active</span>
            </div>

            <Link
              href="/"
              className="text-xs font-bold text-slate-800 hover:text-[#2563EB] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Internal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 relative z-10 flex-1 flex flex-col justify-center">
        {createdTicket ? (
          /* Confirmation Success Card */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-3.5 py-1 rounded-full inline-block mb-3">
              ● Ticket Queued in Real-Time
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mb-2">
              Ticket #{createdTicket.ticketNumber} Received!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
              Your inquiry has been automatically triaged by{' '}
              <strong className="text-[#2563EB]">Gemini AI Triage</strong> and synchronized directly to our frontline support workspace.
            </p>

            {/* Ticket Details Box */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 text-left text-xs mb-8 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Ticket Reference Number:</span>
                <span className="font-mono font-black text-[#2563EB] text-sm bg-[#EEF2FF] px-2.5 py-0.5 rounded border border-[#C7D2FE]">
                  #{createdTicket.ticketNumber}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Issue Subject:</span>
                <span className="font-bold text-[#0F172A] text-right max-w-xs sm:max-w-md truncate">
                  {createdTicket.title}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">AI Triage Urgency:</span>
                <span className={`font-black text-xs px-2.5 py-0.5 rounded-lg ${getPriorityBadgeStyle(createdTicket.priority)}`}>
                  {createdTicket.priority} • {createdTicket.sentiment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Submitted By:</span>
                <span className="font-semibold text-slate-800">{createdTicket.customerName}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Ticket</span>
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>View in Agent Workspace Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Submission Form matching portal.jpg */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <p className="text-sm text-slate-700 mb-6 leading-relaxed">
              Report transaction issues, API technical errors, or system escalations. Your ticket will be dispatched immediately to Team Leaders and Support Agents.
            </p>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Full Name &amp; Company <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Liam Chan (PinPulse Global)"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Customer Work Email <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="liam@finpulse.io"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Category Cards matching portal.jpg */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Issue Category <span className="text-[#DC2626]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1D4ED8] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold">{cat.label}</span>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-[#2563EB] stroke-[3]" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal leading-tight">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency Level Preview matching portal.jpg priority pills */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Severity / Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRIORITIES.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id as any)}
                        className={`py-2 px-3 rounded-xl text-center text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? p.activeBg
                            : `${p.bg} ${p.text} ${p.border} font-bold opacity-85 hover:opacity-100`
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Subject / Issue Summary <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Billed twice for annual enterprise subscription"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Detailed Issue Description <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe steps to reproduce, timestamp of occurrence, and invoice number or error code..."
                  className="w-full bg-white border-2 border-[#2563EB] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-blue-100 transition-all leading-relaxed font-medium"
                />
              </div>

              {/* AI Triage Banner Box matching portal.jpg */}
              <div className="p-4 bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl flex items-start gap-3 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1E3A8A] flex items-center gap-1.5">
                    <span>Drafted with Gemini API &amp; Autonomous Triage</span>
                  </h4>
                  <p className="text-[11px] text-[#334155] leading-relaxed mt-0.5">
                    As soon as you submit, the Gemini AI model analyzes sentiment, detects SLA urgency, and routes your ticket to the optimal agent in real-time.
                  </p>
                </div>
              </div>

              {/* Submit Button matching portal.jpg */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing with Gemini API &amp; Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Support Ticket to Agent Queue</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Clean Bottom Footer */}
      <footer className="border-t border-slate-200 py-3 text-center text-xs text-slate-500 bg-white">
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold text-slate-700">Sentirix</span>
          <span>•</span>
          <span>AI-Powered Ticket Intelligence</span>
          <span>•</span>
          <span className="text-[#2563EB] font-semibold">Gemini 2.5 Real-Time Triage</span>
        </div>
      </footer>
    </div>
  );
}
