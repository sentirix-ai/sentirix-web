'use client';

import React from 'react';
import { Ticket, Sentiment, Priority } from '../lib/types';
import { Search, Flame, AlertCircle, Smile, Minus, Tag } from 'lucide-react';

interface TicketQueueProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const getSentimentBadge = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'FRUSTRATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]">
            <AlertCircle className="w-3 h-3 text-[#BE123C]" />
            Frustrated
          </span>
        );
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Flame className="w-3 h-3 text-[#D97706]" />
            Urgent
          </span>
        );
      case 'POSITIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <Smile className="w-3 h-3 text-[#059669]" />
            Positive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Minus className="w-3 h-3 text-slate-500" />
            Neutral
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] tracking-wide">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] tracking-wide">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047] tracking-wide">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 tracking-wide">
            LOW
          </span>
        );
    }
  };

  const filterTabs = ['ALL', 'NEW', 'OPEN', 'PENDING', 'RESOLVED'];

  return (
    <aside className="w-96 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-4rem)] shrink-0">
      {/* Search Header matching dashboard.jpg */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, tags, customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#0F172A] placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Status Filters matching dashboard.jpg: ALL solid blue */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onStatusFilterChange(tab)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List matching dashboard.jpg */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No tickets found matching your query.
          </div>
        ) : (
          tickets.map((t) => {
            const isSelected = t.id === selectedTicketId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                className={`p-4 cursor-pointer transition-all border-b border-slate-100 ${
                  isSelected
                    ? 'bg-[#F8FAFC] border-l-4 border-l-[#2563EB] shadow-2xs'
                    : 'hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    #{t.ticketNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(t.priority)}
                    {getSentimentBadge(t.sentiment)}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-[#0F172A] line-clamp-1 mb-1">
                  {t.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                    {t.customerName}
                  </span>
                  <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {t.workspaceName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      {t.workspaceName}
                    </span>
                  )}
                  {t.tags && t.tags.length > 0 &&
                    t.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-medium shadow-2xs"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
