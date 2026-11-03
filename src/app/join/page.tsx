'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Headphones,
} from 'lucide-react';
import { validateWorkspaceInvite, joinWorkspace } from '../../lib/api';
import { setSession } from '../../lib/auth';
import { ValidateInviteResult } from '../../lib/types';

function JoinWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [fullName, setFullName] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidateInviteResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setValidationResult({
        valid: false,
        error: 'No invitation token was provided in the link. Please check your URL.',
      });
      return;
    }

    validateWorkspaceInvite(token)
      .then((res) => {
        setValidationResult(res);
      })
      .catch(() => {
        setValidationResult({
          valid: false,
          error: 'Unable to reach the Sentrix server to validate this invite.',
        });
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await joinWorkspace(token, fullName.trim());
    setIsSubmitting(false);

    if (res.success && res.user) {
      // Store session in localStorage
      setSession(res.user);
      // Seamless redirect into dashboard
      window.location.href = '/dashboard';
    } else {
      setErrorMessage(res.error || 'Failed to join workspace. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-radial from-indigo-900/30 via-slate-950/60 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-[#0e183c] flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <img src="/dark.jpg" alt="Sentrix Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">Sentrix</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 ml-2">
              Enterprise Support
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>One-Click Team Onboarding</span>
        </div>
      </header>

      {/* Center Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-6 py-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {isValidating ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-300 font-medium">Validating workspace invite...</p>
              <p className="text-xs text-slate-500">Checking seat availability and team permissions</p>
            </div>
          ) : !validationResult?.valid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white">Invitation Unavailable</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {validationResult?.error ||
                  'This workspace link is either invalid, expired, or all 8 seats are already occupied.'}
              </p>
              <div className="pt-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Return to Homepage
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Workspace Badge & Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Support Team Invitation</span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white pt-1">
                  Join Support Workspace
                </h1>

                <p className="text-xs text-slate-300 leading-relaxed">
                  You’ve been invited by{' '}
                  <span className="font-bold text-white underline decoration-indigo-400">
                    {validationResult.ownerName || 'the workspace owner'}
                  </span>{' '}
                  to collaborate on tickets with real-time AI triage.
                </p>
              </div>

              {/* Seats Info Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Available Seats</span>
                </div>
                <span className="font-bold text-emerald-400">
                  {validationResult.remainingSeats} of {validationResult.maxMembers || 8} Seats Open
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Fast Join Form (Name Only) */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Sarah Vance (Support Tier 1)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    No password or email registration required. Your workspace session will be
                    instantly activated.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Entering Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Workspace as Support Agent</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" /> Isolated Agent Session
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant Collision Sync
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Sentrix Enterprise. All rights reserved.
      </footer>
    </div>
  );
}

export default function JoinWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinWorkspaceContent />
    </Suspense>
  );
}
