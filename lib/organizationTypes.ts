import { Timestamp } from 'firebase/firestore';

// Organization Types
export interface Organization {
  id: string;
  name: string;
  type: 'science_park' | 'accelerator' | 'bootcamp' | 'innovation_center';
  status: 'active' | 'suspended' | 'expired';
  contactEmail: string;
  contactName: string;
  subscriptionPlan: {
    planId: string;
    participantLimit: number;
    pitchesPerMonth: number;
    features: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminIds: string[];
}

export interface Program {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'completed' | 'archived';
  participantIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  programId?: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: string;
  invitedAt: Timestamp;
  acceptedAt?: Timestamp;
  expiresAt: Timestamp;
  token: string;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'participant';
  programIds: string[];
  joinedAt: Timestamp;
  invitationId: string;
  status: 'active' | 'inactive';
}

// Enhanced Pitch Submission with organization fields
export interface EnhancedPitchSubmission {
  id: string;
  userId: string;
  transcript: string;
  audioUrl?: string;
  createdAt: Timestamp;
  organizationId?: string;
  programId?: string;
  visibility: 'private' | 'organization';
  domainCategories: string[];
  scores?: {
    overall: number;
    market: number;
    team: number;
    innovation: number;
  };
}

// Analytics Types
export interface UsageMetrics {
  userId: string;
  userName?: string;
  userEmail?: string;
  totalPitches: number;
  totalAnalyses: number;
  lastPitchDate?: Timestamp;
  joinedDate: Timestamp;
  programIds: string[];
}

export interface OrganizationAnalytics {
  organizationId: string;
  programId?: string;
  totalParticipants: number;
  activeParticipants: number;
  inactiveParticipants: number;
  totalPitches: number;
  pitchesThisMonth: number;
  averageScore: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  pitchTrend: {
    date: string;
    count: number;
  }[];
  computedAt: Timestamp;
}

// Input Types for API
export interface CreateOrganizationInput {
  name: string;
  type: 'science_park' | 'accelerator' | 'bootcamp' | 'innovation_center';
  contactEmail: string;
  contactName: string;
  subscriptionPlan: {
    planId: string;
    participantLimit: number;
    pitchesPerMonth: number;
    features: string[];
  };
  adminIds: string[];
}

export interface CreateProgramInput {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface PitchFilters {
  programId?: string;
  scoreThreshold?: number;
  scoreField?: 'overall' | 'market' | 'team' | 'innovation';
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  participantIds?: string[];
}
