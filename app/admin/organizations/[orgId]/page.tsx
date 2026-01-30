'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, Program, UsageMetrics, OrganizationAnalytics } from '@/lib/organizationTypes';
import OrganizationOverview from '@/components/admin/OrganizationOverview';
import ProgramsList from '@/components/admin/ProgramsList';
import ParticipantsList from '@/components/admin/ParticipantsList';
import InvitationManager from '@/components/admin/InvitationManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { motion } from 'framer-motion';

type Tab = 'overview' | 'programs' | 'participants' | 'invitations' | 'analytics';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orgId = params.orgId as string;
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [participants, setParticipants] = useState<UsageMetrics[]>([]);
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [orgId, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load organization
      const orgRes = await fetch(`/api/organizations/${orgId}`);
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrganization(orgData);
      }
      
      // Load programs
      const programsRes = await fetch(`/api/organizations/${orgId}/programs`);
      if (programsRes.ok) {
        const programsData = await programsRes.json();
        setPrograms(programsData);
      }
      
      // Load participants
      const participantsRes = await fetch(`/api/organizations/${orgId}/participants`);
      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData);
      }
      
      // Load analytics
      const analyticsRes = await fetch(`/api/organizations/${orgId}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-sm">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-medium text-white mb-2">Organization Not Found</h2>
          <p className="text-zinc-400">The organization you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'programs', label: 'Programs' },
    { id: 'participants', label: 'Participants' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight text-white">{organization.name}</h1>
          <p className="mt-2 text-zinc-400 uppercase tracking-wider text-sm">{organization.type.replace('_', ' ')}</p>
        </div>

        {/* Tabs */}
        <div className="sticky top-4 z-30">
          <div className="flex gap-2 p-2 bg-[#0A0A0A] border border-white/5 rounded-3xl backdrop-blur-xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OrganizationOverview 
              organization={organization} 
              analytics={analytics}
            />
          )}
          
          {activeTab === 'programs' && (
            <ProgramsList 
              programs={programs} 
              organizationId={orgId}
              onUpdate={loadData}
            />
          )}
          
          {activeTab === 'participants' && (
            <ParticipantsList 
              participants={participants}
              programs={programs}
              organizationId={orgId}
            />
          )}
          
          {activeTab === 'invitations' && (
            <InvitationManager 
              organizationId={orgId}
              programs={programs}
              onUpdate={loadData}
            />
          )}
          
          {activeTab === 'analytics' && analytics && (
            <AnalyticsDashboard 
              analytics={analytics}
              programs={programs}
              organizationId={orgId}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
