'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  MoreVertical,
  Flame,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Download,
  Search,
  CheckCircle2,
  Table,
  LayoutGrid,
  Camera,
} from 'lucide-react';
import { OwnerAnalyticsData, Ticket } from '../lib/types';
import { OwnerAnalyticsView } from './OwnerAnalyticsView';
import { UserSession } from '../lib/auth';

interface AdminCockpitViewProps {
  analyticsData: OwnerAnalyticsData | null;
  tickets: Ticket[];
  isConnected: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSwitchToHelpdesk: () => void;
  onLogout: () => void;
  user?: UserSession | null;
  onOpenProfileModal?: () => void;
}

export const AdminCockpitView: React.FC<AdminCockpitViewProps> = ({
  analyticsData,
  tickets,
  isConnected,
  onRefresh,
  isRefreshing,
  onSwitchToHelpdesk,
  onLogout,
  user,
  onOpenProfileModal,
}) => {
  const [activeNav, setActiveNav] = useState<'COCKPIT' | 'LEADS'>('COCKPIT');
  const [timeRange, setTimeRange] = useState('Live (Last 24 Hours)');

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* 1. TOP HEADER matching admin.jpg */}
      <header className="h-16 border-b border-[#1E2638] bg-[#0E131F] px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Sentirix Logo + Divider + LIVE MONITORING & ANALYTICS */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#1E2638] bg-[#0e183c] p-1 flex items-center justify-center shadow-md shadow-blue-500/10">
            <img
              src="/logo_warna_s.png"
              alt="Sentirix Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl text-white tracking-tight">Sentirix</span>
            <span className="text-[#38455E] text-lg font-light">|</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              LIVE MONITORING &amp; ANALYTICS
            </span>
          </div>
        </div>

        {/* Middle: Real-Time WebSocket Status matching admin.jpg */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-[#10B981] animate-pulse shadow-sm shadow-emerald-400/50' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-semibold text-slate-300">
            Real-Time WebSocket:{' '}
            <strong className={isConnected ? 'text-[#10B981]' : 'text-amber-400'}>
              {isConnected ? 'CONNECTED' : 'RECONNECTING'}
            </strong>
          </span>
        </div>

        {/* Right: Time Range Dropdown & Admin Profile matching admin.jpg */}
        <div className="flex items-center gap-4">
          {/* View Switcher: Live Cockpit vs Marketing Leads */}
          <div className="flex items-center bg-[#131926] p-1 rounded-xl border border-[#1E2638] text-xs">
            <button
              onClick={() => setActiveNav('COCKPIT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeNav === 'COCKPIT'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cockpit</span>
            </button>
            <button
              onClick={() => setActiveNav('LEADS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeNav === 'LEADS'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Marketing Leads</span>
            </button>
          </div>

          {/* Time Filter Pill Dropdown matching admin.jpg */}
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1E2533] border border-[#2D3748] text-xs font-semibold text-slate-200 hover:bg-[#252E3E] transition-colors cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switch to Helpdesk Client View */}
          <button
            onClick={onSwitchToHelpdesk}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2533] hover:bg-[#252E3E] border border-[#2D3748] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="View helpdesk interface from user/agent perspective"
          >
            <span>Demo Helpdesk</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Admin Avatar Circle matching admin.jpg */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E2638]">
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="relative group cursor-pointer focus:outline-hidden"
              title="Click to view account profile and upload photo"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center border-2 border-[#3B82F6]/50 shadow-md overflow-hidden group-hover:border-[#60A5FA] transition-all">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username || 'pungkyrama'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.avatarText || 'PR'}</span>
                )}
              </div>
              {/* Camera hover badge */}
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#2563EB] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs border border-[#0E131F]">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenProfileModal}
              className="hidden md:block text-left cursor-pointer group"
              title="Click to open account settings"
            >
              <span className="block text-xs font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                {user?.username || 'pungkyrama'}
              </span>
              <span className="block text-[10px] text-slate-400 -mt-0.5 font-medium group-hover:text-slate-300 transition-colors">
                Platform Admin
              </span>
            </button>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1E2533] transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY: LEFT SLIM NAVBAR + MAIN CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Slim Vertical Icon Bar matching admin.jpg */}
        <aside className="w-14 bg-[#0E131F] border-r border-[#1E2638] flex flex-col items-center justify-between py-5 shrink-0">
          <div className="flex flex-col items-center gap-5">
            {/* Nav Icon 1: Grid */}
            <button
              onClick={() => setActiveNav('COCKPIT')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeNav === 'COCKPIT'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-[#161D2C]'
              }`}
              title="Live Command Center"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* Nav Icon 2: Ticket / Leads Table */}
            <button
              onClick={() => setActiveNav('LEADS')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeNav === 'LEADS'
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-[#161D2C]'
              }`}
              title="Marketing Leads & Users Directory"
            >
              <Table className="w-5 h-5" />
            </button>

            {/* Nav Icon 3: Pulse Activity */}
            <button
              onClick={onRefresh}
              className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161D2C] transition-all cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#38BDF8]' : ''
              }`}
              title="Refresh Real-Time Data"
            >
              <Activity className="w-5 h-5" />
            </button>

            {/* Nav Icon 4: Users Team */}
            <button
              onClick={onSwitchToHelpdesk}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161D2C] transition-all cursor-pointer"
              title="Helpdesk Workspace View"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Nav Icon 5: Settings */}
            <button
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161D2C] transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Logout Icon matching admin.jpg */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-[#1E2533] transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#0B0F17]">
          {activeNav === 'LEADS' && analyticsData ? (
            /* TAB: FULL LEADS & USER DIRECTORY */
            <div className="max-w-7xl mx-auto">
              <OwnerAnalyticsView
                analyticsData={analyticsData}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
                onSwitchToHelpdesk={onSwitchToHelpdesk}
              />
            </div>
          ) : (
            /* TAB: LIVE COCKPIT matching admin.jpg EXACTLY */
            <div className="max-w-[1550px] mx-auto space-y-5">
              {/* 3-Column Cockpit Grid matching admin.jpg */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* ------------------------------------------------------------- */}
                {/* COLUMN 1: LEFT (SLA Breach Warning & Counters + Collision Alerts) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
                  {/* Card 1: SLA Breach Warning & Counters */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg flex-1">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                      SLA Breach Warning &amp; Counters
                    </h3>

                    {/* Giant Red 14 with upward trend arrow */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-6xl font-black text-[#EF4444] tracking-tight">14</span>
                      <TrendingUp className="w-8 h-8 text-[#EF4444] stroke-[2.5]" />
                    </div>

                    <div className="text-sm font-bold text-white mb-6">Active Breaches</div>

                    {/* Divider */}
                    <div className="border-t border-[#1E2638] pt-5 space-y-4">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">
                          Average Response Time:
                        </span>
                        <span className="text-3xl font-black text-[#38BDF8] tracking-tight block mt-1">
                          4.2 mins
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="text-xs text-slate-400 font-medium block">FCR:</span>
                        <span className="text-3xl font-black text-white tracking-tight block mt-1">
                          68.4%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Agent Collision Alerts */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Agent Collision Alerts
                    </h3>

                    <div className="bg-[#1A1813] border border-[#F59E0B]/70 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F59E0B]">Collision Warning</span>
                        <span className="bg-[#F59E0B] text-black font-black text-[10px] px-2 py-0.5 rounded uppercase">
                          #F59E0B
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        Agent Jane &amp; Karim are typing on #1003!
                      </p>

                      {/* Overlapping Agent Avatars */}
                      <div className="flex items-center -space-x-2 pt-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1A1813]">
                          JA
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1A1813]">
                          KA
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1A1813]">
                          MV
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 2: CENTER (Charts area) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
                  {/* Chart 1: Ticket Response Time & Volatilitas SLA */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Ticket Response Time &amp; Volatilitas SLA
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-[#3B82F6]">
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                          Response Time (min)
                        </span>
                        <span className="flex items-center gap-1 text-[#06B6D4]">
                          <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                          SLA Volatility
                        </span>
                      </div>
                    </div>

                    {/* SVG Curve Chart matching admin.jpg */}
                    <div className="relative h-56 w-full pt-2">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 500 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 40, 80, 120, 160].map((y, idx) => (
                          <line
                            key={idx}
                            x1="30"
                            y1={y}
                            x2="490"
                            y2={y}
                            stroke="#1E2638"
                            strokeWidth="1"
                            strokeDasharray={idx === 4 ? '' : '3 3'}
                          />
                        ))}

                        {/* Y-axis Labels */}
                        <text x="5" y="10" fill="#64748B" fontSize="10" fontFamily="sans-serif">100</text>
                        <text x="10" y="50" fill="#64748B" fontSize="10" fontFamily="sans-serif">80</text>
                        <text x="10" y="90" fill="#64748B" fontSize="10" fontFamily="sans-serif">60</text>
                        <text x="10" y="130" fill="#64748B" fontSize="10" fontFamily="sans-serif">40</text>
                        <text x="10" y="170" fill="#64748B" fontSize="10" fontFamily="sans-serif">20</text>
                        <text x="15" y="198" fill="#64748B" fontSize="10" fontFamily="sans-serif">0</text>

                        {/* Curve 1: Blue glowing wave */}
                        <path
                          d="M 30,180 Q 75,130 120,135 T 210,138 T 300,60 T 390,70 T 480,85 L 480,195 L 30,195 Z"
                          fill="url(#blueGlow)"
                        />
                        <path
                          d="M 30,180 Q 75,130 120,135 T 210,138 T 300,60 T 390,70 T 480,85"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2.5"
                        />

                        {/* Curve 2: Cyan glowing wave */}
                        <path
                          d="M 30,180 Q 75,145 120,148 T 210,165 T 300,120 T 390,105 T 480,125 L 480,195 L 30,195 Z"
                          fill="url(#cyanGlow)"
                        />
                        <path
                          d="M 30,180 Q 75,145 120,148 T 210,165 T 300,120 T 390,105 T 480,125"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="2.5"
                        />

                        {/* Node Dots matching admin.jpg */}
                        {[
                          { cx: 30, cy: 180, col: '#3B82F6' },
                          { cx: 120, cy: 135, col: '#3B82F6' },
                          { cx: 210, cy: 138, col: '#3B82F6' },
                          { cx: 300, cy: 60, col: '#3B82F6' },
                          { cx: 390, cy: 70, col: '#3B82F6' },
                          { cx: 480, cy: 85, col: '#3B82F6' },
                          { cx: 120, cy: 148, col: '#06B6D4' },
                          { cx: 210, cy: 165, col: '#06B6D4' },
                          { cx: 300, cy: 120, col: '#06B6D4' },
                          { cx: 390, cy: 105, col: '#06B6D4' },
                          { cx: 480, cy: 125, col: '#06B6D4' },
                        ].map((pt, i) => (
                          <circle
                            key={i}
                            cx={pt.cx}
                            cy={pt.cy}
                            r="4"
                            fill="#FFFFFF"
                            stroke={pt.col}
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>

                    {/* X-axis Labels matching admin.jpg */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pl-6 pt-1">
                      <span>12:00</span>
                      <span>04:00</span>
                      <span>18:00</span>
                      <span>20:00</span>
                      <span>26:00</span>
                    </div>
                  </div>

                  {/* Chart 2: AI Automation Rate vs Manual */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        AI Automation Rate vs Manual
                      </h3>
                      <span className="text-[10px] font-bold text-[#38BDF8]">
                        Current Gemini Deflection: 68.4%
                      </span>
                    </div>

                    {/* SVG Mountain Area Chart matching admin.jpg */}
                    <div className="relative h-36 w-full pt-1">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 500 120"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 30, 60, 90].map((y, idx) => (
                          <line
                            key={idx}
                            x1="30"
                            y1={y}
                            x2="490"
                            y2={y}
                            stroke="#1E2638"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                        ))}

                        {/* Y-axis Labels */}
                        <text x="10" y="10" fill="#64748B" fontSize="10">80</text>
                        <text x="10" y="40" fill="#64748B" fontSize="10">60</text>
                        <text x="10" y="70" fill="#64748B" fontSize="10">40</text>
                        <text x="10" y="100" fill="#64748B" fontSize="10">20</text>
                        <text x="15" y="118" fill="#64748B" fontSize="10">0</text>

                        {/* Wave curve matching admin.jpg */}
                        <path
                          d="M 30,115 L 100,85 L 180,95 L 260,70 L 340,68 L 410,40 L 480,90 L 480,118 L 30,118 Z"
                          fill="url(#areaGradient)"
                        />
                        <path
                          d="M 30,115 L 100,85 L 180,95 L 260,70 L 340,68 L 410,40 L 480,90"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>

                    {/* X-axis Labels matching admin.jpg */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pl-6 pt-1">
                      <span>18:00</span>
                      <span>04:00</span>
                      <span>06:00</span>
                      <span>18:00</span>
                      <span>16:00</span>
                      <span>92:00</span>
                      <span>24:00</span>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 3: RIGHT (Real-time Live Ticketing Feed + System Load) */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
                  {/* Card 5: Real-time Live Ticketing Feed */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Real-time Live Ticketing Feed
                      </h3>
                      <button className="text-slate-500 hover:text-white cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Feed Item 1 matching admin.jpg */}
                    <div className="bg-[#18141B] border-l-4 border-l-[#EF4444] border border-[#2D1B28] rounded-xl p-3.5 mb-3 shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#EF4444]">Ticket #1003</span>
                        <span className="text-[10px] text-slate-500">Just Now</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1 mb-0.5">
                        Ticket #1003 [VIP Escalation]
                      </p>
                      <p className="text-[10px] text-slate-500 mb-1.5">[inbound: critical]</p>
                      <span className="text-[10px] font-black text-[#EF4444] uppercase tracking-wide block">
                        AI Sentiment Detection: FRUSTRATED
                      </span>
                    </div>

                    {/* Feed Item 2 matching admin.jpg */}
                    <div className="bg-[#191712] border-l-4 border-l-[#F59E0B] border border-[#302619] rounded-xl p-3.5 mb-3 shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#F59E0B]">Ticket #1002</span>
                        <span className="text-[10px] text-slate-500">2m ago</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1 mb-0.5">
                        Ticket #1002 [Autorange]
                      </p>
                      <p className="text-[10px] text-slate-500 mb-1.5">[inbound: urgent]</p>
                      <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-wide block">
                        AI Sentiment Detection: FRUSTRATED
                      </span>
                    </div>

                    {/* Feed Item 3 matching admin.jpg */}
                    <div className="bg-[#18141B] border-l-4 border-l-[#EF4444] border border-[#2D1B28] rounded-xl p-3.5 shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#EF4444]">Ticket #1001</span>
                        <span className="text-[10px] text-slate-500">2m ago</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1 mb-0.5">
                        Ticket #1003 [VIP Escalation]
                      </p>
                      <p className="text-[10px] text-slate-500 mb-1.5">[inbound: high]</p>
                      <span className="text-[10px] font-black text-[#EF4444] uppercase tracking-wide block">
                        AI Sentiment Detection: URGENT
                      </span>
                    </div>
                  </div>

                  {/* Card 6: System Load & API Response matching admin.jpg */}
                  <div className="bg-[#121824] border border-[#1E2638] rounded-2xl p-5 shadow-lg space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                      System Load &amp; API Response
                    </h3>

                    {/* Bar 1: aman */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#10B981]">aman</span>
                        <span className="text-[11px] text-slate-400">99.8% Uptime</span>
                      </div>
                      <div className="w-full h-4 bg-[#064E3B]/80 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-[#10B981] w-[88%] rounded-full shadow-xs" />
                      </div>
                    </div>

                    {/* Bar 2: warning */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#F59E0B]">warning</span>
                        <span className="text-[11px] text-slate-400">Sub-380ms Gemini API</span>
                      </div>
                      <div className="w-full h-4 bg-[#78350F]/80 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-[#F59E0B] w-[62%] rounded-full shadow-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
