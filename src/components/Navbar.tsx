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
  LifeBuoy,
  ExternalLink,
  Camera,
  Layers,
  ChevronDown,
  Check,
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
  const isAdmin = user?.role === 'ADMIN' || user?.username?.toLowerCase() === 'pungkyrama';
  const isGuestMember = !!(user as any)?.isGuestMember || !!(user as any)?.workspaceId;
  const [isPodDropdownOpen, setIsPodDropdownOpen] = useState(false);
  const activePod = pods?.find((p) => p.id === selectedPodId);

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
                ENTERPRISE AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Autonomous Support & Copilot Hub</p>
          </div>
        </a>

        {/* Enterprise Multi-Pod Switcher */}
        {pods && pods.length > 0 && !isAdmin && (
          <div className="relative ml-2 sm:ml-4">
            <button
              type="button"
              onClick={() => setIsPodDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {selectedPodId === 'ALL'
                  ? 'All Pods'
                  : activePod?.name || 'Select Pod'}
              </span>
              {activePod && activePod.openTicketsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {activePod.openTicketsCount}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPodDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsPodDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Operational Pods</span>
                    {industry && (
                      <span className="font-mono text-indigo-600 font-semibold lowercase">
                        {industry}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPod?.('ALL');
                      setIsPodDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedPodId === 'ALL'
                        ? 'font-bold text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>All Organization Pods</span>
                    </div>
                    {selectedPodId === 'ALL' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {pods.map((p) => {
                      const isSelected = selectedPodId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectPod?.(p.id);
                            setIsPodDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isSelected
                              ? 'font-bold text-indigo-600 bg-indigo-50/50'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                p.isCatchAll ? 'bg-amber-400' : 'bg-indigo-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="truncate text-slate-800">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {p.currentMembersCount}/{p.maxMembers} seats
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.openTicketsCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                {p.openTicketsCount}
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {onOpenCreatePodModal && (
                    <div className="pt-1.5 mt-1 border-t border-slate-100 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPodDropdownOpen(false);
                          onOpenCreatePodModal();
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Pod...</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Real-time WebSocket Status matching dashboard.jpg */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs shadow-2xs">
          <Radio
            className={`w-3.5 h-3.5 ${isConnected ? 'text-[#059669] animate-pulse' : 'text-amber-500'}`}
          />
          <span className="font-semibold text-[#065F46]">
            {isConnected ? 'Real-Time Sync: Active' : 'WebSocket: Local Mode'}
          </span>
        </div>

        {/* Public Inbound Portal Shortcut matching dashboard.jpg */}
        <a
          href="/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#2563EB] text-xs font-semibold shadow-2xs transition-colors"
          title="Open public customer portal to simulate inbound ticket submissions"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Customer Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* New Ticket Button matching dashboard.jpg */}
        {!isGuestMember && (
          <button
            onClick={onNewTicketClick}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Ticket</span>
          </button>
        )}

        {/* Regular User Only: Team Link matching dashboard.jpg */}
        {!isAdmin && !isGuestMember && onOpenTeamModal && (
          <button
            onClick={onOpenTeamModal}
            className="flex items-center gap-2 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#2563EB] border border-[#C7D2FE] font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer group"
            title="Invite team members to this workspace"
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

        {/* Current Active Profile / Admin Badge matching dashboard.jpg */}
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
              <span>{user?.username || 'karimkarim'}</span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                  <Crown className="w-3 h-3 text-amber-700" />
                  Founder
                </span>
              ) : isGuestMember ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                  <UserCheck className="w-3 h-3 text-[#059669]" />
                  Support Agent
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                  <UserCheck className="w-3 h-3 text-[#059669]" />
                  Team Leader
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
              {isAdmin
                ? 'Platform Owner & Webmaster'
                : isGuestMember
                  ? 'Frontline Support Agent'
                  : 'Support Pod Leader'}
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
