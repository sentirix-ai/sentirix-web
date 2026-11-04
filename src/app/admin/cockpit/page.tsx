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
} from 'lucide-react';
import { getSession, logoutUser, UserSession } from '../../../lib/auth';
import { fetchSuperAdminCockpit, regenerateToken } from '../../../lib/api';

export default function SuperAdminCockpitPage() {
  const router = useRouter();

  const [session, setLocalSession] = useState<UserSession | null>(null);
  const [cockpitData, setCockpitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TOKENS' | 'CRISIS'>('OVERVIEW');

  const loadData = async (activeUser: UserSession) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSuperAdminCockpit(activeUser.username);
      if (!data) {
        setErrorMessage('Gagal memuat data cockpit organisasi. Pastikan Anda telah menyelesaikan setup organisasi.');
      } else {
        setCockpitData(data);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memuat data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const active = getSession();
    if (!active) {
      router.push('/');
      return;
    }
    setLocalSession(active);
    loadData(active);
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

  const handleLogout = () => {
    logoutUser();
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Titanium Navbar */}
      <header className="border-b border-slate-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-center shadow-md">
              <img src="/logo_warna_s.png" alt="Sentirix" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">Sentirix</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                  EXECUTIVE COCKPIT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {org.name || 'Enterprise Organization'} • Sektor: {org.industry || 'General'}
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
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Antrean Helpdesk</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </Link>

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
              <span className="text-xs text-slate-400">/ {stats.totalSeats || 20} Kursi Terpakai</span>
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
              <span className="text-2xl font-black text-white">99.2%</span>
              <span className="text-xs text-emerald-400 font-bold">Optimal</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Batas Waktu Respons: &lt; 15 Menit
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
            { id: 'TOKENS', label: 'Audit Token Sekali Pakai', icon: ShieldCheck, count: tokenAudit.length },
            { id: 'CRISIS', label: 'Radar Krisis & SLA', icon: AlertTriangle, count: stats.crisisCount },
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
                      <h3 className="text-sm font-extrabold text-white">{ws.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Leader:{' '}
                        <strong className={ws.leaderName ? 'text-white' : 'text-slate-500 italic'}>
                          {ws.leaderName || 'Belum Mengklaim Token'}
                        </strong>
                      </p>
                    </div>

                    {/* Services Tags */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                        Layanan yang Ditangani:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ws.services?.map((svc: string) => (
                          <span
                            key={svc}
                            className="text-[10px] bg-[#0B0F19] text-blue-300 px-2 py-0.5 rounded border border-slate-800 font-medium"
                          >
                            {svc}
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

        {/* TAB 2: SINGLE-USE TOKEN AUDIT HUB */}
        {activeTab === 'TOKENS' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Hub Audit Token Sekali Pakai (Single-Use)</h2>
              <p className="text-xs text-slate-400">
                Setiap token dibuat secara unik dan otomatis kadaluwarsa segera setelah diklaim oleh pengguna.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Token String</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Pod Tujuan</th>
                      <th className="py-3 px-4">Status Klaim</th>
                      <th className="py-3 px-4">Dikelola / Diklaim Oleh</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {tokenAudit.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Belum ada token yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      tokenAudit.map((tok: any) => {
                        const isCopied = copiedToken === tok.token;
                        return (
                          <tr key={tok.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-300">
                              {tok.token}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  tok.role === 'LEADER'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}
                              >
                                {tok.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">{tok.podName}</td>
                            <td className="py-3 px-4">
                              {tok.isUsed ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                  SUDAH DIKLAIM
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                  AKTIF (UNCLAIMED)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {tok.usedBy ? (
                                <span className="font-semibold text-white">{tok.usedBy}</span>
                              ) : (
                                <span className="text-slate-500 italic">Menunggu Aktivasi</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!tok.isUsed && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(tok.token)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                      isCopied
                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                        : 'bg-[#0B0F19] border-slate-700 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    {isCopied ? 'Tersalin' : 'Salin Link'}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={regeneratingToken === tok.token}
                                    onClick={() => handleRegenerateToken(tok.token)}
                                    className="px-2.5 py-1 rounded text-[11px] font-bold border bg-[#0B0F19] border-blue-500/40 text-blue-300 hover:border-blue-400 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                    title="Buat ulang token ini jika penerima membutuhkan link baru"
                                  >
                                    <RefreshCw
                                      className={`w-3 h-3 ${
                                        regeneratingToken === tok.token ? 'animate-spin text-blue-400' : ''
                                      }`}
                                    />
                                    <span>{regeneratingToken === tok.token ? 'Proses...' : 'Regenerate'}</span>
                                  </button>
                                </div>
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
          </section>
        )}

        {/* TAB 3: CRISIS RADAR */}
        {activeTab === 'CRISIS' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Radar Krisis &amp; Eskalasi Tingkat Tinggi</h2>
              <p className="text-xs text-slate-400">
                Tiket dengan tingkat urgensi CRITICAL atau sentimen negatif tinggi yang terdeteksi oleh AI.
              </p>
            </div>

            {crisisTickets.length === 0 ? (
              <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">Tidak Ada Krisis Aktif</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Seluruh pod beroperasi dalam ambang batas SLA normal tanpa ada eskalasi hukum atau darurat.
                </p>
              </div>
            ) : (
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
