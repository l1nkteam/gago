
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENCY = 'AGENCY',
  CLIENT = 'CLIENT',
  TEAM = 'TEAM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  company?: string;
}

export type BillingInterval = '1' | '3' | '6' | '12';

export interface PricingPlan {
  id: string;
  name: string;
  prices: Record<BillingInterval, number>; // Price for each interval
  features: string[];
  limits: {
    leads: number;
    audits: number;
    socialPosts: number;
    teamMembers: number;
  };
  isActive: boolean;
}

export interface Invoice {
  id: string;
  agencyName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  gateway: 'Stripe' | 'PayPal' | 'Binance Pay' | 'Simulation';
  interval: BillingInterval;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Specialist' | 'Auditor' | 'Support';
  status: 'online' | 'offline';
  joinedDate: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  niche: string;
  country: string;
}

export interface SocialConnection {
  platform: 'Facebook' | 'Instagram' | 'TikTok' | 'LinkedIn';
  status: 'connected' | 'disconnected' | 'expired';
  accountName?: string;
  lastSync?: string;
}

export interface ScheduledPost {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'TikTok' | 'LinkedIn';
  content: string;
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed';
}

export interface AutoPilotConfig {
  isEnabled: boolean;
  strategy: 'educational' | 'promotional' | 'engagement';
  frequency: 'daily' | 'weekdays' | 'custom';
  useLocalAI: boolean; 
}

export interface Client {
  id: string;
  name: string;
  email: string;
  website: string;
  status: 'active' | 'onboarding' | 'churned';
  projectsCount: number;
  joinedDate: string;
  socialConnections?: SocialConnection[];
  autoPilot?: AutoPilotConfig;
  limits?: {
    leads: number;
    audits: number;
    socialPosts: number;
    teamMembers: number;
  };
}

export interface ClientWithQueue extends Client {
  queue?: ScheduledPost[];
}

export interface Deal {
  id: string;
  clientName: string;
  niche: string;
  value: string;
  stage: 'Discovery' | 'Contacted' | 'Proposal' | 'Closed Won';
  lastActivity: string;
}

export interface Audit {
  id: string;
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee?: string;
}
