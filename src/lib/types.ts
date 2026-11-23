export type TicketStatus = 'NEW' | 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED' | 'URGENT';
export type MessageType = 'PUBLIC_REPLY' | 'INTERNAL_NOTE' | 'SYSTEM_EVENT';

export interface AttachmentPayload {
  fileName: string;
  mimeType: string;
  data: string; // Base64 or Data URL
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  messageId?: string | null;
  uploadedById: string;
  fileName: string;
  fileType: string;
  fileSizeByte: number;
  fileUrl: string;
  fileData?: string | null;
  fileCategory?: string | null;
  caption?: string | null;
  createdAt: string;
}

export interface TicketPodTransfer {
  id: string;
  ticketId: string;
  fromPodId: string;
  toPodId: string;
  transferredById: string;
  reason: string;
  durationInPreviousPodSec: number;
  transferredAt: string;
  fromPod?: { id: string; name: string };
  toPod?: { id: string; name: string };
  transferredBy?: { id: string; fullName: string; username: string };
}

export interface AgentTicketActivity {
  id: string;
  ticketId: string;
  agentId: string;
  startedAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  durationSeconds: number;
  slaTargetSeconds: number;
  slaStatus: string;
  agent?: { id: string; fullName: string; username: string };
}

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
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
  attachments?: TicketAttachment[];
  podTransfers?: TicketPodTransfer[];
  agentActivities?: AgentTicketActivity[];
  isHanging?: boolean;
  hangingReason?: string | null;
  hangingSince?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
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
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
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
  isOnline?: boolean;
  presenceStatus?: 'ONLINE' | 'TERPUTUS' | 'OFFLINE';
  token?: string | null;
  tokenIsUsed?: boolean;
  needsRegeneration?: boolean;
  freshTokenReady?: boolean;
}

export interface PendingInviteToken {
  id: string;
  token: string;
  role: string;
  createdAt?: string | Date;
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
  isLeader?: boolean;
  isQuotaLocked?: boolean;
  assignedQuota?: number;
  pendingTokens?: PendingInviteToken[];
}

export interface ValidateInviteResult {
  valid: boolean;
  error?: string;
  isLockedToOtherSession?: boolean;
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
  customIndustryDescription?: string | null;
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
    service?: string;
  }>;
  defaultServices?: string[];
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


