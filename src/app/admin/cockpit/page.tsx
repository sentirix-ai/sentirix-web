'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Layers,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  LogOut,
  Building2,
  Radio,
  Clock,
  Sparkles,
  BarChart3,
  ExternalLink,
  Bell,
  X,
} from 'lucide-react';
import { getSession, logoutUser, UserSession } from '../../../lib/auth';
import { fetchSuperAdminCockpit, regenerateToken } from '../../../lib/api';

const INDUSTRY_DISPLAY_NAMES: Record<string, string> = {
  PROFESSIONAL_SERVICES: 'Legal & CPA Tax Services',
  ECOMMERCE: 'E-Commerce & D2C Brands',
  LOGISTICS: 'Logistics, Freight & 3PLs',
  FINTECH: 'FinTech & Digital Payments',
  SAAS: 'B2B SaaS & Tech Enterprise',
  HEALTHCARE: 'Healthcare & Telemedicine',
  EDTECH: 'Education & Bootcamps',
};

const getSectorName = (industry?: string, customDesc?: string) => {
  if (industry && INDUSTRY_DISPLAY_NAMES[industry]) {
    return INDUSTRY_DISPLAY_NAMES[industry];
  }
  if (customDesc && customDesc.trim()) {
    return customDesc.trim();
  }
  return industry || 'Legal & CPA Tax Services';
};

export default function SuperAdminCockpitPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [cockpitData, setCockpitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRESENCE' | 'TOKENS' | 'CRISIS'>('OVERVIEW');
  const [selectedUserHistory, setSelectedUserHistory] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setCurrentTime(Date.now());
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0 dtk';
    if (seconds < 60) return `${seconds} dtk`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins} mnt ${secs} dtk`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} jam ${remMins} mnt`;
  };

  const loadData = async (activeUser: UserSession, showSpinner: boolean = true) => {
    if (showSpinner) setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSuperAdminCockpit(activeUser.username);
      if (!data) {
        if (showSpinner) {
          setErrorMessage('Gagal memuat data cockpit organisasi. Pastikan Anda telah menyelesaikan setup organisasi.');
        }
      } else {
        setCockpitData(data);
      }
    } catch {
      if (showSpinner) {
        setErrorMessage('Terjadi kesalahan saat memuat data dari server.');
      }
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }
    setLocalSession(active);
    loadData(active, true);

    // Auto-polling silent refresh setiap 3 detik untuk notifikasi dan sinkronisasi status real-time
    const interval = setInterval(() => {
      loadData(active, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const handleCopyLink = (token: string) => {
    const url = `http://localhost:3000/join?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRegenerateToken = async (oldToken: string) => {
    try {
      setRegeneratingToken(oldToken);
      const res = await regenerateToken(oldToken);
      if (res.success && session) {
        await loadData(session);
      } else {
        setErrorMessage(res.error || 'Gagal meregenerate token.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.setItem('is_manual_logout', 'true');
    } catch {}
    await logoutUser();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat Executive Cockpit Sentirix...</span>
        </div>
      </div>
    );
  }

  const org = cockpitData?.organization || {};
  const stats = cockpitData?.stats || {};
  const workspaces = cockpitData?.workspaces || [];
  const tokenAudit = cockpitData?.tokenAudit || [];
  const crisisTickets = cockpitData?.crisisTickets || [];
  const slaBreachedTickets = cockpitData?.slaBreachedTickets || [];

  const renderPresenceRow = (user: any, badgePrefix?: React.ReactNode) => {
    const isOnline = user.isOnline;
    const liveOnlineSeconds =
      isOnline && user.latestLoginAt
        ? Math.max(0, Math.floor((currentTime - new Date(user.latestLoginAt).getTime()) / 1000))
        : user.currentOnlineSeconds || 0;

    return (
      <tr key={user.userId} className="hover:bg-[#1E293B]/40 transition-colors">
        {/* Personel Name & Role */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2.5">
            {badgePrefix}
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-700/50 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
              {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{user.fullName}</span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : user.role === 'LEADER'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {user.role === 'SUPER_ADMIN'
                    ? 'SUPER ADMIN'
                    : user.role === 'LEADER'
                      ? 'LEADER'
                      : 'MEMBER'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">@{user.username}</span>
            </div>
          </div>
        </td>

        {/* Kesiapan & Beban Kerja (Opsi 1) */}
        <td className="py-3.5 px-4">
          <div className="space-y-1">
            {user.role === 'SUPER_ADMIN' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[11px] font-bold">
                <Crown className="w-3 h-3 text-purple-400" />
                <span>Pengawasan Eksekutif</span>
              </span>
            ) : user.operationalState === 'SERVING' || (isOnline && (user.activeTicketsCount || 0) > 0) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Melayani Pelanggan</span>
              </span>
            ) : isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Siaga (Standby)</span>
              </span>
            ) : user.operationalState === 'ABRUPT_DISCONNECT' || user.status === 'TERPUTUS' || user.status === 'LOGOUT_CLOSE_BROWSER' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Terputus (Close Browser)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Off-Duty (Selesai Shift)</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 block font-medium">
              {user.workloadDescription ||
                (isOnline
                  ? (user.activeTicketsCount || 0) > 0
                    ? `${user.activeTicketsCount} Tiket Aktif Ditangani`
                    : 'Siap Menerima Tiket'
                  : 'Meja Kerja Bebas')}
            </span>
          </div>
        </td>

        {/* Lamanya Waktu Online */}
        <td className="py-3.5 px-4">
          {isOnline ? (
            <div className="space-y-0.5">
              <div className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(liveOnlineSeconds)}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Sejak: {new Date(user.latestLoginAt).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">
              <span className="text-slate-500 text-[11px] block">Sesi Terakhir:</span>
              <span className="font-mono">
                {formatDuration(user.sessionHistory?.[0]?.durationSeconds || 0)}
              </span>
            </div>
          )}
        </td>

        {/* Catatan Disconnect & Re-Login */}
        <td className="py-3.5 px-4">
          {user.hadUnexpectedDisconnect ? (
            <div className="space-y-0.5 text-[11px]">
              <div className="text-amber-400 flex items-center gap-1">
                <span>Terputus:</span>
                <strong className="font-mono">
                  {user.unexpectedDisconnectTime
                    ? new Date(user.unexpectedDisconnectTime).toLocaleTimeString()
                    : '-'}
                </strong>
              </div>
              {user.reconnectedTime ? (
                <div className="text-emerald-400 flex items-center gap-1">
                  <span>Login Kembali:</span>
                  <strong className="font-mono">
                    {new Date(user.reconnectedTime).toLocaleTimeString()}
                  </strong>
                  <span className="text-slate-500 font-mono">
                    (Jeda: {formatDuration(user.disconnectDowntimeSeconds)})
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 italic text-[10px]">
                  Belum login kembali
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 text-[11px] italic">
              Normal (Tidak Ada Disconnect)
            </span>
          )}
        </td>

        {/* View History Button */}
        <td className="py-3.5 px-4 text-right">
          <button
            type="button"
            onClick={() => setSelectedUserHistory(user)}
            className="px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Detail History</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Titanium Navbar */}
      <header className="border-b border-slate-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-700 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">Sentirix</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                  AI COPILOT COCKPIT
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
                AUTONOMOUS SUPPORT INTELLIGENCE • {org.name || 'Enterprise Organization'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => session && loadData(session)}
              className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Executive Banner & Metrics Barometer */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Seats */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Alokasi Kursi</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.claimedSeats || 0}</span>
              <span className="text-xs text-slate-400">/ {stats.totalSeats || 9} Kursi Terpakai</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#0B0F19] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${stats.seatUtilizationPercentage || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Utilisasi Lisensi: {stats.seatUtilizationPercentage || 0}%
            </span>
          </div>

          {/* Card 2: Active Pods */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Pod Terkunci (Locked)</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{stats.lockedPods || 0}</span>
              <span className="text-xs text-slate-400">/ {stats.totalPods || 0} Pod Aktif</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Kaidah Amazon Two-Pizza ($\le$ 8 Orang/Pod)
            </span>
          </div>

          {/* Card 3: SLA Health */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Live SLA Compliance</span>
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {stats.slaCompliancePercentage !== undefined
                  ? `${stats.slaCompliancePercentage}%`
                  : '100%'}
              </span>
              <span
                className={`text-xs font-bold ${
                  (stats.slaCompliancePercentage ?? 100) >= 95
                    ? 'text-emerald-400'
                    : (stats.slaCompliancePercentage ?? 100) >= 80
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {stats.slaStatusLabel || 'Optimal'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Batas Waktu Respons: &lt; 15 Menit
              {stats.totalEvaluatedTickets > 0
                ? ` • ${stats.slaMetCount}/${stats.totalEvaluatedTickets} Tiket Terpenuhi`
                : ' • Belum Ada Tiket Masuk'}
            </span>
          </div>

          {/* Card 4: Crisis Radar */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Radar Eskalasi Kritis</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats.crisisCount || 0}</span>
              <span className="text-xs text-slate-400">Tiket Butuh Perhatian Direktur</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Deteksi Otomatis Gemini AI Triage
            </span>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'OVERVIEW', label: 'Topologi Pod & Beban Kerja', icon: Layers },
            { id: 'PRESENCE', label: 'Monitor Presensi & Waktu Online', icon: Clock, count: stats.onlineCount || 0 },
            { id: 'TOKENS', label: 'Audit Token Sekali Pakai', icon: ShieldCheck, count: tokenAudit.length },
            {
              id: 'CRISIS',
              label: 'Radar Krisis & SLA',
              icon: AlertTriangle,
              count: (stats.crisisCount || 0) + (stats.slaBreachedCount || 0),
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-[#111827] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0B0F19] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: POD TOPOLOGY */}
        {activeTab === 'OVERVIEW' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Topologi Pod Spesialisasi</h2>
                <p className="text-xs text-slate-400">
                  Status kuota yang dikunci oleh masing-masing Leader dan beban tiket aktif secara real-time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workspaces.map((ws: any, idx: number) => {
                const isLocked = ws.isQuotaLocked;
                return (
                  <div
                    key={ws.id}
                    className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 text-xs font-black flex items-center justify-center border border-blue-800">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                          isLocked
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{isLocked ? 'KUOTA TERKUNCI' : 'MENUNGGU LEADER'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        {getSectorName(org.industry, org.customIndustryDescription)}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-400">Leader:</span>
                        {ws.leaderClaimed ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{ws.leaderName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Teraktivasi</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-400/90 italic font-medium">
                            Menunggu Aktivasi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Services Tags with numbering */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1.5">
                        Layanan yang Ditangani:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {ws.services?.map((svc: string, sIdx: number) => (
                          <span
                            key={svc}
                            className="text-[10px] bg-[#0B0F19] text-blue-300 px-2.5 py-1 rounded-lg border border-slate-800 font-medium flex items-center gap-1.5"
                          >
                            <span className="text-blue-400 font-bold shrink-0">{sIdx + 1}.</span>
                            <span>{svc}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Kapasitas Pod:</span>
                        <span className="font-bold">
                          {ws.membersCount} / {ws.assignedQuota} Personel
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Antrean Tiket:</span>
                        <span className="font-bold text-blue-400">{ws.openTicketsCount} Terbuka</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB: PRESENCE & ONLINE TIME MONITORING */}
        {activeTab === 'PRESENCE' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Monitor Presensi &amp; Waktu Online (Leader &amp; Member)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemantauan durasi online real-time, histori waktu login/logout, serta pencatatan otomatis saat browser ditutup atau terputus.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Update real-time:</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="text-xs font-mono text-emerald-400 font-bold">LIVE</span>
              </div>
            </div>

            {/* Presensi Barometer Cards */}
            {(() => {
              const staffUsers = (cockpitData?.presenceMonitoring || []).filter(
                (u: any) => u.role !== 'SUPER_ADMIN',
              );
              const totalStaffCount = staffUsers.length;
              const onlineStaffCount = staffUsers.filter((u: any) => u.isOnline).length;
              const offlineStaffCount = staffUsers.filter((u: any) => !u.isOnline).length;
              const attendanceRate =
                totalStaffCount > 0
                  ? Math.round((onlineStaffCount / totalStaffCount) * 1000) / 10
                  : 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kotak 1: Personel Sedang Online */}
                  <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Personel Sedang Online</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-400">{onlineStaffCount}</span>
                        <span className="text-xs text-slate-500">Personel Aktif</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Sedang Aktif Bertugas</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  {/* Kotak 2: Personel Sedang Offline */}
                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Personel Sedang Offline</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-300">{offlineStaffCount}</span>
                        <span className="text-xs text-slate-500">Personel</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Tidak Aktif / Sedang Istirahat</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Kotak 3: Tingkat Kehadiran Tim (Opsi 3) */}
                  <div className="p-4 rounded-xl bg-[#111827] border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Tingkat Kehadiran Tim</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-blue-400">{attendanceRate}%</span>
                        <span
                          className={`text-xs font-bold ${
                            attendanceRate >= 80
                              ? 'text-emerald-400'
                              : attendanceRate >= 50
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {attendanceRate >= 80 ? 'Optimal' : attendanceRate >= 50 ? 'Sedang' : 'Rendah'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {onlineStaffCount} dari {totalStaffCount} Personel Hadir
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* KOTAK-KOTAK PRESENSI ANGGOTA PER POD (LEADER DI ATAS, MEMBER PERTAMA AKTIVASI BERIKUTNYA) */}
            <div className="space-y-6">
              {workspaces.map((ws: any, wsIdx: number) => {
                const podUsers = (cockpitData?.presenceMonitoring || []).filter(
                  (u: any) =>
                    u.role !== 'SUPER_ADMIN' &&
                    (u.workspaceId === ws.id || u.podName === ws.name),
                );

                const leaderUser = podUsers.find((u: any) => u.role === 'LEADER');
                const memberUsers = podUsers
                  .filter((u: any) => u.role !== 'LEADER')
                  .sort((a: any, b: any) => {
                    const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
                    const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
                    return timeA - timeB;
                  });

                const orderedUsers = leaderUser ? [leaderUser, ...memberUsers] : memberUsers;

                return (
                  <div
                    key={ws.id || wsIdx}
                    className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                  >
                    {/* Header Kotak Pod Presensi */}
                    <div className="bg-[#0F172A] border-b border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-md">
                          {wsIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {ws.isQuotaLocked ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Kuota Terkunci ({ws.assignedQuota} Personel)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Menunggu Aktivasi Leader</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Leader Terdaftar: <strong className="text-white">{ws.leaderName || 'Belum Terklaim'}</strong> • Total Anggota Aktif: <strong className="text-white">{orderedUsers.length}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:block hidden">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                          Struktur Tim Pod
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          1 Leader + {Math.max(0, (ws.assignedQuota || orderedUsers.length) - 1)} Member
                        </span>
                      </div>
                    </div>

                    {/* Tabel Presensi Pod */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="py-3 px-4">Personel &amp; Peran</th>
                            <th className="py-3 px-4">Kesiapan &amp; Beban Kerja</th>
                            <th className="py-3 px-4">Lamanya Waktu Online</th>
                            <th className="py-3 px-4">Catatan Disconnect &amp; Re-Login</th>
                            <th className="py-3 px-4 text-right">Riwayat Sesi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {orderedUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                                Belum ada personel yang teraktivasi di pod ini.
                              </td>
                            </tr>
                          ) : (
                            orderedUsers.map((user: any, uIdx: number) => {
                              const isLeader = user.role === 'LEADER';
                              return renderPresenceRow(
                                user,
                                isLeader ? (
                                  <span className="w-5 h-5 rounded bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0 text-center">
                                    #{uIdx}
                                  </span>
                                ),
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Detail Riwayat Sesi */}
            {selectedUserHistory && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Riwayat Login &amp; Logout: {selectedUserHistory.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Role: <strong className="text-white">{selectedUserHistory.role}</strong> &bull; Pod:{' '}
                        <strong className="text-white">{selectedUserHistory.podName}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUserHistory(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
                    >
                      ✕ Tutup
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {selectedUserHistory.sessionHistory?.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-6">
                        Belum ada riwayat sesi tercatat untuk pengguna ini.
                      </p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Waktu Login</th>
                            <th className="py-2.5 px-3">Waktu Logout</th>
                            <th className="py-2.5 px-3">Durasi</th>
                            <th className="py-2.5 px-3">Keterangan / Alasan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {selectedUserHistory.sessionHistory.map((s: any, idx: number) => (
                            <tr key={s.id || idx} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-mono text-[11px] text-white">
                                {new Date(s.loginAt).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px]">
                                {s.logoutAt ? new Date(s.logoutAt).toLocaleString() : (
                                  <span className="text-emerald-400 font-bold">Sedang Berlangsung</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-300">
                                {formatDuration(s.durationSeconds)}
                              </td>
                              <td className="py-2.5 px-3">
                                {s.logoutReason === 'BROWSER_CLOSED' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                                    Tutup Browser (Auto-Logout)
                                  </span>
                                ) : s.logoutReason === 'UNEXPECTED_DISCONNECT' ? (
                                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                                    Terputus Tanpa Sengaja
                                  </span>
                                ) : s.logoutReason === 'MANUAL_LOGOUT' ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                                    Logout Manual
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                    Sesi Aktif
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-[#0B0F19] text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUserHistory(null)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SINGLE-USE TOKEN AUDIT HUB (GROUPED PER POD: 1 LEADER ON TOP + MEMBERS BELOW) */}
        {activeTab === 'TOKENS' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Audit Token Sekali Pakai (Single-Use)</h2>
              <p className="text-xs text-slate-400">
                Token dikelompokkan per Pod. Posisi paling atas adalah Leader Pod, diikuti oleh daftar token Member di bawahnya.
              </p>
            </div>

            {workspaces.length === 0 && tokenAudit.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                Belum ada pod atau token yang tercatat di organisasi ini.
              </div>
            ) : (
              <div className="space-y-6">
                {workspaces.map((ws: any, wsIdx: number) => {
                  const podTokens = tokenAudit.filter(
                    (tok: any) => tok.workspaceId === ws.id || tok.podName === ws.name,
                  );
                  // Strict separation: 1 Leader on Top, Members below
                  const leaderTokens = podTokens.filter((t: any) => t.role === 'LEADER');
                  const rawMemberTokens = podTokens.filter((t: any) => t.role !== 'LEADER');

                  // Urutkan Member: Member yang pertama login/aktivasi diletakkan paling atas setelah Leader, diikuti berurutan
                  const memberTokens = [...rawMemberTokens].sort((a: any, b: any) => {
                    // 1. Member yang sudah login/aktivasi (isUsed) berada di atas
                    if (a.isUsed && !b.isUsed) return -1;
                    if (!a.isUsed && b.isUsed) return 1;

                    // 2. Urutan kronologis waktu aktivasi (usedAt paling awal di atas)
                    if (a.isUsed && b.isUsed) {
                      const timeA = a.usedAt ? new Date(a.usedAt).getTime() : 0;
                      const timeB = b.usedAt ? new Date(b.usedAt).getTime() : 0;
                      return timeA - timeB;
                    }

                    // 3. Token yang belum teraktivasi di paling bawah berurutan
                    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return createdA - createdB;
                  });

                  return (
                    <div
                      key={ws.id || wsIdx}
                      className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                      {/* Header Kotak Pod */}
                      <div className="bg-[#0F172A] border-b border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-md">
                            {wsIdx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {ws.isQuotaLocked ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Kuota Terkunci ({ws.assignedQuota} Personel)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Menunggu Aktivasi Leader</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Leader Terdaftar: <strong className="text-white">{ws.leaderName || 'Belum Terklaim'}</strong> • Total Token Diterbitkan: <strong className="text-white">{podTokens.length}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:block hidden">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Struktur Tim Pod
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            1 Leader + {Math.max(0, (ws.assignedQuota || podTokens.length) - 1)} Member
                          </span>
                        </div>
                      </div>

                      {/* Tabel Token Pod: 1 Leader Paling Atas, Member Di Bawahnya */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="py-2.5 px-4">Posisi &amp; Peran</th>
                              <th className="py-2.5 px-4">Token String</th>
                              <th className="py-2.5 px-4">Status Klaim</th>
                              <th className="py-2.5 px-4">Dikelola</th>
                              <th className="py-2.5 px-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {/* 1. POSISI PALING ATAS: LEADER POD */}
                            {leaderTokens.length === 0 ? (
                              <tr className="bg-amber-950/10">
                                <td colSpan={5} className="py-3 px-4 text-slate-500 italic text-center">
                                  Token Leader belum diterbitkan untuk pod ini.
                                </td>
                              </tr>
                            ) : (
                              leaderTokens.map((tok: any) => {
                                const isCopied = copiedToken === tok.token;
                                const isLeaderActive = tok.usedBy || ws.leaderName || ws.isQuotaLocked;
                                const isLeaderLoggedOut = isLeaderActive && !tok.isUserOnline;
                                const leaderNeedsRegen =
                                  isLeaderLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isLeaderFreshTokenReady =
                                  isLeaderLoggedOut && !leaderNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr
                                    key={tok.id}
                                    className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-b border-amber-500/30 hover:bg-amber-950/40 transition-colors"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center shrink-0 shadow">
                                          <Crown className="w-3.5 h-3.5" />
                                        </span>
                                        <div>
                                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                            LEADER (POSISI TERATAS)
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-amber-300 text-xs tracking-wider">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed || ws.isQuotaLocked || ws.leaderName ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>TERAKTIVASI</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                                          MENUNGGU AKTIVASI
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy || ws.leaderName ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-white">{tok.usedBy || ws.leaderName}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Leader Sedang Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">• (Logout)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>• (Logout Close Browser)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>• (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Menunggu Aktivasi</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyLink(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                            isCopied
                                              ? 'bg-emerald-600 border-emerald-500 text-white'
                                              : isLeaderFreshTokenReady
                                                ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-sm'
                                                : 'bg-[#0B0F19] border-amber-500/50 text-amber-200 hover:text-white hover:border-amber-400'
                                          }`}
                                          title={
                                            isLeaderFreshTokenReady
                                              ? 'Salin tautan aktivasi baru untuk dibagikan ke leader'
                                              : 'Salin tautan aktivasi leader'
                                          }
                                        >
                                          {isCopied ? 'Tersalin' : isLeaderFreshTokenReady ? 'Salin Link Baru' : 'Salin Link'}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={() => handleRegenerateToken(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            leaderNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isLeaderFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-amber-500/50 text-amber-300 hover:border-amber-400'
                                          }`}
                                          title={
                                            leaderNeedsRegen
                                              ? 'Leader sedang logout. Klik tombol merah ini terlebih dahulu untuk generate token baru agar leader bisa login kembali.'
                                              : isLeaderFreshTokenReady
                                                ? 'Token baru telah siap digunakan dan dapat dibagikan ke leader.'
                                                : 'Buat ulang token baru jika leader logout dan butuh link masuk kembali'
                                          }
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              leaderNeedsRegen
                                                ? 'text-white'
                                                : isLeaderFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-amber-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Proses...'
                                              : leaderNeedsRegen
                                                ? 'Regenerate'
                                                : isLeaderFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}

                            {/* 2. DAFTAR MEMBER DI BAWAH LEADER */}
                            {memberTokens.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                                  {ws.isQuotaLocked
                                    ? 'Belum ada token bawahan yang diterbitkan.'
                                    : 'Token bawahan akan otomatis terbit begitu Leader mengunci kuota dan mengaktivasi pod ini.'}
                                </td>
                              </tr>
                            ) : (
                              memberTokens.map((tok: any, mIdx: number) => {
                                const isCopied = copiedToken === tok.token;
                                const isMemberActive = Boolean(tok.usedBy) || tok.isUsed;
                                const isMemberLoggedOut = isMemberActive && !tok.isUserOnline;
                                const memberNeedsRegen =
                                  isMemberLoggedOut &&
                                  (tok.needsRegeneration !== undefined
                                    ? tok.needsRegeneration
                                    : tok.rawIsUsed !== undefined
                                      ? tok.rawIsUsed
                                      : true);
                                const isMemberFreshTokenReady =
                                  isMemberLoggedOut && !memberNeedsRegen && tok.rawIsUsed === false;

                                return (
                                  <tr key={tok.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2 pl-3">
                                        <span className="text-[10px] text-slate-500 font-mono">#{mIdx + 1}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                          MEMBER
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-blue-300">
                                      {tok.token}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.isUsed ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          <span>TERAKTIVASI</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                                          BELUM TERAKTIVASI
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {tok.usedBy ? (
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-white">{tok.usedBy}</span>
                                            {tok.isUserOnline ? (
                                              <span
                                                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                                title="Member Sedang Online"
                                              />
                                            ) : null}
                                          </div>
                                          {!tok.isUserOnline && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                              {tok.hadManualLogout ? (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span className="font-semibold">• (Logout)</span>
                                                </div>
                                              ) : tok.hadCloseBrowser ? (
                                                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                  <span>• (Logout Close Browser)</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                  <span>• (Offline)</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic">Menunggu Aktivasi</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyLink(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                            isCopied
                                              ? 'bg-emerald-600 border-emerald-500 text-white'
                                              : isMemberFreshTokenReady
                                                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-sm'
                                                : 'bg-[#0B0F19] border-slate-700 text-slate-300 hover:text-white'
                                          }`}
                                          title={
                                            isMemberFreshTokenReady
                                              ? 'Salin tautan aktivasi baru untuk dibagikan ke member'
                                              : 'Salin tautan aktivasi member'
                                          }
                                        >
                                          {isCopied ? 'Tersalin' : isMemberFreshTokenReady ? 'Salin Link Baru' : 'Salin Link'}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={regeneratingToken === tok.token}
                                          onClick={() => handleRegenerateToken(tok.token)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                                            memberNeedsRegen
                                              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-950/60 font-extrabold'
                                              : isMemberFreshTokenReady
                                                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/70 text-emerald-300'
                                                : 'bg-[#0B0F19] border-blue-500/40 text-blue-300 hover:border-blue-400'
                                          }`}
                                          title={
                                            memberNeedsRegen
                                              ? 'Member sedang logout. Klik tombol merah ini terlebih dahulu untuk generate token baru agar member bisa login kembali.'
                                              : isMemberFreshTokenReady
                                                ? 'Token baru telah siap digunakan dan dapat dibagikan ke member.'
                                                : 'Buat ulang token baru jika member logout dan butuh link masuk kembali'
                                          }
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 ${
                                              regeneratingToken === tok.token ? 'animate-spin' : ''
                                            } ${
                                              memberNeedsRegen
                                                ? 'text-white'
                                                : isMemberFreshTokenReady
                                                  ? 'text-emerald-400'
                                                  : 'text-blue-400'
                                            }`}
                                          />
                                          <span>
                                            {regeneratingToken === tok.token
                                              ? 'Proses...'
                                              : memberNeedsRegen
                                                ? 'Regenerate'
                                                : isMemberFreshTokenReady
                                                  ? 'Regenerated ✓'
                                                  : 'Regenerate'}
                                          </span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: CRISIS & SLA RADAR */}
        {activeTab === 'CRISIS' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Radar Krisis &amp; SLA Eskalasi</h2>
              <p className="text-xs text-slate-400">
                Tiket dengan tingkat urgensi CRITICAL yang dideteksi oleh AI serta tiket yang melampaui batas waktu respons SLA (&gt; 15 Menit).
              </p>
            </div>

            {crisisTickets.length === 0 && slaBreachedTickets.length === 0 ? (
              <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">Tidak Ada Krisis Aktif</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Seluruh pod beroperasi dalam ambang batas SLA normal tanpa ada eskalasi hukum atau darurat.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Tiket Prioritas Kritis (CRITICAL) */}
                {crisisTickets.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Eskalasi Krisis Tingkat Tinggi (AI Triage Detected)</span>
                    </h3>
                    <div className="space-y-3">
                      {crisisTickets.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl bg-red-950/30 border border-red-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-black text-red-400">
                                #{t.ticketNumber}
                              </span>
                              <span className="text-[10px] font-bold bg-red-900/60 text-red-200 px-2 py-0.5 rounded">
                                {t.priority}
                              </span>
                              <span className="text-xs text-slate-400">di {t.podName}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white">{t.title}</h4>
                          </div>
                          <Link
                            href="/dashboard"
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
                          >
                            Buka Tiket
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Tiket Pelanggaran Batas Waktu SLA (> 15 Menit) */}
                {slaBreachedTickets.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pelanggaran Batas Waktu SLA (&gt; 15 Menit Belum Direspons)</span>
                    </h3>
                    <div className="space-y-3">
                      {slaBreachedTickets.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/70 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-black text-amber-400">
                                #{t.ticketNumber}
                              </span>
                              <span className="text-[10px] font-bold bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded">
                                Terlambat {t.elapsedMinutes} Menit
                              </span>
                              <span className="text-xs text-slate-400">di {t.podName}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white">{t.title}</h4>
                          </div>
                          <Link
                            href="/dashboard"
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                          >
                            Buka Tiket
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] px-6 py-4 text-center text-xs text-slate-500">
        Sentirix Executive Governance &bull; Dynamic Multi-Pod Capacity Architecture
      </footer>
    </div>
  );
}
