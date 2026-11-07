'use client';

import React, { useState } from 'react';
import {
  Plus,
  Radio,
  Crown,
  LogOut,
  UserCheck,
  Users,
  TrendingUp,
  LayoutDashboard,
  WifiOff,
  Camera,
  Check,
  Globe,
} from 'lucide-react';
import { UserSession } from '../lib/auth';
import { WorkspaceData, PodInfo } from '../lib/types';

interface NavbarProps {
  onNewTicketClick: () => void;
  isConnected: boolean;
  user?: UserSession | null;
  onLogout?: () => void;
  workspace?: WorkspaceData | null;
  onOpenTeamModal?: () => void;
  activeAdminTab?: 'ANALYTICS' | 'HELPDESK';
  onSelectAdminTab?: (tab: 'ANALYTICS' | 'HELPDESK') => void;
  onOpenProfileModal?: () => void;
  pods?: PodInfo[];
  selectedPodId?: string;
  onSelectPod?: (podId: string) => void;
  onOpenCreatePodModal?: () => void;
  organizationName?: string;
  industry?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewTicketClick,
  isConnected,
  user,
  onLogout,
  workspace,
  onOpenTeamModal,
  activeAdminTab = 'ANALYTICS',
  onSelectAdminTab,
  onOpenProfileModal,
  pods,
  selectedPodId = 'ALL',
  onSelectPod,
  onOpenCreatePodModal,
  organizationName,
  industry,
}) => {
  const isSuperAdmin = user?.username?.toLowerCase() === 'pungkyrama' || (user?.role === 'ADMIN' && !(user as any)?.workspaceId);
  const isLeader =
    !isSuperAdmin &&
    (user?.role === 'LEADER' ||
      (user as any)?.workspaceRole === 'LEADER' ||
      workspace?.isLeader ||
      (!user?.isGuestMember && !!(user as any)?.workspaceId));
  const isAgent = !isSuperAdmin && !isLeader;
  const [copiedPortal, setCopiedPortal] = useState(false);

  const handleCopyPortal = () => {
    navigator.clipboard.writeText('http://localhost:3000/portal');
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2200);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-3 group">
          {/* Logo matching portal.jpg colors & style */}
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <img
              src="/logo_warna_s.png"
              alt="Sentirix Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">Sentirix</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EEF2FF] text-[#2563EB] px-2 py-0.5 rounded-full border border-[#C7D2FE]">
                AI COPILOT
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">
              AUTONOMOUS SUPPORT INTELLIGENCE
            </p>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Disconnection Warning Badge (Only visible if real-time connection is interrupted) */}
        {!isConnected && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold animate-pulse shadow-xs"
            title="Koneksi real-time terputus. Sistem sedang mencoba menyambungkan kembali..."
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Koneksi Terputus (Menyambungkan...)</span>
          </div>
        )}

        {/* New Ticket Button matching D:\1.png (Available for Helpdesk & Pod Personnel) */}
        {!isSuperAdmin && (
          <button
            onClick={onNewTicketClick}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Ticket</span>
          </button>
        )}

        {/* Share Customer Portal Link Button */}
        {!isSuperAdmin && (
          <button
            onClick={handleCopyPortal}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Salin tautan portal pengaduan untuk dibagikan ke pelanggan"
          >
            {copiedPortal ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Portal Link</span>
              </>
            )}
          </button>
        )}

        {/* Pod Leader Only: Team Link matching D:\1.png */}
        {isLeader && onOpenTeamModal && (
          <button
            onClick={onOpenTeamModal}
            className="flex items-center gap-2 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#2563EB] border border-[#C7D2FE] font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer group"
            title="Manage and distribute single-use team invite links for this pod"
          >
            <Users className="w-3.5 h-3.5 text-[#2563EB] group-hover:scale-105 transition-transform" />
            <span>Team Link</span>
            {workspace && (
              <span className="bg-[#2563EB] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {workspace.currentMembersCount}/{workspace.maxMembers}
              </span>
            )}
          </button>
        )}

        {/* Current Active Profile / Admin Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="relative group cursor-pointer focus:outline-hidden"
            title="Click to view profile and upload account photo"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center shadow-xs overflow-hidden border border-slate-200 group-hover:ring-2 group-hover:ring-[#2563EB] transition-all">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.avatarText || (user?.username ? user.username.slice(0, 2).toLowerCase() : 'ka')}
                </span>
              )}
            </div>
            {/* Camera badge on hover */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs border border-white">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenProfileModal}
            className="hidden md:block text-left cursor-pointer group"
            title="Click to open account profile settings"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
              <span>{user?.fullName || user?.username || 'User'}</span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                  <Crown className="w-3 h-3 text-amber-700" />
                  Founder
                </span>
              ) : isLeader ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                  <Crown className="w-3 h-3 text-amber-600" />
                  Team Leader
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#EEF2FF] text-[#2563EB] px-1.5 py-0.2 rounded border border-[#C7D2FE]">
                  <UserCheck className="w-3 h-3 text-[#2563EB]" />
                  Support Agent
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
              {isSuperAdmin
                ? 'Platform Owner & Webmaster'
                : isLeader
                  ? 'Support Pod Leader'
                  : 'Frontline Support Agent'}
            </p>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
