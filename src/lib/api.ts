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
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
        knowledgeContext:
          'Standard refund policy: All duplicate charges are automatically refunded in full within 3-5 business days upon agent verification. No deduction fees apply.',
      }),
    });
    if (!res.ok) throw new Error('AI API unavailable');
    return await res.json();
  } catch {
    return {
      draft: `Dear Sarah,\n\nThank you for reaching out to us. We sincerely apologize for the frustration caused by the duplicate billing transaction of $1,200 on October 30.\n\nOur billing team has verified the issue and processed an immediate refund to your original payment method. You should see the credit reflected on your bank statement within 3 to 5 business days.\n\nPlease let us know if you need any additional confirmation.\n\nWarm regards,\nMarcus Vance\nSentrix Support Engineering`,
      groundedSources: ['Sentrix Refund Policy Section 3.2'],
    };
  }
}

export async function summarizeThread(
  ticketTitle: string,
  messages: Array<{ sender: string; content: string }>,
): Promise<SummarizeResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/summarize-thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketTitle,
        messages,
      }),
    });
    if (!res.ok) throw new Error('AI Summarize failed');
    return await res.json();
  } catch {
    return {
      bulletPoints: [
        'Customer reported duplicate charge of $1,200 on annual subscription.',
        'Support Engineer confirmed webhook double-execution via Stripe logs.',
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

export async function validateWorkspaceInvite(token: string): Promise<ValidateInviteResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/workspace/validate-invite/${encodeURIComponent(token)}`, {
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
  try {
    const res = await fetch(
      `${API_BASE_URL}/workspace/member-status?userId=${encodeURIComponent(userId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return true;
    const data = await res.json();
    return !!data.active;
  } catch {
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





