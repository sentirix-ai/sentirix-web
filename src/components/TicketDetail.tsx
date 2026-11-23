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
  Paperclip,
  Check,
  Volume2,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  History,
  Timer,
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket | null;
  messages: Message[];
  onSendMessage: (
    content: string,
    type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE',
    attachedFiles?: File[] | File | null,
  ) => Promise<void>;
  onStatusChange: (status: TicketStatus, resolutionNotes?: string) => Promise<void>;
  collisionAgent: string | null;
  composerText: string;
  onComposerTextChange: (text: string) => void;
  onOpenTransferModal?: () => void;
  openTicketTabs?: Ticket[];
  onSelectTicketTab?: (ticket: Ticket) => void;
  onCloseTicketTab?: (ticketId: string) => void;
  onAddTicketTab?: () => void;
  hasAvailableTickets?: boolean;
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
  hasAvailableTickets,
}) => {
  const [activeTab, setActiveTab] = useState<'PUBLIC_REPLY' | 'INTERNAL_NOTE'>('PUBLIC_REPLY');
  const [isSending, setIsSending] = useState(false);
  const [ticketToConfirmClose, setTicketToConfirmClose] = useState<Ticket | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveNotesInput, setResolveNotesInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 15 * 1024 * 1024) {
        alert(`File "${f.name}" melebihi batas 15MB.`);
        continue;
      }
      newFiles.push(f);
    }
    setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!ticket) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const file = new File([blob], `pasted_screenshot_${Date.now()}.png`, { type: blob.type });
          if (file.size > 15 * 1024 * 1024) {
            alert('Pasted screenshot melebihi batas 15MB.');
            return;
          }
          setAttachedFiles((prev) => [...prev, file].slice(0, 5));
          break;
        }
      }
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || (!composerText.trim() && attachedFiles.length === 0) || isSending) return;

    try {
      setIsSending(true);
      let messageContent = composerText.trim();
      if (attachedFiles.length > 0) {
        const fileTags = attachedFiles
          .map((f) => `[Attachment: ${f.name} (${formatFileSize(f.size)})]`)
          .join('\n');
        messageContent = messageContent ? `${messageContent}\n\n${fileTags}` : fileTags;
      }
      await onSendMessage(messageContent, activeTab, attachedFiles);
      onComposerTextChange('');
      setAttachedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
              const isActive = ticket && tabTicket.id === ticket.id;
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
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-200/40 border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span>Standby — No Active Terminal</span>
            </div>
          )}

          {/* [+] Button to Add / Claim Next Ticket Terminal */}
          <button
            type="button"
            onClick={onAddTicketTab}
            disabled={(openTicketTabs && openTicketTabs.length >= 5) || hasAvailableTickets === false}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0"
            title={
              openTicketTabs && openTicketTabs.length >= 5
                ? 'Maximum workload capacity reached (5/5 Terminals)'
                : hasAvailableTickets === false
                ? 'No queued tickets available to claim'
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
            <span>{openTicketTabs ? openTicketTabs.length : 0}/5</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className={`w-1.5 h-3 rounded-xs ${
                    slot <= (openTicketTabs ? openTicketTabs.length : 0)
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
      {collisionAgent && ticket && (
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
        {ticket ? (
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
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-base font-extrabold text-slate-400 tracking-tight flex items-center gap-2">
                <TicketIcon className="w-4 h-4 text-slate-400" />
                <span>Service Console (Standby)</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                No Active Ticket Selected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Workspace Idle & Ready
              </span>
            </div>
          </div>
        )}

        {/* Status & Pod Actions */}
        <div className="flex items-center gap-2.5">
          {onOpenTransferModal && (
            <button
              type="button"
              onClick={onOpenTransferModal}
              disabled={!ticket}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
              title="Transfer ticket to another operational pod"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>{ticket?.workspaceName || 'Transfer Pod'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={ticket?.status || 'OPEN'}
              onChange={(e) => {
                const nextStatus = e.target.value as TicketStatus;
                if (nextStatus === 'RESOLVED') {
                  setResolveNotesInput('');
                  setIsResolveModalOpen(true);
                } else {
                  onStatusChange(nextStatus);
                }
              }}
              disabled={!ticket}
              className="text-xs font-bold bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white relative">
        {ticket ? (
          <>
            {/* Hanging Ticket Warning Banner */}
            {ticket.isHanging && (
              <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm animate-pulse flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-rose-900 tracking-wider uppercase">
                      ⚠️ Tiket Menggantung (Hanging / Abandoned)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      Prioritas Pemulihan
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Tiket ini belum tuntas dan agen sebelumnya terputus/offline. Alasan:{' '}
                    <strong className="text-rose-900 font-bold">{ticket.hangingReason || 'Koneksi Terputus / Agen Keluar'}</strong>.
                    {ticket.hangingSince && (
                      <span className="text-slate-500 font-medium ml-1">
                        (Terbengkalai sejak {new Date(ticket.hangingSince).toLocaleTimeString()})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Cross-Pod Transfer Audit Trail */}
            {ticket.podTransfers && ticket.podTransfers.length > 0 && (
              <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>Jejak Transfer Antar-Pod ({ticket.podTransfers.length}x)</span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md">
                    Handover Audit Trail
                  </span>
                </div>
                <div className="space-y-1.5">
                  {ticket.podTransfers.map((tf) => (
                    <div
                      key={tf.id}
                      className="flex items-start justify-between bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                          <span className="text-slate-600">{tf.fromPod?.name || 'Pod Asal'}</span>
                          <span className="text-indigo-600">→</span>
                          <span className="text-indigo-700">{tf.toPod?.name || 'Pod Tujuan'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          Catatan: <span className="italic">{tf.reason}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Oleh: {tf.transferredBy?.fullName || tf.transferredBy?.username || 'Staff Operasional'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(tf.transferredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLA & Handling Activity Metric */}
            {ticket.agentActivities && ticket.agentActivities.length > 0 && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 text-xs text-slate-800 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700">Waktu Penanganan (AHT):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {Math.round((ticket.agentActivities[0].durationSeconds || 0) / 60)} Menit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">SLA:</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      ticket.agentActivities[0].slaStatus === 'BREACHED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : ticket.agentActivities[0].slaStatus === 'MET'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {ticket.agentActivities[0].slaStatus || 'ON_TRACK'}
                  </span>
                </div>
              </div>
            )}

            {/* Resolution Banner if Resolved or Closed */}
            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Masalah Telah Dinyatakan Selesai</span>
                  </div>
                  {ticket.resolvedAt && (
                    <span className="text-[11px] text-emerald-700 font-mono">
                      {new Date(ticket.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {ticket.resolutionNotes && (
                  <p className="text-emerald-800 bg-white/70 p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                    <strong>Catatan Solusi:</strong> {ticket.resolutionNotes}
                  </p>
                )}
              </div>
            )}

            {/* Root Inbound Ticket Request Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {ticket.customerName ? ticket.customerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {ticket.customerName || 'Inbound Requester'}
                    </span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200/70 font-semibold px-2 py-0.5 rounded-md ml-2">
                      Original Request
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(ticket.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-xs leading-relaxed whitespace-pre-wrap pl-9 text-slate-800 font-medium">
                {ticket.description}
              </div>

              {/* Multi-Media Hub: Evidence & Attachments */}
              {(() => {
                const ticketAttachments = (ticket.attachments && ticket.attachments.length > 0)
                  ? ticket.attachments
                  : (ticket.attachmentData ? [{
                      id: 'legacy-proof',
                      ticketId: ticket.id,
                      uploadedById: ticket.customerId,
                      fileName: ticket.attachmentName || 'Visual Proof',
                      fileType: ticket.attachmentType || 'application/octet-stream',
                      fileSizeByte: 0,
                      fileUrl: ticket.attachmentData,
                      fileData: ticket.attachmentData,
                      fileCategory: 'EVIDENCE',
                      caption: 'Attached by Requester',
                      createdAt: ticket.createdAt,
                    }] : []);

                if (ticketAttachments.length === 0) return null;

                const imageFiles = ticketAttachments.filter((a) =>
                  a.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.fileName)
                );
                const audioFiles = ticketAttachments.filter((a) =>
                  a.fileType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(a.fileName)
                );
                const documentFiles = ticketAttachments.filter((a) =>
                  !a.fileType?.startsWith('image/') &&
                  !a.fileType?.startsWith('audio/') &&
                  !/\.(jpg|jpeg|png|webp|gif|svg|mp3|wav|ogg|m4a|aac)$/i.test(a.fileName)
                );

                return (
                  <div className="mt-4 pl-9 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lampiran Berkas Bukti ({ticketAttachments.length} File)</span>
                    </div>

                    {/* 1. Photo / Image Gallery Grid with Lightbox Zoom */}
                    {imageFiles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Galeri Foto Bukti (Klik untuk perbesar):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg">
                          {imageFiles.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxImage({ url: img.fileData || img.fileUrl, title: img.fileName })}
                              className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all aspect-video flex items-center justify-center"
                            >
                              <img
                                src={img.fileData || img.fileUrl}
                                alt={img.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2 text-center">
                                <Eye className="w-4 h-4" />
                                <span className="text-[9px] font-bold truncate max-w-full">
                                  {img.fileName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Audio Complaint / Voice Note Player */}
                    {audioFiles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Rekaman Suara / Audio Keluhan:
                        </span>
                        <div className="space-y-2 max-w-md">
                          {audioFiles.map((aud) => (
                            <div
                              key={aud.id}
                              className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-bold text-slate-900 truncate">
                                    {aud.fileName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-blue-700 font-mono shrink-0">
                                  {aud.fileSizeByte > 0 ? formatFileSize(aud.fileSizeByte) : 'Audio Clip'}
                                </span>
                              </div>
                              <audio
                                controls
                                preload="metadata"
                                src={aud.fileData || aud.fileUrl}
                                className="w-full h-8"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Document / PDF Invoice Cards */}
                    {documentFiles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Dokumen & Faktur:
                        </span>
                        <div className="space-y-2 max-w-md">
                          {documentFiles.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 font-bold text-[9px] shrink-0">
                                <FileText className="w-4 h-4 text-rose-600" />
                                <span>DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {doc.fileName}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {doc.fileSizeByte > 0 ? formatFileSize(doc.fileSizeByte) : 'Document'}
                                </span>
                              </div>
                              <a
                                href={doc.fileData || doc.fileUrl}
                                download={doc.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                              >
                                Unduh
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Subsequent Conversation Messages */}
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

                  {msg.attachmentData && (
                    <div className="mt-3 ml-9">
                      {msg.attachmentType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(msg.attachmentName || '') ? (
                        <div
                          onClick={() => setLightboxImage({ url: msg.attachmentData!, title: msg.attachmentName || 'Attachment' })}
                          className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl max-w-md shadow-2xs cursor-pointer transition-colors"
                        >
                          <img
                            src={msg.attachmentData}
                            alt={msg.attachmentName || 'Attachment preview'}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {msg.attachmentName || 'Image Attachment'}
                            </p>
                            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Klik untuk memperbesar
                            </span>
                          </div>
                        </div>
                      ) : msg.attachmentType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(msg.attachmentName || '') ? (
                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl max-w-md space-y-1.5 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="truncate">{msg.attachmentName || 'Audio Recording'}</span>
                          </div>
                          <audio controls src={msg.attachmentData} className="w-full h-8" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-w-md shadow-2xs">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 font-bold text-[9px] shrink-0">
                            <FileText className="w-4 h-4 text-rose-600" />
                            <span>PDF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {msg.attachmentName || 'Attached Document'}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {isInternal ? 'Internal team attachment' : 'Shared with customer'}
                            </span>
                          </div>
                          <a
                            href={msg.attachmentData}
                            download={msg.attachmentName || 'document'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                          >
                            Unduh
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
              <TicketIcon className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              Customer Resolution Hub
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              Select a ticket from the queue to review customer history, collaborate via internal notes, or draft a resolution.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agent Workspace Ready</span>
            </div>
          </div>
        )}
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
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,audio/*,.mp3,.wav,.ogg,.m4a"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <textarea
            rows={3}
            value={ticket ? composerText : ''}
            onChange={(e) => onComposerTextChange(e.target.value)}
            onPaste={handlePaste}
            disabled={!ticket}
            placeholder={
              !ticket
                ? 'Select a ticket from the queue to compose a reply or add an internal note...'
                : activeTab === 'PUBLIC_REPLY'
                ? 'Type your official reply (you can paste screenshots with Ctrl+V)...'
                : 'Write an internal note for your team (customer will not see this)...'
            }
            className={`w-full text-xs p-3.5 rounded-xl border focus:outline-hidden focus:ring-2 resize-none transition-colors ${
              !ticket
                ? 'bg-slate-50/70 border-slate-200 text-slate-400 placeholder:text-slate-400 cursor-not-allowed font-medium'
                : activeTab === 'INTERNAL_NOTE'
                ? 'bg-[#FFFBEB] border-amber-300 focus:ring-amber-500 text-slate-900 placeholder:text-amber-800/50 font-medium'
                : 'bg-white border-slate-200 focus:ring-[#2563EB] text-[#0F172A] placeholder:text-slate-400 font-medium'
            }`}
          />

          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              {attachedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-900 truncate max-w-[130px]">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {attachedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah (Maks 5)</span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!ticket}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 active:scale-95 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 shadow-2xs shrink-0"
                title={
                  !ticket
                    ? 'Select a ticket to attach file'
                    : 'Attach multiple screenshots, audio recordings, or invoices (up to 5 files)'
                }
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-400 font-medium">
                {!ticket
                  ? 'Composer standby — select a ticket to start messaging'
                  : activeTab === 'PUBLIC_REPLY'
                  ? 'Public reply will be emailed to customer'
                  : 'Private internal note for support & engineering team only'}
              </span>
            </div>
            <button
              type="submit"
              disabled={!ticket || isSending || (!composerText.trim() && attachedFiles.length === 0)}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-[#1D4ED8] shrink-0"
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
      {/* High-Resolution Media Lightbox Zoom */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-slate-900 rounded-2xl border border-slate-700 p-3 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 text-white border-b border-slate-800 mb-2">
              <span className="text-xs font-bold truncate max-w-md">{lightboxImage.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download={lightboxImage.title}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  title="Download full size"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
      {/* Resolution Notes Modal */}
      {isResolveModalOpen && ticket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsResolveModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 relative animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-base font-bold text-slate-900">
                  Selesaikan Tiket #{ticket.ticketNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masukkan catatan solusi teknis / tindakan perbaikan resmi untuk pelanggan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ringkasan Solusi (Resolution Notes):
              </label>
              <textarea
                rows={3}
                value={resolveNotesInput}
                onChange={(e) => setResolveNotesInput(e.target.value)}
                placeholder="Contoh: Suku cadang radiator telah diganti dengan part orisinil nomor seri #884 dan kompresi mesin normal..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 leading-relaxed font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onStatusChange('RESOLVED', resolveNotesInput.trim() || undefined);
                  setIsResolveModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Masalah Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
