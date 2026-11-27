'use client';

export type CockpitTabId =
  | 'PLATFORM'
  | 'OVERVIEW'
  | 'PRESENCE'
  | 'PERSONNEL'
  | 'TOKENS'
  | 'CRISIS'
  | 'CHANNELS';

export interface ForceLogoutTarget {
  name: string;
  role: string;
  token?: string;
  userId?: string;
  username?: string;
}

export interface EditingUserTarget {
  id: string;
  fullName: string;
  role: string;
  podName?: string;
}

export interface PromotingUserTarget {
  id: string;
  fullName: string;
  podId: string;
  podName: string;
  currentLeaderName?: string;
  quota: number;
}

export interface SwappingUserTarget {
  id: string;
  fullName: string;
  role: string;
  podId: string;
  podName: string;
}

export function cleanPodName(name?: string): string {
  if (!name) return '';
  return name.replace(/\s+Pod$/i, '').trim();
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export const INDUSTRY_DEFAULT_SERVICES: Record<string, string[]> = {
  ECOMMERCE: [
    'WISMO & Carrier Exceptions',
    'Returns, Exchanges & Damaged Claims',
    'Checkout, Payments & Promotions',
    'VIP Concierge & High-LTV Buyers',
    'Merchant Onboarding & Catalog Compliance',
    'Product Quality & Brand Protection',
  ],
  LOGISTICS: [
    'Linehaul & Transit Hub Exceptions',
    'Last-Mile & Delivery Route Exceptions',
    'Freight Damage & Insurance Claims',
    'B2B Shipper Accounts & COD Settlement',
    'Fleet Dispatch & Special Handling',
    'Courier Misconduct & Driver Operations',
  ],
  FINTECH: [
    'ACH, Wire & Real-Time Disputes',
    'Biometric KYC & Account Security',
    'Fraud, Scam & Chargeback Defense',
    'B2B Payment Gateway & Webhooks',
    'Digital Lending, BNPL & Collections',
    'Treasury, Settlement & Clearing',
  ],
  SAAS: [
    'Tier-1 User Access & Admin Onboarding',
    'Tier-2 API, Webhooks & Developer Interop',
    'Tier-3 Application Bug & Engineering',
    'Enterprise Security, SAML SSO & SCIM',
    'Subscription Invoicing, Tax & Procurement',
    'P0/P1 Downtime & SLA Escalations',
  ],
  HEALTHCARE: [
    'Urgent Triage & Clinical Escalations',
    'Doctor Appointments & Telehealth Video',
    'Digital Prescriptions & Pharmacy Delivery',
    'Health Insurance Claims & Prior Auth',
    'Electronic Health Records & HIPAA Privacy',
    'Chronic Care & Patient Follow-up',
  ],
  REAL_ESTATE: [
    'Tenant Emergency Maintenance & Repairs',
    'Lease Agreements, Move-in & Handover',
    'Rent Collection & Security Deposits',
    'HOA Compliance, Noise & Violations',
    'Property Amenities & Facilities',
    'Landlord Relations & Vendor Work Orders',
  ],
  TRAVEL: [
    'Flight Rescheduling & Disruptions',
    'Hotel Bookings & Property Disputes',
    'Trip Disruptions & 24/7 Emergency',
    'Corporate Travel & MICE Groups',
    'Rental Car & Airport Ground Transport',
    'Travel Insurance & Cancellation Claims',
  ],
  GAMING: [
    'Account Security, 2FA & Stolen Items',
    'In-Game Purchases & Currency Refunds',
    'Player Toxicity, Cheating & Bans',
    'Server Latency, Bugs & Client Crashes',
    'Guilds, Clan Support & Community',
    'Esports Tournaments & Anti-Cheat',
  ],
  TELECOM: [
    'Network Outage & Area Downtime',
    'Field Technician On-Site Dispatch',
    'Modem/Router & Wi-Fi Diagnostics',
    'Billing Invoices & Rate Expirations',
    'SIM Card, eSIM & Number Porting',
    'Enterprise Dedicated Fiber & SLA Lines',
  ],
  AUTOMOTIVE: [
    'Roadside Assistance & Towing',
    'EV Charging Station & App Billing',
    'Vehicle Warranty & Recall Servicing',
    'Car Rental Damage & Toll Disputes',
    'Fleet Telematics & Commercial Vehicle',
    'Auto Insurance Claims & Accident Reports',
  ],
  PROFESSIONAL_SERVICES: [
    'Tax Filing Deadlines & IRS Documents',
    'Client Retainer Onboarding & Scope',
    'Attorney & Consultant Scheduling',
    'Secure Document Vault & Compliance',
    'Billing Invoices, Trust & Retainers',
    'Corporate Entity Formation & Filings',
  ],
  EDTECH: [
    'LMS Platform & Virtual Classrooms',
    'Tuition Payments, Aid & Billing',
    'Academic Advising & Tutor Support',
    'Certification & Degree Verification',
    'Admissions, Placement & Counseling',
    'Exam Integrity & Proctoring Support',
  ],
  OTHER: [
    'Frontline Operations & Ticket Triage',
    'Billing Invoices & Payment Disputes',
    'Product Quality & Warranty Claims',
    'Technical Diagnostics & Application Support',
    'Account Security & Profile Management',
    'Executive & High-Priority SLA Escalations',
  ],
};
