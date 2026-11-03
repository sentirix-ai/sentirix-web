'use client';

import React, { useState } from 'react';
import {
  Users,
  Layers,
  ShieldCheck,
  TrendingUp,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Sparkles,
  Crown,
  UserCheck,
  Sliders,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { OwnerAnalyticsData } from '../lib/types';

interface OwnerAnalyticsViewProps {
  analyticsData: OwnerAnalyticsData | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onSwitchToHelpdesk?: () => void;
}

export const OwnerAnalyticsView: React.FC<OwnerAnalyticsViewProps> = ({
  analyticsData,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LEADER' | 'MEMBER'>('ALL');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 animate-pulse">
          <Crown className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Loading Owner Analytics...</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Aggregating registered users, leads, team capacities, and onboarding metrics.
        </p>
      </div>
    );
  }

  const { summary, growthTrend, capacityDistribution, usersDirectory } = analyticsData;

  // Filter users directory
  const filteredUsers = usersDirectory.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'LEADER' && u.role === 'CUSTOMER') ||
      (roleFilter === 'MEMBER' && u.role === 'AGENT');

    return matchesSearch && matchesRole;
  });

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyAllLeads = () => {
    const emails = usersDirectory.map((u) => u.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmail('ALL');
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Username',
      'Full Name',
      'Work Email',
      'Phone Number',
      'Role',
      'Verification Channel',
      'Workspace Name',
      'Maximum Capacity',
      'Occupied Seats',
      'Remaining Seats',
      'Onboarding Status',
      'Registration Date',
    ];

    const rows = usersDirectory.map((u) => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${u.fullName.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || '-'}"`,
      `"${u.role === 'CUSTOMER' ? 'Team Leader' : 'Agent Member'}"`,
      `"${u.verificationMethod}"`,
      `"${u.workspace?.name ? u.workspace.name.replace(/"/g, '""') : '-'}"`,
      u.workspace?.maxMembers || '-',
      u.workspace?.currentMembersCount || '-',
      u.workspace?.remainingSeats || '-',
      `"${u.onboardingCompleted ? 'Completed' : 'Pending'}"`,
      `"${new Date(u.createdAt).toLocaleString('en-US')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentirix-marketing-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Founder Cockpit Controls */}
      <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>SaaS Platform Owner • Marketing Intelligence &amp; User Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Owner Analytics &amp; Marketing Intelligence</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Central hub for monitoring user growth, team capacity adoption trends, marketing lead intelligence, and Sentirix operational health.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A2234] hover:bg-[#232D44] border border-[#2A3650] text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh Real-Time Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#38BDF8]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              title="Download entire user leads database as a CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Leads (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-[#121824]/90 border border-[#1E2638] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Registered Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {summary.totalUsers}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {summary.completedOnboardingCount} Team Leaders + {summary.totalActiveMembers} Agent Members
            </span>
          </div>
        </div>

        {/* Card 2: Workspaces */}
        <div className="bg-[#121824]/90 border border-[#1E2638] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Support Workspaces
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {summary.totalWorkspaces}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Onboarding Completion Rate: {summary.onboardingRate}%</span>
          </div>
        </div>

        {/* Card 3: Active Members */}
        <div className="bg-[#121824]/90 border border-[#1E2638] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Occupied Team Seats (Active)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {summary.totalActiveMembers}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active frontline agents in database</span>
          </div>
        </div>

        {/* Card 4: Marketing Channels */}
        <div className="bg-[#121824]/90 border border-[#1E2638] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registration Channel
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {summary.emailVerifiedCount} <span className="text-xs font-normal text-slate-400">Email</span> / {summary.phoneVerifiedCount} <span className="text-xs font-normal text-slate-400">SMS</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verification method chosen by users</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Growth Trend & Capacity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Growth Timeline (7 Days) */}
        <div className="lg:col-span-7 bg-[#121824]/80 border border-[#1E2638] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#1E2638]">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>User Growth Trend (Last 7 Days)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daily new account registrations
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Tracker
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 pb-2 items-end min-h-[170px]">
            {growthTrend.map((item, idx) => {
              const maxSignups = Math.max(...growthTrend.map((g) => g.signups), 1);
              const heightPercent = Math.max(15, Math.round((item.signups / maxSignups) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                    {item.signups}
                  </span>
                  <div className="w-full bg-[#0B0F17]/80 rounded-lg p-1 flex items-end justify-center h-28 border border-[#1E2638]/80">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-md bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all shadow-md shadow-indigo-600/30"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    {item.dayLabel.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2638]/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>This metric helps measure marketing campaign effectiveness for Sentirix.</span>
            <span className="text-indigo-400 font-semibold">Total: {summary.totalUsers} Users</span>
          </div>
        </div>

        {/* Right: Capacity Tier Adoption (1 - 8 Members) */}
        <div className="lg:col-span-5 bg-[#121824]/80 border border-[#1E2638] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2638]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Team Capacity Adoption (1 - 8)</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Team size preferences chosen by Team Leaders
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1E2638]">
                Product-Market Fit
              </span>
            </div>

            <div className="space-y-2.5">
              {capacityDistribution.map((item) => (
                <div key={item.capacity} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-400 font-bold">
                      {item.count} Workspaces ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0B0F17] border border-[#1E2638] overflow-hidden">
                    <div
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }}
                      className={`h-full rounded-full transition-all ${
                        item.count > 0
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-xs shadow-purple-500/50'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2638]/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Use this data to design future subscription pricing tiers.</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Marketing Leads & User Directory Database */}
      <div className="bg-[#121824]/80 border border-[#1E2638] rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header with Filters & Search */}
        <div className="p-5 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>User Directory &amp; Marketing Leads Database</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comprehensive list of registered accounts, business contacts, and workspace statuses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-[#0B0F17] border border-[#1E2638] rounded-xl p-1 text-xs">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({usersDirectory.length})
              </button>
              <button
                onClick={() => setRoleFilter('LEADER')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === 'LEADER'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Team Leaders ({usersDirectory.filter((u) => u.role === 'CUSTOMER').length})
              </button>
              <button
                onClick={() => setRoleFilter('MEMBER')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === 'MEMBER'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agent Members ({usersDirectory.filter((u) => u.role === 'AGENT').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0B0F17] border border-[#1E2638] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all w-48 sm:w-60"
              />
            </div>

            {/* Quick Export Leads */}
            <button
              onClick={handleCopyAllLeads}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              title="Copy all emails for marketing mailing list"
            >
              {copiedEmail === 'ALL' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Emails Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Lead Emails</span>
                </>
              )}
            </button>

            {/* Download CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Download all registrant data and contacts to CSV / Excel format"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F17]/70 border-b border-[#1E2638] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User / Account</th>
                <th className="py-3 px-4">Contact (Marketing Lead)</th>
                <th className="py-3 px-4">Verification Channel</th>
                <th className="py-3 px-4">Workspace &amp; Team Capacity</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No users match the search filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLeader = user.role === 'CUSTOMER';
                  const dateFormatted = new Date(user.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 ${
                              isLeader
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 ring-1 ring-indigo-400'
                                : 'bg-slate-800 ring-1 ring-slate-700'
                            }`}
                          >
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">
                                @{user.username}
                              </span>
                              {isLeader ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  TEAM LEADER
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  AGENT MEMBER
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{user.fullName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Leads */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-mono text-[11px]">{user.email}</span>
                            <button
                              onClick={() => handleCopyEmail(user.email)}
                              className="text-slate-500 hover:text-indigo-400 ml-1 cursor-pointer"
                              title="Copy email"
                            >
                              {copiedEmail === user.email ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="font-mono text-[11px]">{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 italic">No phone recorded</span>
                          )}
                        </div>
                      </td>

                      {/* Verification Channel */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            user.verificationMethod === 'PHONE'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                              : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                          }`}
                        >
                          {user.verificationMethod === 'PHONE' ? (
                            <>
                              <Phone className="w-3 h-3 text-purple-400" />
                              <span>SMS / Phone OTP</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3 text-indigo-400" />
                              <span>Work Email Link</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Workspace & Capacity */}
                      <td className="py-3.5 px-4">
                        {user.workspace ? (
                          <div className="space-y-1">
                            <span className="font-medium text-slate-200 block text-xs">
                              {user.workspace.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 rounded text-[10px]">
                                {user.workspace.currentMembersCount}/{user.workspace.maxMembers} Seats Filled
                              </span>
                              <span className="text-slate-500">
                                ({user.workspace.remainingSeats} left)
                              </span>
                            </div>
                          </div>
                        ) : isLeader ? (
                          <span className="text-amber-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Workspace not set up</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Joined as Agent Member
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {dateFormatted}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right">
                        {user.onboardingCompleted || !isLeader ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Onboarding</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};