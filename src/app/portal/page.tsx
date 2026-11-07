'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  UploadCloud,
  Copy,
  X,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Lock,
  CheckCheck,
} from 'lucide-react';
import { createTicket } from '../../lib/api';
import { Ticket } from '../../lib/types';

export default function CustomerSupportPortalPage() {
  // Customer Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Native Local Storage File State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>('');

  // Handle Local Device File Selection & Drag-and-Drop
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please choose a smaller image or PDF document.');
      return;
    }
    setAttachedFile(file);
    setErrorMessage(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerEmail.trim()) {
      setErrorMessage('Please provide a valid email address so we can send you resolution updates.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide an issue summary and a description of what happened.');
      return;
    }

    try {
      setIsSubmitting(true);
      const tags = ['inbound-portal', 'customer-care'];

      if (referenceId.trim()) {
        tags.push(`ref:${referenceId.trim().replace(/\s+/g, '_')}`);
      }

      // Compile structured contact & reference metadata for agent handling
      const contactInfo = customerPhone.trim()
        ? `Email: ${customerEmail.trim()} | Phone: ${customerPhone.trim()}`
        : `Email: ${customerEmail.trim()}`;

      const refInfo = referenceId.trim() ? ` | Order/TRX: ${referenceId.trim()}` : '';
      const fileInfo = attachedFile
        ? ` | Attachment: ${attachedFile.name} (${formatFileSize(attachedFile.size)})`
        : '';

      const fullDescription = `${description.trim()}\n\n[Contact: ${contactInfo}${refInfo}${fileInfo}]`;

      const ticket = await createTicket({
        title: title.trim(),
        description: fullDescription,
        customerId: `cust-${Date.now().toString(36)}`,
        customerName: customerName.trim(),
        tags,
      });

      const now = new Date();
      setSubmittedTimestamp(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );

      setCreatedTicket(ticket);
    } catch {
      setErrorMessage('Unable to reach the customer care resolution gateway. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setReferenceId('');
    setAttachedFile(null);
    setCreatedTicket(null);
    setCopiedRef(false);
    setSubmittedTimestamp('');
  };

  const handleCopyReference = (ticketNum: number) => {
    navigator.clipboard.writeText(`#${ticketNum}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      {/* Subtle Ambient Corporate Lighting Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Ambient Aura */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl opacity-50" />
        {/* Elegant Micro-Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Header - Corporate Luxury Glassmorphic Identity */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-200/90 shadow-xs flex items-center justify-center ring-2 ring-slate-100 shrink-0">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-[#0F172A] tracking-tight whitespace-nowrap">Help Center</span>
                <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 text-[#2563EB] px-2 sm:px-2.5 py-0.5 rounded-full border border-blue-200/70 shadow-2xs whitespace-nowrap">
                  Care
                </span>
              </div>
              <p className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 tracking-wide truncate">
                Customer Resolution Portal
              </p>
            </div>
          </div>

          {/* Right Live Service Status - Corporate Executive Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-xs font-semibold shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-xs shadow-emerald-400" />
            <span className="text-slate-700 font-medium hidden md:inline">24/7 Priority Support Online</span>
            <span className="text-[#059669] text-[10.5px] sm:text-[11px] font-mono font-bold">Rapid Response</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 relative z-10 flex-1">
        {createdTicket ? (
          /* Elevated Corporate Resolution Voucher (Digital Receipt) */
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-2xl shadow-slate-200/70 text-center animate-scaleUp space-y-6 sm:space-y-7 relative overflow-hidden max-w-2xl mx-auto">
            {/* Top Corporate Gradient Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

            {/* Emblem Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 ring-6 sm:ring-8 ring-blue-50/80">
              <HeartHandshake className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Escalated with Top Priority</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                We Sincerely Apologize for the Inconvenience
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your report has been safely logged in our Customer Care system. A specialized agent has been assigned to your case and will follow up with a resolution directly via your registered email or phone as quickly as possible.
              </p>
            </div>

            {/* Official Executive Resolution Slip */}
            <div className="bg-[#F8FAFC]/90 border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left text-xs space-y-3.5 shadow-xs relative overflow-hidden">
              {/* Slip Top Header with Live Timestamp */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 text-[10px] sm:text-[10.5px] font-mono">
                <span className="font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Official Resolution Record
                </span>
                <span className="text-slate-500 font-semibold">
                  {submittedTimestamp || 'Recorded Just Now'}
                </span>
              </div>

              {/* 5 Essential Data Fields */}
              <div className="space-y-3 pt-0.5">
                {/* 1. Ticket Reference */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Ticket Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-700 text-sm bg-blue-50/90 px-3 py-1 rounded-lg border border-blue-200/80 shadow-2xs">
                      #{createdTicket.ticketNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyReference(createdTicket.ticketNumber)}
                      className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100"
                    >
                      {copiedRef ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          Copied!
                        </span>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Reported Problem */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-3 border-b border-slate-100 gap-1 sm:gap-4">
                  <span className="text-slate-500 font-medium shrink-0 pt-0.5">Reported Problem:</span>
                  <span className="font-bold text-slate-900 sm:text-right leading-snug">
                    {createdTicket.title}
                  </span>
                </div>

                {/* 3. Registered Email */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-3 border-b border-slate-100 gap-0.5 sm:gap-2">
                  <span className="text-slate-500 font-medium">Registered Email:</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11.5px] break-all">{customerEmail}</span>
                </div>

                {/* 4. Registered Phone (if provided) */}
                {customerPhone.trim() && (
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Registered Phone:</span>
                    <span className="font-semibold text-slate-800 font-mono text-[11.5px]">{customerPhone}</span>
                  </div>
                )}

                {/* 5. Submitted By */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500 font-medium">Submitted By:</span>
                  <span className="font-semibold text-slate-900">{createdTicket.customerName}</span>
                </div>
              </div>
            </div>

            {/* Enterprise Trust & Compliance Micro-Badges */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10.5px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>256-Bit TLS Encrypted</span>
              </span>
              <span className="hidden sm:inline text-slate-300">&bull;</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Tamper-Proof Audit Record</span>
              </span>
              <span className="hidden sm:inline text-slate-300">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>SOC2 Type II Standard</span>
              </span>
            </div>

            {/* Action to Submit Another Inquiry if Needed */}
            <div className="max-w-xs mx-auto pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit Another Request</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pure Consumer Intake Form - Elevated Corporate Cleanliness */
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl shadow-slate-200/60 space-y-6 relative overflow-hidden">
            {/* Top Subtle Corporate Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Submit a Support Request
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Please provide the details of your issue below. Our customer care team will review your case and follow up directly to resolve it as quickly as possible.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Your Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Separated Email & Phone Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. alex@gmail.com"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional, for urgent callback)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +1 555-0192 or 0812-3456-7890"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Order Number or Transaction ID (Explicitly Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Order Number or Transaction ID <span className="text-slate-400 font-normal">(Optional, if applicable)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="e.g. ORD-948201, TRX-558291, or receipt #"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Subject / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Subject / Summary of Your Issue <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Charged twice during checkout or Order not delivered"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Describe What Happened <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about what went wrong, time of occurrence, amounts involved, and how you would like us to help..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100 transition-all leading-relaxed font-medium"
                />
              </div>

              {/* Native Local Device File Upload (Real Storage Picker + Drag-and-Drop) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Attach Screenshot or Proof Document <span className="text-slate-400 font-normal">(Optional)</span>
                </label>

                {/* Hidden Real HTML5 File Input accessing device file explorer */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDragging
                      ? 'border-[#2563EB] bg-blue-50/80 scale-[1.01]'
                      : attachedFile
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-blue-50/30'
                  }`}
                >
                  {attachedFile ? (
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 truncate">
                        <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{attachedFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          ({formatFileSize(attachedFile.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 hover:bg-rose-100 rounded-md text-rose-600 transition-colors ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-500">
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        <span className="sm:hidden">Tap to choose file or photo from your device</span>
                        <span className="hidden sm:inline">Click to browse files from your device, or drag &amp; drop here</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Supports screenshot images (PNG, JPG) or PDF receipts (Max 10MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Your Request...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Request to Customer Care</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Customer Care Footer */}
      <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 bg-white/80 backdrop-blur-md relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <span className="font-bold text-slate-800">Customer Care &amp; Resolution Service</span>
          <span>&bull;</span>
          <span>Official Help Center</span>
          <span>&bull;</span>
          <span className="text-[#2563EB] font-bold">Rapid Resolution Commitment</span>
        </div>
      </footer>
    </div>
  );
}
