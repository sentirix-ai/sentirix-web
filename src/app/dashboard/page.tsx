'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Ticket,
  Message,
  TicketStatus,
  WorkspaceData,
  OwnerAnalyticsData,
  PodInfo,
} from '../../lib/types';
import {
  fetchTickets,
  fetchMessages,
  createTicket,
  createMessage,
  updateTicketStatus,
  fetchMyWorkspace,
  purgeWorkspaceOnLogout,
  checkMemberStatus,
  memberLogout,
  fetchOwnerAnalytics,
  fetchOrganizationPods,
} from '../../lib/api';
import { getSession, logoutUser, UserSession } from '../../lib/auth';
import { Navbar } from '../../components/Navbar';
import { TicketQueue } from '../../components/TicketQueue';
import { TicketDetail } from '../../components/TicketDetail';
import { AiCopilotSidebar } from '../../components/AiCopilotSidebar';
import { NewTicketModal } from '../../components/NewTicketModal';
import { TeamInviteModal } from '../../components/TeamInviteModal';
import { OwnerAnalyticsView } from '../../components/OwnerAnalyticsView';
import { AdminCockpitView } from '../../components/AdminCockpitView';
import { ProfileModal } from '../../components/ProfileModal';
import { CreatePodModal } from '../../components/CreatePodModal';
import { TransferPodModal } from '../../components/TransferPodModal';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [composerText, setComposerText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [collisionAgent, setCollisionAgent] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreatePodModalOpen, setIsCreatePodModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'ANALYTICS' | 'HELPDESK'>('ANALYTICS');
  const [ownerAnalytics, setOwnerAnalytics] = useState<OwnerAnalyticsData | null>(null);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);

  // Multi-Pod Enterprise State
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [selectedPodId, setSelectedPodId] = useState<string>('ALL');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const socketRef = React.useRef<Socket | null>(null);

  const handleProfileUpdated = (updatedUser: UserSession) => {
    setUser(updatedUser);
  };

  const loadAnalytics = useCallback(async () => {
    setIsRefreshingAnalytics(true);
    const data = await fetchOwnerAnalytics('pungkyrama');
    if (data) setOwnerAnalytics(data);
    setIsRefreshingAnalytics(false);
  }, []);

  // Check Auth Session
  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = '/';
      return;
    }

    const isAdmin = session.role === 'ADMIN' || session.username.toLowerCase() === 'pungkyrama';
    const isGuest = !!session.isGuestMember || !!(session as any).workspaceId;

    // If regular user has not yet completed onboarding, redirect to /onboarding
    if (!isAdmin && !isGuest && !session.onboardingCompleted) {
      router.push('/onboarding');
      return;
    }

    // If this is an invited guest member, verify that their session hasn't been purged
    const guestUser = session as any;
    if (guestUser.workspaceId && guestUser.id) {
      checkMemberStatus(guestUser.id).then((isActive) => {
        if (!isActive) {
          alert('The workspace owner has logged out. Your temporary agent session has ended.');
          logoutUser();
          window.location.href = '/';
        }
      });
    }

    setUser(session);

    // If Platform Owner (@pungkyrama), load owner analytics
    if (isAdmin) {
      loadAnalytics();
    }

    // Load Workspace & Multi-Pod setup for regular users
    if (!isAdmin && !guestUser.workspaceId) {
      fetchMyWorkspace(session.username).then((ws) => {
        if (ws) setWorkspace(ws);
      });
      fetchOrganizationPods(session.username).then((res) => {
        if (res) {
          setPods(res.pods || []);
          setOrganizationName(res.organizationName);
          setIndustry(res.industry);
        }
      });
    }
  }, [router, loadAnalytics]);

  // Load Tickets (Filtered by Status, Search, and Selected Pod)
  const loadTickets = useCallback(async () => {
    const isMember = !!(user as any)?.isGuestMember || !!(user as any)?.workspaceId;
    const data = await fetchTickets(statusFilter, searchQuery, isMember, selectedPodId);
    const filtered = isMember
      ? data.filter(
          (t) =>
            t.ticketNumber !== 1003 &&
            !t.tags?.includes('vip-escalation') &&
            !t.title.toLowerCase().includes('vip escalation') &&
            !t.title.toLowerCase().includes('saml sso') &&
            !t.title.toLowerCase().includes('okta'),
        )
      : data;

    setTickets(filtered);
    if (!selectedTicket && filtered.length > 0) {
      setSelectedTicket(filtered[0]);
    } else if (
      selectedTicket &&
      isMember &&
      (selectedTicket.ticketNumber === 1003 ||
        selectedTicket.tags?.includes('vip-escalation') ||
        selectedTicket.title.toLowerCase().includes('vip escalation') ||
        selectedTicket.title.toLowerCase().includes('saml sso') ||
        selectedTicket.title.toLowerCase().includes('okta'))
    ) {
      setSelectedTicket(filtered[0] || null);
    }
  }, [statusFilter, searchQuery, selectedTicket, user]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Load Messages when Selected Ticket Changes
  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id).then(setMessages);
      setCollisionAgent(null);
    }
  }, [selectedTicket]);

  // Single Persistent WebSocket Connection on Mount
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Listen for newly created tickets
      socket.on('ticket:created', (newTicket: Ticket) => {
        setTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)]);
      });

      // Listen for ticket updates
      socket.on('ticket:updated', (updatedTicket: Ticket) => {
        setTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)),
        );
        setSelectedTicket((prev) => (prev?.id === updatedTicket.id ? { ...prev, ...updatedTicket } : prev));
      });

      // Listen for cross-pod ticket transfer
      socket.on(
        'ticket:transferred',
        (payload: {
          ticket: Ticket;
          previousPodId?: string;
          targetPodId: string;
          targetPodName: string;
        }) => {
          setTickets((prev) =>
            prev.map((t) => (t.id === payload.ticket.id ? { ...t, ...payload.ticket } : t)),
          );
          setSelectedTicket((prev) =>
            prev?.id === payload.ticket.id ? { ...prev, ...payload.ticket } : prev,
          );
          if (user?.username) {
            fetchOrganizationPods(user.username).then((res) => {
              if (res?.pods) setPods(res.pods);
            });
          }
        },
      );

      // Listen for new messages
      socket.on('message:new', (newMsg: Message) => {
        setSelectedTicket((current) => {
          if (current && newMsg.ticketId === current.id) {
            setMessages((prev) => [...prev.filter((m) => m.id !== newMsg.id), newMsg]);
          }
          return current;
        });
      });

      // Listen for collision warnings
      socket.on('agent:viewing_alert', (payload: { ticketId: string; agentName: string }) => {
        setSelectedTicket((current) => {
          if (current && payload.ticketId === current.id) {
            setCollisionAgent(payload.agentName);
            setTimeout(() => setCollisionAgent(null), 8000);
          }
          return current;
        });
      });

      // Listen for real-time team member left / logged out (Requirement 2)
      socket.on('team:member_left', () => {
        const session = getSession();
        if (session && !((session as any).workspaceId) && session.role !== 'ADMIN' && session.username.toLowerCase() !== 'pungkyrama') {
          fetchMyWorkspace(session.username).then((ws) => {
            if (ws) setWorkspace(ws);
          });
        }
      });

      // Listen for real-time team member joined
      socket.on('team:member_joined', () => {
        const session = getSession();
        if (session && session.role !== 'ADMIN' && session.username.toLowerCase() !== 'pungkyrama') {
          fetchMyWorkspace(session.username).then((ws) => {
            if (ws) setWorkspace(ws);
          });
        }
      });

      // Listen for real-time team member removed
      socket.on('team:member_removed', () => {
        const session = getSession();
        if (session && session.role !== 'ADMIN' && session.username.toLowerCase() !== 'pungkyrama') {
          fetchMyWorkspace(session.username).then((ws) => {
            if (ws) setWorkspace(ws);
          });
        }
      });

      // Listen for workspace link regenerated
      socket.on('team:workspace_updated', () => {
        const session = getSession();
        if (session && session.role !== 'ADMIN' && session.username.toLowerCase() !== 'pungkyrama') {
          fetchMyWorkspace(session.username).then((ws) => {
            if (ws) setWorkspace(ws);
          });
        }
      });

      // Listen for workspace purged on owner logout
      socket.on('team:workspace_purged', (payload: { workspaceId: string }) => {
        const session = getSession();
        if (session) {
          const guest = session as any;
          if (guest.workspaceId === payload.workspaceId) {
            alert('The workspace owner has logged out. Your temporary agent session has ended.');
            logoutUser();
            window.location.href = '/';
          }
        }
      });
    } catch {
      setIsConnected(false);
    }

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join Room when Selected Ticket changes using the same persistent socket
  useEffect(() => {
    const socket = socketRef.current;
    if (selectedTicket && socket && isConnected) {
      socket.emit('ticket:join', selectedTicket.id);
      socket.emit('agent:viewing', {
        ticketId: selectedTicket.id,
        agentName: user?.username || 'Agent Specialist',
      });
      return () => {
        socket.emit('ticket:leave', selectedTicket.id);
      };
    }
  }, [selectedTicket, isConnected, user]);

  // Handlers
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCollisionAgent(null);
  };

  const handleSendMessage = async (
    content: string,
    type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE',
  ) => {
    if (!selectedTicket) return;
    const senderName = user?.username || 'Marcus Vance';
    const newMsg = await createMessage(selectedTicket.id, content, type);
    newMsg.senderName = type === 'INTERNAL_NOTE' ? `${senderName} (Internal)` : senderName;
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    await updateTicketStatus(selectedTicket.id, status);
    setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status } : t)),
    );
  };

  const handleCreateTicketSubmit = async (title: string, description: string) => {
    const created = await createTicket(title, description);
    setTickets((prev) => [created, ...prev]);
    setSelectedTicket(created);
  };

  const handleInsertDraftToComposer = (draftText: string) => {
    setComposerText(draftText);
  };

  const handleLogout = async () => {
    if (user) {
      const isMember = !!(user as any)?.isGuestMember || !!(user as any)?.workspaceId;
      if (isMember) {
        // Requirement 2: Member logout removes member from active count and releases seat
        try {
          await memberLogout((user as any).id, (user as any).workspaceId);
        } catch {
          // Fail silently
        }
      } else if (user.role !== 'ADMIN' && user.username.toLowerCase() !== 'pungkyrama') {
        // Requirement 3: Workspace owner logout purges all members
        try {
          await purgeWorkspaceOnLogout(user.username);
        } catch {
          // Fail silently
        }
      }
    }
    logoutUser();
    window.location.href = '/';
  };

  // Render Helpdesk Workspace matching dashboard.jpg for all roles
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar
        onNewTicketClick={() => setIsModalOpen(true)}
        isConnected={isConnected}
        user={user}
        onLogout={handleLogout}
        workspace={workspace}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        activeAdminTab={adminTab}
        onSelectAdminTab={setAdminTab}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        pods={pods}
        selectedPodId={selectedPodId}
        onSelectPod={(podId) => setSelectedPodId(podId)}
        onOpenCreatePodModal={() => setIsCreatePodModalOpen(true)}
        organizationName={organizationName}
        industry={industry}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Left Ticket Queue */}
        <TicketQueue
          tickets={tickets}
          selectedTicketId={selectedTicket?.id || null}
          onSelectTicket={handleSelectTicket}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Panel 2: Middle Ticket Timeline & Resolution Hub */}
        <TicketDetail
          ticket={selectedTicket}
          messages={messages}
          onSendMessage={handleSendMessage}
          onStatusChange={handleStatusChange}
          collisionAgent={collisionAgent}
          composerText={composerText}
          onComposerTextChange={setComposerText}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
        />

        {/* Panel 3: Right AI Copilot Hub */}
        <AiCopilotSidebar
          ticket={selectedTicket}
          messages={messages}
          onInsertToComposer={handleInsertDraftToComposer}
        />
      </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
      />

      {/* Team Invite Modal (Only accessible for regular users, excluded for Admin @pungkyrama) */}
      <TeamInviteModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        workspace={workspace}
        ownerIdentifier={user?.username || ''}
        onWorkspaceUpdated={setWorkspace}
      />

      {/* Account Profile & Avatar Upload Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Create Custom Pod Modal */}
      {user?.username && (
        <CreatePodModal
          isOpen={isCreatePodModalOpen}
          onClose={() => setIsCreatePodModalOpen(false)}
          username={user.username}
          onPodCreated={(newPod) => {
            setPods((prev) => [...prev, newPod]);
            setSelectedPodId(newPod.id);
          }}
        />
      )}

      {/* Transfer Pod Modal */}
      {selectedTicket && (
        <TransferPodModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          ticket={selectedTicket}
          pods={pods}
          currentUserId={user?.id}
          onTransferred={(updated) => {
            setSelectedTicket(updated);
            setTickets((prev) =>
              prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
            );
            if (user?.username) {
              fetchOrganizationPods(user.username).then((res) => {
                if (res?.pods) setPods(res.pods);
              });
            }
          }}
        />
      )}
    </div>
  );
}
