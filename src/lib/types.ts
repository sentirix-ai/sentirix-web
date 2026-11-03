export type TicketStatus = 'NEW' | 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED' | 'URGENT';
export type MessageType = 'PUBLIC_REPLY' | 'INTERNAL_NOTE' | 'SYSTEM_EVENT';

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  sentiment: Sentiment;
  tags: string[];
  customerId: string;
  customerName: string;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  workspaceId?: string | null;
  workspaceName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface AiTriageResult {
  sentiment: Sentiment;
  priority: Priority;
  tags: string[];
  summary: string;
}

export interface DraftReplyResponse {
  draft: string;
  groundedSources: string[];
}

export interface SummarizeResponse {
  bulletPoints: string[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  role: string;
  joinedAt: string;
}

export interface WorkspaceData {
  workspaceId: string;
  name: string;
  ownerName: string;
  inviteToken: string;
  inviteUrl: string;
  maxMembers: number;
  currentMembersCount: number;
  remainingSeats: number;
  members: WorkspaceMember[];
}

export interface ValidateInviteResult {
  valid: boolean;
  error?: string;
  workspaceId?: string;
  workspaceName?: string;
  ownerName?: string;
  currentMembers?: number;
  maxMembers?: number;
  remainingSeats?: number;
}

export interface OwnerUserLead {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  verificationMethod: string;
  onboardingCompleted: boolean;
  createdAt: string;
  workspace?: {
    id: string;
    name: string;
    maxMembers: number;
    currentMembersCount: number;
    remainingSeats: number;
    totalTokensGenerated: number;
  } | null;
}

export interface OwnerAnalyticsData {
  summary: {
    totalUsers: number;
    totalWorkspaces: number;
    totalActiveMembers: number;
    totalTickets: number;
    emailVerifiedCount: number;
    phoneVerifiedCount: number;
    completedOnboardingCount: number;
    onboardingRate: number;
  };
  capacityDistribution: {
    capacity: number;
    count: number;
    percentage: number;
    label: string;
  }[];
  growthTrend: {
    date: string;
    dayLabel: string;
    signups: number;
    activeWorkspaces: number;
  }[];
  usersDirectory: OwnerUserLead[];
}

export interface PodConfig {
  id?: string;
  name: string;
  podCategory: string;
  description?: string;
  seats: number;
  isCatchAll?: boolean;
}

export interface PodInfo {
  id: string;
  name: string;
  podCategory: string;
  description?: string;
  isCatchAll: boolean;
  maxMembers: number;
  currentMembersCount: number;
  openTicketsCount: number;
  inviteToken: string;
}

export interface OrganizationPodsResponse {
  organizationName: string;
  industry: string;
  totalSeats: number;
  leadershipMode: 'UNIFIED' | 'DEDICATED';
  pods: PodInfo[];
}

export interface GeneratePodsResponse {
  industry: string;
  pods: Array<{
    name: string;
    category: string;
    description: string;
    recommendedSeats: number;
  }>;
}

export interface SetupMultiPodPayload {
  identifier: string;
  organizationName?: string;
  industry: string;
  customIndustryDescription?: string;
  totalSeats: number;
  leadershipMode?: 'UNIFIED' | 'DEDICATED';
  pods: Array<{
    name: string;
    podCategory: string;
    description?: string;
    seats?: number;
  }>;
}


