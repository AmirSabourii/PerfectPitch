import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UsageMetrics, 
  OrganizationAnalytics, 
  EnhancedPitchSubmission,
  PitchFilters 
} from '../organizationTypes';

export class AnalyticsService {
  private pitchesCollection = collection(db, 'pitchSubmissions');
  private membershipsCollection = collection(db, 'organizationMemberships');

  async getParticipantUsageMetrics(userId: string, organizationId: string): Promise<UsageMetrics> {
    // Get user's pitches for this organization
    const q = query(
      this.pitchesCollection,
      where('userId', '==', userId),
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    const pitches = snapshot.docs.map(doc => doc.data() as EnhancedPitchSubmission);
    
    // Get membership info
    const membershipQ = query(
      this.membershipsCollection,
      where('userId', '==', userId),
      where('organizationId', '==', organizationId)
    );
    const membershipSnap = await getDocs(membershipQ);
    const membership = membershipSnap.docs[0]?.data();
    
    const lastPitch = pitches.length > 0 
      ? pitches.reduce((latest, pitch) => 
          pitch.createdAt.toMillis() > latest.createdAt.toMillis() ? pitch : latest
        )
      : null;

    return {
      userId,
      totalPitches: pitches.length,
      totalAnalyses: pitches.length,
      lastPitchDate: lastPitch?.createdAt,
      joinedDate: membership?.joinedAt || Timestamp.now(),
      programIds: membership?.programIds || [],
    };
  }

  async listParticipantsWithMetrics(
    organizationId: string, 
    programId?: string
  ): Promise<UsageMetrics[]> {
    // Get all memberships for this organization
    let q = query(
      this.membershipsCollection,
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    let memberships = snapshot.docs.map(doc => doc.data());
    
    // Filter by program if specified
    if (programId) {
      memberships = memberships.filter(m => m.programIds?.includes(programId));
    }
    
    // Get metrics for each participant
    const metricsPromises = memberships.map(membership =>
      this.getParticipantUsageMetrics(membership.userId, organizationId)
    );
    
    return Promise.all(metricsPromises);
  }

  async listOrganizationPitches(
    organizationId: string, 
    filters: PitchFilters = {}
  ): Promise<EnhancedPitchSubmission[]> {
    let q = query(
      this.pitchesCollection,
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    let pitches = snapshot.docs.map(doc => doc.data() as EnhancedPitchSubmission);
    
    // Apply filters
    if (filters.programId) {
      pitches = pitches.filter(p => p.programId === filters.programId);
    }
    
    if (filters.scoreThreshold !== undefined && filters.scoreField) {
      pitches = pitches.filter(p => {
        const score = p.scores?.[filters.scoreField!];
        return score !== undefined && score >= filters.scoreThreshold!;
      });
    }
    
    if (filters.categories && filters.categories.length > 0) {
      pitches = pitches.filter(p => 
        p.domainCategories.some(cat => filters.categories!.includes(cat))
      );
    }
    
    if (filters.dateRange) {
      const start = filters.dateRange.start.getTime();
      const end = filters.dateRange.end.getTime();
      pitches = pitches.filter(p => {
        const pitchTime = p.createdAt.toMillis();
        return pitchTime >= start && pitchTime <= end;
      });
    }
    
    if (filters.participantIds && filters.participantIds.length > 0) {
      pitches = pitches.filter(p => filters.participantIds!.includes(p.userId));
    }
    
    return pitches;
  }

  async getOrganizationAnalytics(
    organizationId: string, 
    programId?: string
  ): Promise<OrganizationAnalytics> {
    const pitches = await this.listOrganizationPitches(organizationId, { programId });
    const participants = await this.listParticipantsWithMetrics(organizationId, programId);
    
    const activeParticipants = participants.filter(p => p.totalPitches > 0).length;
    const inactiveParticipants = participants.length - activeParticipants;
    
    // Calculate average score
    const pitchesWithScores = pitches.filter(p => p.scores?.overall);
    const averageScore = pitchesWithScores.length > 0
      ? pitchesWithScores.reduce((sum, p) => sum + (p.scores?.overall || 0), 0) / pitchesWithScores.length
      : 0;
    
    // Score distribution
    const scoreRanges = ['0-20', '20-40', '40-60', '60-80', '80-100'];
    const scoreDistribution = scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = pitchesWithScores.filter(p => {
        const score = p.scores?.overall || 0;
        return score >= min && score < max;
      }).length;
      return { range, count };
    });
    
    // Category distribution
    const categoryCount: Record<string, number> = {};
    pitches.forEach(p => {
      p.domainCategories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });
    
    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: (count / pitches.length) * 100,
    }));
    
    // Pitch trend (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentPitches = pitches.filter(p => p.createdAt.toMillis() >= thirtyDaysAgo);
    
    const pitchTrend: { date: string; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = recentPitches.filter(p => {
        const pitchDate = new Date(p.createdAt.toMillis()).toISOString().split('T')[0];
        return pitchDate === dateStr;
      }).length;
      pitchTrend.push({ date: dateStr, count });
    }
    
    // Pitches this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const pitchesThisMonth = pitches.filter(p => 
      p.createdAt.toMillis() >= firstDayOfMonth.getTime()
    ).length;

    return {
      organizationId,
      programId,
      totalParticipants: participants.length,
      activeParticipants,
      inactiveParticipants,
      totalPitches: pitches.length,
      pitchesThisMonth,
      averageScore,
      scoreDistribution,
      categoryDistribution,
      pitchTrend,
      computedAt: Timestamp.now(),
    };
  }
}

export const analyticsService = new AnalyticsService();
