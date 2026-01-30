'use client';

import { Organization, OrganizationAnalytics } from '@/lib/organizationTypes';

interface Props {
  organization: Organization;
  analytics: OrganizationAnalytics | null;
}

export default function OrganizationOverview({ organization, analytics }: Props) {
  return (
    <div className="space-y-8">
      {/* Organization Info */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <h2 className="text-xl font-medium text-white mb-6">Organization Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Contact Name</p>
            <p className="text-base text-white">{organization.contactName}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Contact Email</p>
            <p className="text-base text-white">{organization.contactEmail}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-block px-3 py-1 text-xs rounded-full ${
              organization.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {organization.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Type</p>
            <p className="text-base text-white">
              {organization.type.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Plan */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <h2 className="text-xl font-medium text-white mb-6">Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Plan ID</p>
            <p className="text-base text-white">{organization.subscriptionPlan.planId}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Participant Limit</p>
            <p className="text-base text-white">{organization.subscriptionPlan.participantLimit}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Pitches Per Month</p>
            <p className="text-base text-white">{organization.subscriptionPlan.pitchesPerMonth}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Total Participants</p>
            <p className="text-4xl font-light text-white">{analytics.totalParticipants}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Active Participants</p>
            <p className="text-4xl font-light text-emerald-400">{analytics.activeParticipants}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Total Pitches</p>
            <p className="text-4xl font-light text-white">{analytics.totalPitches}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Average Score</p>
            <p className="text-4xl font-light text-white">{analytics.averageScore.toFixed(1)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
