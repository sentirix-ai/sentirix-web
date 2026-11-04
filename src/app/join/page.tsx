'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Headphones,
  Check,
  Copy,
  MessageCircle,
  Crown,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  fetchLeaderTokenStatus,
  lockLeaderQuota,
  fetchAgentTokenStatus,
  claimAgentToken,
  validateWorkspaceInvite,
  joinWorkspace,
  regenerateToken,
} from '../../lib/api';
import { setSession } from '../../lib/auth';

function JoinWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [isLoading, setIsLoading] = useState(true);
  const [tokenType, setTokenType] = useState<'LEADER' | 'AGENT' | 'LEGACY'>('LEGACY');
  const [tokenData, setTokenData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSubordinates, setSelectedSubordinates] = useState<number>(1);
  const [isQuotaLocked, setIsQuotaLocked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state for Leader
  const [leaderLockedResult, setLeaderLockedResult] = useState<{
    workspaceName: string;
    assignedQuota: number;
    agentTokens: Array<{ token: string; joinUrl: string }>;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regeneratingToken, setRegeneratingToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Token undangan tidak ditemukan pada URL ini.');
      return;
    }

    const inspectToken = async () => {
      setIsLoading(false);
      setErrorMessage(null);

      if (token.startsWith('STX-LDR-')) {
        setTokenType('LEADER');
        const res = await fetchLeaderTokenStatus(token);
        if (!res.valid) {
          setErrorMessage(res.error || 'Token Leader tidak valid atau sudah kadaluwarsa.');
        } else {
          setTokenData(res);
          if (res.workspace?.isQuotaLocked) {
            setIsQuotaLocked(true);
            if (res.workspace.assignedQuota > 1) {
              setSelectedSubordinates(res.workspace.assignedQuota - 1);
            }
          } else if (res.quotaStats?.allowedOptions?.length > 0) {
            setSelectedSubordinates(
              res.quotaStats.allowedOptions[res.quotaStats.allowedOptions.length - 1],
            );
          }
        }
      } else if (token.startsWith('STX-AGT-')) {
        setTokenType('AGENT');
        const res = await fetchAgentTokenStatus(token);
        if (!res.valid) {
          setErrorMessage(res.error || 'Token Agen tidak valid atau sudah digunakan.');
        } else {
          setTokenData(res);
        }
      } else {
        // Fallback for legacy invite link
        setTokenType('LEGACY');
        try {
          const res = await validateWorkspaceInvite(token);
          if (!res.valid) {
            setErrorMessage(res.error || 'Link undangan tidak valid.');
          } else {
            setTokenData(res);
          }
        } catch {
          setErrorMessage('Gagal menghubungi server untuk memvalidasi token.');
        }
      }
    };

    inspectToken();
  }, [token]);

  // Handle Leader Quota Locking (Click [✓ Kunci Kuota Pod])
  const handleLockLeaderQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Mohon isi nama lengkap Anda (minimal 2 karakter).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const maxAllowed = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
      const safeSubordinates = Math.min(Number(selectedSubordinates) || 1, maxAllowed);

      const res = await lockLeaderQuota({
        token,
        fullName: fullName.trim(),
        password: password.trim() || undefined,
        chosenSubordinates: safeSubordinates,
      });

      if (!res.success) {
        setFormError(res.error || 'Gagal mengunci kuota pod.');
        return;
      }

      // Store leader session
      if (res.leader) {
        setSession({
          id: res.leader.id,
          username: res.leader.username,
          fullName: res.leader.fullName,
          email: res.leader.email,
          role: 'ADMIN',
          isVerified: true,
          avatarText: res.leader.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
        });
      }

      setLeaderLockedResult({
        workspaceName: res.workspace?.name || tokenData?.workspace?.name,
        assignedQuota: res.workspace?.assignedQuota || selectedSubordinates + 1,
        agentTokens: res.agentTokens || [],
      });
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Agent Joining
  const handleJoinAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Mohon isi nama lengkap Anda (minimal 2 karakter).');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await claimAgentToken({
        token,
        fullName: fullName.trim(),
        password: password.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengklaim token agen.');
        return;
      }

      if (res.user) {
        setSession({
          id: res.user.id,
          username: res.user.username,
          fullName: res.user.fullName,
          email: res.user.email,
          role: 'USER',
          isVerified: true,
          avatarText: res.user.fullName.slice(0, 2).toUpperCase(),
          onboardingCompleted: true,
        });
      }

      window.location.href = '/dashboard';
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat bergabung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Legacy Link
  const handleJoinLegacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Mohon isi nama lengkap Anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await joinWorkspace(token, fullName.trim());
      if (res.success && res.user) {
        setSession(res.user);
        window.location.href = '/dashboard';
      } else {
        setErrorMessage(res.error || 'Gagal bergabung.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAgentToken = (tok: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRegenerateAgentToken = async (oldTok: string) => {
    try {
      setRegeneratingToken(oldTok);
      const res = await regenerateToken(oldTok);
      if (res.success && res.newToken) {
        setLeaderLockedResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            agentTokens: prev.agentTokens.map((t) =>
              t.token === oldTok
                ? { token: res.newToken!, joinUrl: res.joinUrl! }
                : t,
            ),
          };
        });
      } else {
        setErrorMessage(res.error || 'Gagal meregenerate token bawahan.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setRegeneratingToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-[#111827] flex items-center justify-center shadow-lg">
            <img src="/logo_warna_s.png" alt="Sentirix Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Sentirix</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 ml-2">
              {tokenType === 'LEADER' ? 'LEADER ACTIVATION' : 'TEAM ONBOARDING'}
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Single-Use Token Security</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="p-8 text-center bg-[#111827] border border-slate-800 rounded-2xl">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs text-slate-400">Memvalidasi token aktivasi...</span>
          </div>
        ) : errorMessage ? (
          <div className="p-8 bg-[#111827] border border-red-800/80 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-950 text-red-400 flex items-center justify-center mx-auto border border-red-800">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Akses Token Ditolak</h2>
            <p className="text-xs text-red-300 leading-relaxed max-w-md mx-auto">{errorMessage}</p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setFormError(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Pemilihan Token &amp; Kuota</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all font-semibold"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : tokenType === 'LEADER' && leaderLockedResult ? (
          /* LEADER SUCCESS SCREEN AFTER CLICKING CHECKMARK [✓] */
          <div className="p-8 bg-[#111827] border border-emerald-500/40 rounded-2xl shadow-2xl space-y-6 animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                ● STATUS: KUOTA TERKUNCI PERMANEN
              </span>
              <h1 className="text-xl font-black text-white">
                Pod &amp; Kuota Berhasil Diaktifkan!
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Anda resmi memimpin <strong>{leaderLockedResult.workspaceName}</strong> dengan total kapasitas{' '}
                <strong>{leaderLockedResult.assignedQuota} personel</strong> (1 Anda sebagai Leader +{' '}
                {leaderLockedResult.agentTokens.length} Agen).
              </p>
            </div>

            {/* Generated Single-Use Agent Tokens */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Bagikan {leaderLockedResult.agentTokens.length} Token Single-Use ke Bawahan Anda:</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderLockedResult.agentTokens.map((agt, idx) => {
                  const isCopied = copiedToken === agt.token;
                  const waText = encodeURIComponent(
                    `Halo, silakan bergabung ke tim saya di ${leaderLockedResult.workspaceName} Sentirix melalui tautan resmi ini: ${agt.joinUrl}`,
                  );
                  return (
                    <div
                      key={agt.token}
                      className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-blue-300 font-bold">{agt.token}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyAgentToken(agt.token, agt.joinUrl)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                            isCopied
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-[#111827] border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isCopied ? 'Tersalin' : 'Salin'}
                        </button>
                        <a
                          href={`https://wa.me/?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                        >
                          WA
                        </a>
                        <button
                          type="button"
                          disabled={regeneratingToken === agt.token}
                          onClick={() => handleRegenerateAgentToken(agt.token)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#111827] border border-blue-500/40 text-blue-300 hover:border-blue-400 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Buat ulang token untuk slot bawahan ini jika link hilang"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              regeneratingToken === agt.token ? 'animate-spin text-blue-400' : ''
                            }`}
                          />
                          <span>{regeneratingToken === agt.token ? 'Proses...' : 'Regenerate'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>Masuk ke Workspace Tiket Pod Anda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : tokenType === 'LEADER' ? (
          /* LEADER ACTIVATION & CAPACITY SELECTION FORM */
          <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold mb-3 mx-auto">
                <span>Undangan Kepemimpinan Pod (Single-Use Token)</span>
              </div>
              <h1 className="text-xl font-black text-white">
                Aktivasi Leader: {tokenData?.workspace?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Organisasi: <strong className="text-white">{tokenData?.organization?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleLockLeaderQuota} className="space-y-5">
              {/* Form Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2.5 shadow-lg shadow-red-950/40 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Leader Profile Details */}
              <div className="space-y-4 p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Langkah 1: Lengkapi Akun Leader Anda
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Anda <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Ahmad Dahlan"
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Interconnected Quota Allocation Box with Dropdown + [✓] Checkmark button */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Langkah 2: Tentukan Kuota Bawahan Pod Anda
                  </span>
                </div>

                {/* Quota Stats Overview */}
                <div className="p-3 rounded-lg bg-[#111827] border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Kuota Organisasi:</span>
                    <strong className="text-white">{tokenData?.quotaStats?.totalSeats} Orang</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Telah Dikunci Pod Lain:</span>
                    <strong className="text-amber-400">{tokenData?.quotaStats?.lockedSeats} Orang</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-blue-300">
                    <span>Maksimal Tersedia untuk Pod Anda:</span>
                    <strong className="text-emerald-400">
                      {tokenData?.quotaStats?.maxSubordinatesAllowed} Bawahan (+ 1 Leader)
                    </strong>
                  </div>
                </div>

                {/* Highlighted Maximum Quota Callout */}
                <div className="p-3 rounded-xl bg-blue-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-300">Batas Maksimal Kuota Pod:</span>
                  </div>
                  <span className="font-mono font-black text-cyan-300 bg-blue-900/90 px-2.5 py-1 rounded-lg border border-cyan-400/40 text-xs">
                    Maksimal {tokenData?.quotaStats?.maxSubordinatesAllowed || 1} Bawahan (+ 1 Leader)
                  </span>
                </div>

                {/* Dropdown Selection & Checkmark Locking Button */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>Pilih Jumlah Anggota Bawahan:</span>
                    {tokenData?.quotaStats?.isLastPod ? (
                      <span className="text-[11px] text-amber-400 font-bold">
                        (Pod Terakhir: Hanya 1 Pilihan Kuota Maksimal Tersedia)
                      </span>
                    ) : (
                      <span className="text-[11px] text-cyan-400 font-medium">
                        (Tersedia: 1 s.d. {tokenData?.quotaStats?.maxSubordinatesAllowed || 1} orang)
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        disabled={isQuotaLocked}
                        value={selectedSubordinates}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const max = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
                          if (val > max) {
                            setFormError(`Jumlah kuota terlalu banyak. Maksimal yang bisa dipilih adalah ${max} orang.`);
                          } else {
                            if (formError) setFormError(null);
                            setSelectedSubordinates(val);
                          }
                        }}
                        className={`w-full ${
                          isQuotaLocked
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-[#111827] border-2 border-blue-500 text-white'
                        } font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-80`}
                      >
                        {tokenData?.quotaStats?.allowedOptions?.map((num: number) => (
                          <option key={num} value={num} className="bg-[#111827] text-white">
                            {num} Orang Bawahan (+ 1 Anda sebagai Leader = {num + 1} Orang)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const max = tokenData?.quotaStats?.maxSubordinatesAllowed || 7;
                        if (selectedSubordinates > max) {
                          setFormError(`Jumlah kuota terlalu banyak. Maksimal yang bisa dipilih adalah ${max} orang.`);
                          return;
                        }
                        setFormError(null);
                        setIsQuotaLocked(!isQuotaLocked);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 ${
                        isQuotaLocked
                          ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isQuotaLocked ? 'Kuota Terkunci' : 'Kunci Kuota'}</span>
                    </button>
                  </div>
                  {tokenData?.quotaStats?.isLastPod ? (
                    <p className="text-[10px] text-amber-300 mt-2 font-medium bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 leading-relaxed">
                      *Karena pod lain telah mengunci kuota, maka pod terakhir ini otomatis hanya menyisakan tepat 1 pilihan kuota maksimal ({tokenData?.quotaStats?.maxSubordinatesAllowed} bawahan + 1 leader = {tokenData?.quotaStats?.maxSubordinatesAllowed + 1} orang) agar seluruh kapasitas organisasi terisi pas 100%.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-2">
                      *Pilihan dropdown dibatasi maksimal {tokenData?.quotaStats?.maxSubordinatesAllowed} orang agar alokasi kuota antar-pod pas 100%. Setelah kuota dikunci dan data lengkap, klik tombol aktivasi di bawah untuk melanjutkan.
                    </p>
                  )}
                </div>
              </div>

              {/* Main Submit Button at bottom */}
              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !isQuotaLocked}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengaktivasi Akun & Menyiapkan Token...</span>
                  </div>
                ) : (
                  <>
                    <span>Aktivasi Link dan Lanjutkan Langkah Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : tokenType === 'AGENT' ? (
          /* AGENT ACTIVATION FORM */
          <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-[11px] font-bold mb-3">
                <Users className="w-3.5 h-3.5" />
                <span>Undangan Anggota Pod Frontline (Single-Use Token)</span>
              </div>
              <h1 className="text-xl font-black text-white">
                Bergabung ke {tokenData?.workspace?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Organisasi: <strong className="text-white">{tokenData?.organization?.name}</strong> • Leader:{' '}
                <strong className="text-white">{tokenData?.leaderName}</strong>
              </p>
            </div>

            <form onSubmit={handleJoinAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Anda <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Akun (Opsional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Mengaktifkan Akun Agen...</span>
                ) : (
                  <>
                    <span>Gabung &amp; Buka Workspace Tiket Pod</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* LEGACY JOIN FORM */
          <div className="p-6 sm:p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white">Gabung ke Tim</h1>
              <p className="text-xs text-slate-400 mt-1">
                Workspace: <strong className="text-white">{tokenData?.workspaceName}</strong>
              </p>
            </div>
            <form onSubmit={handleJoinLegacy} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Gabung
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center text-[11px] text-slate-500">
        Sentirix AI-Powered Multi-Pod Operations • Amazon Two-Pizza Quota Architecture
      </footer>
    </div>
  );
}

export default function JoinWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-xs">
          Loading invitation...
        </div>
      }
    >
      <JoinWorkspaceContent />
    </Suspense>
  );
}
