'use client';

import React from 'react';
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Laptop,
  HeartPulse,
  Home,
  Plane,
  Gamepad2,
  Wifi,
  Car,
  Scale,
  GraduationCap,
} from 'lucide-react';

export interface IndustryOption {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  defaultServices: string[];
}

export const INDUSTRY_PRESETS: IndustryOption[] = [
  {
    id: 'ECOMMERCE',
    name: 'E-Commerce & D2C Brands',
    tagline: 'WISMO tracking, RMA returns, checkout vouchers, VIP buyers, merchant onboarding',
    icon: ShoppingCart,
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    defaultServices: [
      'WISMO & Carrier Exceptions',
      'Returns, Exchanges & Damaged Claims',
      'Checkout, Payments & Promotions',
      'VIP Concierge & High-LTV Buyers',
      'Merchant Onboarding & Catalog Compliance',
      'Product Quality & Brand Protection',
    ],
  },
  {
    id: 'LOGISTICS',
    name: 'Logistics, Freight & 3PLs',
    tagline: 'Linehaul transit, last-mile RTS, freight damage, COD settlement, fleet dispatch',
    icon: Truck,
    accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
    defaultServices: [
      'Linehaul & Transit Hub Exceptions',
      'Last-Mile & Delivery Route Exceptions',
      'Freight Damage & Insurance Claims',
      'B2B Shipper Accounts & COD Settlement',
      'Fleet Dispatch & Special Handling',
      'Courier Misconduct & Driver Operations',
    ],
  },
  {
    id: 'FINTECH',
    name: 'FinTech & Digital Payments',
    tagline: 'ACH disputes, biometric KYC, chargeback defense, BNPL lending, treasury clearing',
    icon: CreditCard,
    accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
    defaultServices: [
      'ACH, Wire & Real-Time Disputes',
      'Biometric KYC & Account Security',
      'Fraud, Scam & Chargeback Defense',
      'B2B Payment Gateway & Webhooks',
      'Digital Lending, BNPL & Collections',
      'Treasury, Settlement & Clearing',
    ],
  },
  {
    id: 'SAAS',
    name: 'B2B SaaS & Tech Enterprise',
    tagline: 'REST APIs, webhooks, Okta/SAML SSO, SLA downtime incidents, subscription invoicing',
    icon: Laptop,
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
    defaultServices: [
      'Tier-1 User Access & Admin Onboarding',
      'Tier-2 API, Webhooks & Developer Interop',
      'Tier-3 Application Bug & Engineering',
      'Enterprise Security, SAML SSO & SCIM',
      'Subscription Invoicing, Tax & Procurement',
      'P0/P1 Downtime & SLA Escalations',
    ],
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare & Telemedicine',
    tagline: 'Doctor video visits, Rx pharmacy delivery, HIPAA records, clinical triage',
    icon: HeartPulse,
    accentColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
    defaultServices: [
      'Urgent Triage & Clinical Escalations',
      'Doctor Appointments & Telehealth Video',
      'Digital Prescriptions & Pharmacy Delivery',
      'Health Insurance Claims & Prior Auth',
      'Electronic Health Records & HIPAA Privacy',
      'Chronic Care & Patient Follow-up',
    ],
  },
  {
    id: 'REAL_ESTATE',
    name: 'Real Estate & PropTech',
    tagline: 'Tenant emergency repairs, lease agreements, security deposits, HOA compliance',
    icon: Home,
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400',
    defaultServices: [
      'Tenant Emergency Maintenance & Repairs',
      'Lease Agreements, Move-in & Handover',
      'Rent Collection & Security Deposits',
      'HOA Compliance, Noise & Violations',
      'Property Amenities & Facilities',
      'Landlord Relations & Vendor Work Orders',
    ],
  },
  {
    id: 'TRAVEL',
    name: 'Travel, Hospitality & Airlines',
    tagline: 'Flight rescheduling, hotel overbooking, 24/7 trip disruption, MICE, rental cars',
    icon: Plane,
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    defaultServices: [
      'Flight Rescheduling & Disruptions',
      'Hotel Bookings & Property Disputes',
      'Trip Disruptions & 24/7 Emergency',
      'Corporate Travel & MICE Groups',
      'Rental Car & Airport Ground Transport',
      'Travel Insurance & Cancellation Claims',
    ],
  },
  {
    id: 'GAMING',
    name: 'Gaming & Interactive Media',
    tagline: 'Account recovery, in-game item refunds, anti-cheat ban appeals, tournament support',
    icon: Gamepad2,
    accentColor: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/40 text-violet-400',
    defaultServices: [
      'Account Security, 2FA & Stolen Items',
      'In-Game Purchases & Currency Refunds',
      'Player Toxicity, Cheating & Bans',
      'Server Latency, Bugs & Client Crashes',
      'Guilds, Clan Support & Community',
      'Esports Tournaments & Anti-Cheat',
    ],
  },
  {
    id: 'TELECOM',
    name: 'Telecommunications & ISPs',
    tagline: 'Fiber network outages, technician dispatch, modem router diagnostics, eSIM porting',
    icon: Wifi,
    accentColor: 'from-sky-500/20 to-cyan-500/10 border-sky-500/40 text-sky-400',
    defaultServices: [
      'Network Outage & Area Downtime',
      'Field Technician On-Site Dispatch',
      'Modem/Router & Wi-Fi Diagnostics',
      'Billing Invoices & Rate Expirations',
      'SIM Card, eSIM & Number Porting',
      'Enterprise Dedicated Fiber & SLA Lines',
    ],
  },
  {
    id: 'AUTOMOTIVE',
    name: 'Automotive & EV Mobility',
    tagline: 'Roadside towing, EV charging stations, warranty recall servicing, damage claims',
    icon: Car,
    accentColor: 'from-orange-500/20 to-red-500/10 border-orange-500/40 text-orange-400',
    defaultServices: [
      'Roadside Assistance & Towing',
      'EV Charging Station & App Billing',
      'Vehicle Warranty & Recall Servicing',
      'Car Rental Damage & Toll Disputes',
      'Fleet Telematics & Commercial Vehicle',
      'Auto Insurance Claims & Accident Reports',
    ],
  },
  {
    id: 'PROFESSIONAL_SERVICES',
    name: 'Legal & CPA Tax Services',
    tagline: 'IRS tax filing, client retainer agreements, attorney scheduling, document vault',
    icon: Scale,
    accentColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-400',
    defaultServices: [
      'Tax Filing Deadlines & IRS Documents',
      'Client Retainer Onboarding & Scope',
      'Attorney & Consultant Scheduling',
      'Secure Document Vault & Compliance',
      'Billing Invoices, Trust & Retainers',
      'Corporate Entity Formation & Filings',
    ],
  },
  {
    id: 'EDTECH',
    name: 'Education & Bootcamps',
    tagline: 'LMS virtual classrooms, tuition financial aid, degree credentials, proctoring',
    icon: GraduationCap,
    accentColor: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400',
    defaultServices: [
      'LMS Platform & Virtual Classrooms',
      'Tuition Payments, Aid & Billing',
      'Academic Advising & Tutor Support',
      'Certification & Degree Verification',
      'Admissions, Placement & Counseling',
      'Exam Integrity & Proctoring Support',
    ],
  },
];

export const CUSTOM_INDUSTRY_DEFAULT_SERVICES = [
  'Frontline Operations & Ticket Triage',
  'Billing Invoices & Payment Disputes',
  'Product Quality & Warranty Claims',
  'Technical Diagnostics & Application Support',
  'Account Security & Profile Management',
  'Executive & High-Priority SLA Escalations',
];

export interface PodDraft {
  name: string;
  podCategory: string;
  description: string;
  services: string[];
  seats?: number;
}

const CORPORATE_ACRONYMS = new Set([
  'PT', 'CV', 'UD', 'TBK', 'LLC', 'LTD', 'GMBH', 'PTE', 'USA', 'UK', 'ID', 'BCA', 'BRI', 'BNI', 'IBM', 'AWS', 'NASA', 'SAP', 'AI', 'IT', 'HQ'
]);

export function toCorporateTitleCase(input: string): string {
  if (!input) return '';
  const trailingSpaces = input.match(/\s+$/)?.[0] || '';
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return trailingSpaces;

  const formattedWords = words.map((word) => {
    const upper = word.toUpperCase();
    if (CORPORATE_ACRONYMS.has(upper)) {
      return upper;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return formattedWords.join(' ') + trailingSpaces;
}

export interface LeaderTokenPreview {
  workspaceId: string;
  workspaceName: string;
  podCategory: string;
  services: string[];
  token: string;
  joinUrl: string;
  isClaimed?: boolean;
  leaderName?: string | null;
}

export interface SemanticWarningState {
  original: string;
  proposed: string;
  explanation: string;
  index: number;
}
