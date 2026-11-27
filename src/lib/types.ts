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

export interface OnboardingPodDraft {
  name: string;
  podCategory: string;
  description: string;
  services: string[];
  seats?: number;
}

export interface OnboardingDraft {
  lastActiveStep?: number;
  maxUnlockedStep?: number;
  organizationName?: string;
  selectedIndustry?: string;
  customIndustryText?: string;
  typedMembers?: number;
  isCapacityLocked?: boolean;
  pods?: OnboardingPodDraft[];
  availableServices?: string[];
  username?: string;
  email?: string;
  userId?: string;
}

export interface TokenWorkspaceSummary {
  id?: string;
  name?: string;
  podCategory?: string;
  services?: string[];
  isQuotaLocked?: boolean;
  assignedQuota?: number;
  maxMembers?: number;
  inviteToken?: string;
  isCatchAll?: boolean;
  organizationId?: string | null;
}

export interface OrganizationSummaryRecord {
  id: string;
  name: string;
  industry?: string;
  customIndustryDescription?: string | null;
  planTier?: string;
  totalSeats?: number;
  leadershipMode?: string;
  onboardingCompleted?: boolean;
}

export interface ApiUserProfile {
  id: string;
  username?: string | null;
  fullName?: string;
  email?: string;
  phone?: string | null;
  role: string;
  workspaceRole?: string;
  workspaceId?: string;
  workspaceName?: string;
  isGuestMember?: boolean;
  avatarText?: string;
  avatarUrl?: string | null;
  token?: string;
  onboardingCompleted?: boolean;
}

export interface QuotaStats {
  totalSeats: number;
  totalPods: number;
  lockedSeats: number;
  lockedPodsCount: number;
  otherUnlockedPodsCount: number;
  isLastPod: boolean;
  maxSubordinatesAllowed: number;
  allowedOptions: number[];
}

export interface LeaderAgentTokenPreview {
  token: string;
  joinUrl: string;
  isUsed?: boolean;
  usedBy?: string | null;
  isOpened?: boolean;
}

export interface LeaderTokenStatusResult {
  valid: boolean;
  error?: string;
  isUsed?: boolean;
  isClaimed?: boolean;
  isLockedToOtherSession?: boolean;
  token?: string;
  role?: string;
  isExistingLeader?: boolean;
  isReLogin?: boolean;
  existingLeaderName?: string | null;
  existingLeaderId?: string | null;
  existingLeaderUsername?: string | null;
  leaderName?: string | null;
  leaderUser?: ApiUserProfile | null;
  agentTokens?: LeaderAgentTokenPreview[];
  workspace?: TokenWorkspaceSummary;
  organization?: OrganizationSummaryRecord;
  quotaStats?: QuotaStats;
}

export interface AgentTokenStatusResult {
  valid: boolean;
  error?: string;
  isClaimed?: boolean;
  isLockedToOtherSession?: boolean;
  token?: string;
  role?: string;
  isReLogin?: boolean;
  assignedMemberName?: string | null;
  workspace?: TokenWorkspaceSummary;
  organization?: OrganizationSummaryRecord;
  leaderName?: string | null;
}

export interface CockpitSessionRecord {
  id: string;
  loginAt: string | Date;
  logoutAt?: string | Date | null;
  logoutReason: string;
  isOnline: boolean;
  durationSeconds: number;
  reconnectedAt?: string | Date | null;
}

export interface CockpitPresenceUser {
  userId: string;
  id?: string;
  fullName: string | null;
  username: string | null;
  role: string;
  podName: string;
  workspaceId: string | null;
  joinedAt: string | Date;
  isOnline: boolean;
  status: string;
  currentOnlineSeconds: number;
  activeTicketsCount: number;
  operationalState: string;
  operationalStateLabel: string;
  workloadDescription: string;
  latestLoginAt: string | Date | null;
  latestLogoutAt: string | Date | null;
  hadUnexpectedDisconnect: boolean;
  unexpectedDisconnectTime: string | Date | null;
  reconnectedTime: string | Date | null;
  disconnectDowntimeSeconds: number;
  customersServedToday: number;
  lifetimeCustomersServed: number;
  avgHandlingTimeSeconds: number;
  sessionHistory: CockpitSessionRecord[];
}

export interface CockpitWorkspaceItem {
  id: string;
  name: string;
  podCategory: string;
  services: string[];
  isQuotaLocked: boolean;
  assignedQuota: number;
  maxMembers: number;
  membersCount: number;
  leaderName: string | null;
  leaderClaimed: boolean;
  openTicketsCount: number;
}

export interface CockpitTokenAuditItem {
  id: string;
  token: string;
  role: string;
  podName: string;
  workspaceId: string;
  isUsed: boolean;
  rawIsUsed: boolean;
  needsRegeneration: boolean;
  usedBy: string | null;
  usedAt?: string | Date | null;
  createdAt: string | Date;
  userId: string | null;
  username: string | null;
  isUserOnline: boolean;
  userStatus: string;
  hadManualLogout: boolean;
  hadCloseBrowser?: boolean;
  hadForceLogout: boolean;
}

export interface CockpitCrisisTicket {
  id: string;
  ticketNumber: number;
  title: string;
  priority: Priority;
  sentiment: Sentiment;
  podName: string;
  createdAt: string | Date;
  isHanging?: boolean;
  hangingReason?: string | null;
  hangingSince?: string | Date | null;
}

export interface CockpitSlaBreachedTicket {
  id: string;
  ticketNumber: number;
  title: string;
  priority: Priority;
  sentiment: Sentiment;
  podName: string;
  createdAt: string | Date;
  elapsedMinutes: number;
}

export interface CockpitLeaderActivation {
  workspaceId: string;
  podName: string;
  leaderName: string;
  joinedAt: string | Date;
  isQuotaLocked: boolean;
  assignedQuota: number;
}

export interface CockpitStats {
  totalSeats?: number;
  claimedSeats?: number;
  seatUtilizationPercentage?: number;
  totalPods?: number;
  lockedPods?: number;
  crisisCount?: number;
  onlineCount?: number;
  slaCompliancePercentage?: number;
  slaStatusLabel?: string;
  slaMetCount?: number;
  slaBreachedCount?: number;
  totalEvaluatedTickets?: number;
}

export interface SuperAdminCockpitData {
  organization: OrganizationSummaryRecord;
  stats: CockpitStats;
  workspaces: CockpitWorkspaceItem[];
  tokenAudit: CockpitTokenAuditItem[];
  crisisTickets: CockpitCrisisTicket[];
  slaBreachedTickets: CockpitSlaBreachedTicket[];
  presenceMonitoring: CockpitPresenceUser[];
  recentLeaderActivations: CockpitLeaderActivation[];
}


