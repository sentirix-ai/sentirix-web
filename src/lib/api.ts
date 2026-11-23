import {
  Ticket,
  Message,
  TicketStatus,
  DraftReplyResponse,
  SummarizeResponse,
  WorkspaceData,
  ValidateInviteResult,
  OwnerAnalyticsData,
  PodInfo,
  OrganizationPodsResponse,
  GeneratePodsResponse,
  SetupMultiPodPayload,
  AttachmentPayload,
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchTickets(
  status?: string,
  search?: string,
  isMember?: boolean,
  workspaceId?: string,
): Promise<Ticket[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    if (isMember) params.append('isMember', 'true');
    if (workspaceId && workspaceId !== 'ALL') params.append('workspaceId', workspaceId);

    const res = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch from backend');
    const data = await res.json();
    if (isMember) {
      return data.filter(
        (t: Ticket) =>
          t.ticketNumber !== 1003 &&
          !t.tags?.includes('vip-escalation') &&
          !t.title.toLowerCase().includes('vip escalation') &&
          !t.title.toLowerCase().includes('saml sso') &&
          !t.title.toLowerCase().includes('okta'),
      );
    }
    return data;
  } catch {
    // Graceful offline mock fallback
    const mockTickets: Ticket[] = [
      {
        id: 'tick-001',
        ticketNumber: 1001,
        title: 'Payment processed twice for annual subscription',
        description:
          'I clicked upgrade once, but my bank statement shows two identical charges of $1,200 on Oct 30. Please refund the duplicate immediately.',
        status: 'OPEN',
        priority: 'CRITICAL',
        sentiment: 'FRUSTRATED',
        tags: ['billing', 'duplicate-charge', 'refund'],
        customerId: 'cust-01',
        customerName: 'Sarah Jenkins (CTO, HyperScale Inc)',
        assignedAgentId: 'agent-01',
        assignedAgentName: 'Marcus Vance',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'tick-002',
        ticketNumber: 1002,
        title: 'Webhooks failing with 504 Gateway Timeout',
        description:
          'Our webhook endpoint is not receiving customer.created events since 09:00 AM UTC. We see retries timing out.',
        status: 'NEW',
        priority: 'HIGH',
        sentiment: 'URGENT',
        tags: ['api', 'webhook', 'timeout'],
        customerId: 'cust-02',
        customerName: 'Liam Chen (Lead Architect, FinPulse Dubai)',
        assignedAgentId: null,
        assignedAgentName: null,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: 'tick-003',
        ticketNumber: 1003,
        title:
          '[VIP Escalation] SLA Breach Warning: Enterprise Penalty Credit & Contract Renewal Review',
        description:
          'Yesterday, our peak checkout experienced an unscheduled outage of 45 minutes, exceeding our 99.9% uptime SLA agreement. As a Tier-1 Enterprise account ($180k ARR), I am escalating this directly to your Support Team Lead to discuss SLA penalty credit compensation and infrastructure stability guarantees before our executive board finalizes next week\'s annual contract renewal.',
        status: 'PENDING',
        priority: 'HIGH',
        sentiment: 'URGENT',
        tags: ['vip-escalation', 'sla-breach', 'contract-renewal', 'tier1-client'],
        customerId: 'cust-03',
        customerName: 'Marcus Thorne (VP of Operations, Apex Global Retail)',
        assignedAgentId: 'agent-01',
        assignedAgentName: 'Marcus Vance',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];

    if (isMember) {
      return mockTickets.filter(
        (t) =>
          t.ticketNumber !== 1003 &&
          !t.tags.includes('vip-escalation') &&
          !t.title.toLowerCase().includes('vip escalation') &&
          !t.title.toLowerCase().includes('saml sso') &&
          !t.title.toLowerCase().includes('okta'),
      );
    }
    return mockTickets;
  }
}

export async function fetchMessages(ticketId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/messages/ticket/${ticketId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  } catch {
    return [
      {
        id: 'msg-01',
        ticketId,
        senderId: 'cust-01',
        senderName: 'Sarah Jenkins',
        type: 'PUBLIC_REPLY',
        content:
          'I clicked upgrade once, but my bank statement shows two identical charges of $1,200 on Oct 30. Please refund the duplicate immediately.',
        aiGenerated: false,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'msg-02',
        ticketId,
        senderId: 'agent-01',
        senderName: 'Marcus Vance',
        type: 'INTERNAL_NOTE',
        content:
          'Verified with Stripe logs. Charge ch_3Pq9 was duplicate triggered by double click before button disabled. Refund initiated via Stripe dashboard.',
        aiGenerated: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-03',
        ticketId,
        senderId: 'agent-01',
        senderName: 'Marcus Vance',
        type: 'PUBLIC_REPLY',
        content:
          'Hi Sarah, thanks for bringing this to our attention. I have processed the $1,200 refund for the duplicate transaction. It should reflect in 3-5 business days.',
        aiGenerated: true,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];
  }
}

export async function createTicket(
  titleOrPayload:
    | string
    | {
        title: string;
        description: string;
        customerId?: string;
        customerName?: string;
        tags?: string[];
        workspaceId?: string;
        attachments?: AttachmentPayload[];
        attachmentName?: string;
        attachmentType?: string;
        attachmentData?: string;
      },
  maybeDescription?: string,
): Promise<Ticket> {
  const payload =
    typeof titleOrPayload === 'string'
      ? { title: titleOrPayload, description: maybeDescription || '' }
      : titleOrPayload;

  try {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return await res.json();
  } catch {
    return {
      id: `tick-${Date.now().toString(36)}`,
      ticketNumber: Math.floor(Math.random() * 9000) + 1000,
      title: payload.title,
      description: payload.description,
      status: 'NEW',
      priority: 'HIGH',
      sentiment: 'URGENT',
      tags: payload.tags || ['support', 'ai-triage'],
      customerId: payload.customerId || 'cust-web',
      customerName: payload.customerName || 'Demo Customer',
      workspaceId: payload.workspaceId || null,
      attachmentName: payload.attachmentName || payload.attachments?.[0]?.fileName || null,
      attachmentType: payload.attachmentType || payload.attachments?.[0]?.mimeType || null,
      attachmentData: payload.attachmentData || payload.attachments?.[0]?.data || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function createMessage(
  ticketId: string,
  content: string,
  type: 'PUBLIC_REPLY' | 'INTERNAL_NOTE',
  aiGenerated = false,
  attachments?: AttachmentPayload[],
  attachmentMeta?: {
    attachmentName?: string;
    attachmentType?: string;
    attachmentData?: string;
  },
): Promise<Message> {
  try {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId,
        content,
        type,
        senderName: type === 'INTERNAL_NOTE' ? 'Marcus Vance (Internal)' : 'Marcus Vance',
        aiGenerated,
        attachments,
        attachmentName: attachmentMeta?.attachmentName || attachments?.[0]?.fileName,
        attachmentType: attachmentMeta?.attachmentType || attachments?.[0]?.mimeType,
        attachmentData: attachmentMeta?.attachmentData || attachments?.[0]?.data,
      }),
    });
    if (!res.ok) throw new Error('Failed to post message');
    return await res.json();
  } catch {
    return {
      id: `msg-${Date.now().toString(36)}`,
      ticketId,
      senderId: 'agent-01',
      senderName: type === 'INTERNAL_NOTE' ? 'Marcus Vance (Internal)' : 'Marcus Vance',
      type,
      content,
      aiGenerated,
      attachmentName: attachmentMeta?.attachmentName || attachments?.[0]?.fileName || null,
      attachmentType: attachmentMeta?.attachmentType || attachments?.[0]?.mimeType || null,
      attachmentData: attachmentMeta?.attachmentData || attachments?.[0]?.data || null,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  resolutionNotes?: string,
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes }),
    });
  } catch {
    // Offline simulated
  }
}

export async function generateAiReply(
  ticketTitle: string,
  ticketDescription: string,
  history: Array<{ sender: string; content: string }>,
  tone: 'professional' | 'empathetic' | 'concise',
  attachments?: AttachmentPayload[],
): Promise<DraftReplyResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/draft-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketTitle,
        ticketDescription,
        conversationHistory: history,
        tone,
        attachments,
        knowledgeContext:
          'Standard refund policy: All duplicate charges are automatically refunded in full within 3-5 business days upon agent verification. No deduction fees apply.',
      }),
    });
    if (!res.ok) throw new Error('AI API unavailable');
    return await res.json();
  } catch {
    const hasAtt = attachments && attachments.length > 0;
    return {
      draft: `Dear Sarah,\n\nThank you for reaching out to us. We sincerely apologize for the frustration caused by the duplicate billing transaction of $1,200 on October 30.\n\nOur billing team has verified the issue${hasAtt ? ` and carefully inspected your attached ${attachments[0].fileName}` : ''} and processed an immediate refund to your original payment method. You should see the credit reflected on your bank statement within 3 to 5 business days.\n\nPlease let us know if you need any additional confirmation.\n\nWarm regards,\nMarcus Vance\nSentrix Support Engineering`,
      groundedSources: [
        'Sentrix Refund Policy Section 3.2',
        ...(hasAtt ? [`Visual Document (${attachments[0].fileName})`] : []),
      ],
    };
  }
}

export async function summarizeThread(
  ticketTitle: string,
  messages: Array<{ sender: string; content: string }>,
  attachments?: AttachmentPayload[],
): Promise<SummarizeResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/summarize-thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketTitle,
        messages,
        attachments,
      }),
    });
    if (!res.ok) throw new Error('AI Summarize failed');
    return await res.json();
  } catch {
    const hasAtt = attachments && attachments.length > 0;
    return {
      bulletPoints: [
        'Customer reported duplicate charge of $1,200 on annual subscription.',
        hasAtt
          ? `Visual proof document (${attachments[0].fileName}) inspected and cross-referenced.`
          : 'Support Engineer confirmed webhook double-execution via Stripe logs.',
        'Manual refund of $1,200 initiated; confirmation sent to customer.',
      ],
    };
  }
}

// ==========================================
// Workspace & Team Management APIs
// ==========================================

export async function fetchMyWorkspace(identifier: string): Promise<WorkspaceData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/my-workspace?identifier=${encodeURIComponent(identifier)}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 403) return null; // Admin excluded
      throw new Error('Failed to load workspace');
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function validateWorkspaceInvite(
  token: string,
  sessionId?: string,
): Promise<ValidateInviteResult> {
  try {
    const q = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(`${API_BASE_URL}/workspace/validate-invite/${encodeURIComponent(token)}${q}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { valid: false, error: err.message || 'Invalid or expired invite link.' };
    }
    return await res.json();
  } catch {
    return { valid: false, error: 'Cannot connect to Sentrix backend server.' };
  }
}

export async function joinWorkspace(
  token: string,
  fullName: string,
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to join workspace.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error while attempting to join workspace.' };
  }
}

export async function regenerateWorkspaceToken(
  identifier: string,
): Promise<{ success: boolean; inviteToken?: string; inviteUrl?: string; workspace?: WorkspaceData; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/regenerate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to regenerate invite link.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function removeWorkspaceMember(
  ownerIdentifier: string,
  memberId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/member/${encodeURIComponent(memberId)}?ownerIdentifier=${encodeURIComponent(ownerIdentifier)}`,
      {
        method: 'DELETE',
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to remove member.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function purgeWorkspaceOnLogout(identifier: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/workspace/purge-on-logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
  } catch {
    // Fail silently on network error
  }
}

export async function checkMemberStatus(userId: string): Promise<boolean> {
  if (!userId) return true;
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/member-status?userId=${encodeURIComponent(userId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) {
      // If server is momentarily busy or network is reloading, do not falsely log out user
      return true;
    }
    const data = await res.json();
    return data.active !== false;
  } catch {
    // Network error or aborted fetch during F5 refresh -> do NOT log out user
    return true;
  }
}

export async function generateSingleUseToken(
  identifier: string,
): Promise<{ success: boolean; inviteToken?: string; inviteUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to generate single-use invite link.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function memberLogout(memberId: string, workspaceId?: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/workspace/member-logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, workspaceId }),
    });
  } catch {
    // Fail silently on network error
  }
}

export async function setupWorkspaceCapacity(
  identifier: string,
  capacity: number,
): Promise<{ success: boolean; capacity: number; workspaceId?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/setup-capacity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, capacity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, capacity, error: err.message || 'Failed to save team capacity.' };
    }
    return await res.json();
  } catch {
    return { success: false, capacity, error: 'Network error while connecting to server.' };
  }
}

export async function fetchOwnerAnalytics(
  identifier: string = 'pungkyrama',
): Promise<OwnerAnalyticsData | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/analytics/owner-dashboard?identifier=${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generatePodsForIndustry(
  industry: string,
  customDescription?: string,
): Promise<GeneratePodsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/generate-pods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, customDescription }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function setupMultiPod(
  payload: SetupMultiPodPayload,
): Promise<{ success: boolean; organization?: any; workspaces?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/setup-multi-pod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to setup multi-pod organization.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error while connecting to server.' };
  }
}

export async function fetchOrganizationPods(
  identifier: string,
): Promise<OrganizationPodsResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/pods?identifier=${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createCustomPod(
  identifier: string,
  pod: { name: string; podCategory?: string; description?: string; maxMembers?: number },
): Promise<{ success: boolean; pod?: PodInfo; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/custom-pod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, ...pod }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to create pod.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function transferTicketPod(
  ticketId: string,
  targetPodId: string,
  handoverNote?: string,
  actorId?: string,
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/transfer-pod`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPodId, handoverNote, actorId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to transfer ticket.' };
    }
    const data = await res.json();
    return { success: true, ticket: data };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function setupMultiPodV2(payload: {
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
    services?: string[];
    seats?: number;
  }>;
}): Promise<{
  success: boolean;
  organization?: any;
  pods?: any[];
  leaderTokens?: Array<{
    workspaceId: string;
    workspaceName: string;
    podCategory: string;
    services: string[];
    token: string;
    joinUrl: string;
  }>;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/setup-multi-pod-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to setup multi-pod v2.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}






export async function fetchLeaderTokenStatus(token: string, sessionId?: string): Promise<any> {
  try {
    const q = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(
      `${API_BASE_URL}/workspace/leader-token-status/${encodeURIComponent(token)}${q}`,
      { cache: 'no-store' },
    );
    return await res.json();
  } catch {
    return { valid: false, error: 'Network error.' };
  }
}

export async function togglePodQuotaLock(payload: {
  token: string;
  chosenSubordinates: number;
  lock: boolean;
  sessionId?: string;
}): Promise<{
  valid?: boolean;
  success?: boolean;
  error?: string;
  quotaStats?: any;
  workspace?: any;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/toggle-pod-quota-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to toggle quota lock.' };
    }
    return { success: true, ...data };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function lockLeaderQuota(payload: {
  token: string;
  fullName: string;
  password?: string;
  chosenSubordinates: number;
  sessionId?: string;
}): Promise<{
  success: boolean;
  isReLogin?: boolean;
  leader?: any;
  workspace?: any;
  agentTokens?: Array<{ token: string; joinUrl: string }>;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/lock-leader-quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to lock quota.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function fetchAgentTokenStatus(token: string, sessionId?: string): Promise<any> {
  try {
    const q = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(
      `${API_BASE_URL}/workspace/agent-token-status/${encodeURIComponent(token)}${q}`,
      { cache: 'no-store' },
    );
    return await res.json();
  } catch {
    return { valid: false, error: 'Network error.' };
  }
}

export async function claimAgentToken(payload: {
  token: string;
  fullName: string;
  password?: string;
  sessionId?: string;
}): Promise<{
  success: boolean;
  user?: any;
  workspace?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/claim-agent-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to claim agent token.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function fetchSuperAdminCockpit(identifier: string): Promise<any> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/super-admin-cockpit?identifier=${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchPendingLeaderTokens(identifier: string): Promise<{
  success: boolean;
  hasPendingTokens: boolean;
  onboardingCompleted: boolean;
  organizationName?: string;
  industry?: string;
  customIndustryDescription?: string | null;
  totalSeats?: number;
  pods?: Array<{
    name: string;
    podCategory: string;
    description?: string;
    services: string[];
  }>;
  availableServices?: string[];
  leaderTokens: Array<{
    workspaceId: string;
    workspaceName: string;
    podCategory: string;
    services: string[];
    token: string;
    role: string;
    isUsed: boolean;
    joinUrl: string;
  }>;
} | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/pending-leader-tokens?identifier=${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function completeOnboarding(identifier: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/complete-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to complete onboarding.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function saveOnboardingDraft(identifier: string, draft: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/onboarding-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, draft }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchOnboardingDraft(identifier: string): Promise<any> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/onboarding-draft?identifier=${encodeURIComponent(identifier)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.draft || null;
  } catch {
    return null;
  }
}

export async function deleteOnboardingDraft(identifier: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/onboarding-draft?identifier=${encodeURIComponent(identifier)}`,
      { method: 'DELETE' },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function validateServiceSemantic(payload: {
  originalService: string;
  newServiceName: string;
  industry?: string;
}): Promise<{
  isCompatible: boolean;
  confidenceScore: number;
  explanation: string;
  suggestAddAsNew: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/validate-service-semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return {
        isCompatible: true,
        confidenceScore: 50,
        explanation: 'Could not perform semantic validation.',
        suggestAddAsNew: false,
      };
    }
    return await res.json();
  } catch {
    return {
      isCompatible: true,
      confidenceScore: 50,
      explanation: 'Network offline.',
      suggestAddAsNew: false,
    };
  }
}

export async function regenerateToken(
  token: string,
  identifier?: string,
  workspaceId?: string,
): Promise<{
  success: boolean;
  oldToken?: string;
  newToken?: string;
  role?: string;
  workspaceId?: string;
  workspaceName?: string;
  joinUrl?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/regenerate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, identifier, workspaceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to regenerate token.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

export async function adminForceLogoutUser(
  userId?: string,
  username?: string,
  token?: string,
  requesterIdentifier?: string,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/force-logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, token, requesterIdentifier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to force logout user.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

export async function cleanupDemoTickets(): Promise<{ count: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/tickets/demo/cleanup`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to cleanup demo tickets');
    return await res.json();
  } catch {
    return { count: 0 };
  }
}

export async function renamePersonnel(
  userId: string,
  newFullName: string,
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/rename-personnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newFullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to rename personnel.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}




export async function transferPersonnel(
  userId: string,
  targetWorkspaceId: string,
  targetRole?: string,
): Promise<{
  success: boolean;
  message?: string;
  user?: any;
  sourceWorkspace?: any;
  targetWorkspace?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/transfer-personnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetWorkspaceId, targetRole }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to transfer personnel.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}




export async function promoteLeader(
  userId: string,
  workspaceId: string,
): Promise<{
  success: boolean;
  message?: string;
  newLeader?: any;
  demotedLeader?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/promote-leader`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, workspaceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to promote personnel to leader.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}




export async function swapPersonnel(
  userAId: string,
  userBId: string,
): Promise<{
  success: boolean;
  message?: string;
  userA?: any;
  userB?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/swap-personnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAId, userBId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to swap personnel across pods.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

export async function createSpecializedPod(payload: {
  name: string;
  podCategory?: string;
  description?: string;
  services?: string[];
  quota?: number;
  organizationId?: string;
  requesterIdentifier?: string;
}): Promise<{
  success: boolean;
  message?: string;
  workspace?: any;
  leaderToken?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/create-pod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to create specialized pod.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

export async function addSeatToPod(payload: {
  workspaceId: string;
  seatCount: number;
}): Promise<{
  success: boolean;
  message?: string;
  workspace?: any;
  newTokens?: { token: string; role: string; joinUrl: string }[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/add-seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Failed to add seats to pod.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Network error connecting to backend.' };
  }
}
