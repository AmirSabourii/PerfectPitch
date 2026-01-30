'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalPitches: number;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  participantCount?: number;
  pitchCount?: number;
}

export default function PlatformAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/platform-admin/login');
      return;
    }
    
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/platform-admin/check?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setIsPlatformAdmin(data.isPlatformAdmin);
        
        if (!data.isPlatformAdmin) {
          router.push('/admin');
          return;
        }
        
        // Load platform stats and organizations
        await loadData();
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load all organizations
      const orgsResponse = await fetch(`/api/organizations/my-organizations?userId=${user?.uid}`);
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData);
        
        // Calculate stats
        setStats({
          totalOrganizations: orgsData.length,
          totalUsers: orgsData.reduce((sum: number, org: any) => sum + (org.adminIds?.length || 0), 0),
          totalPitches: 0, // TODO: Aggregate from all organizations
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-medium tracking-tight text-white">Platform Admin</h1>
            <p className="mt-2 text-zinc-400">Manage all organizations and system settings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/create-organization')}
            className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium transition-colors"
          >
            + New Organization
          </motion.button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
              <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Organizations</p>
              <p className="text-6xl font-light text-white">{stats.totalOrganizations}</p>
              <p className="text-sm text-zinc-400 mt-2">Active organizations</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
              <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Users</p>
              <p className="text-6xl font-light text-white">{stats.totalUsers}</p>
              <p className="text-sm text-zinc-400 mt-2">Total platform users</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
              <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Pitches</p>
              <p className="text-6xl font-light text-white">{stats.totalPitches}</p>
              <p className="text-sm text-zinc-400 mt-2">Total submissions</p>
            </div>
          </div>
        )}

        {/* Organizations Grid */}
        <div>
          <h2 className="text-2xl font-medium text-white mb-6">All Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-3xl p-6 cursor-pointer transition-all duration-300"
                onClick={() => router.push(`/admin/organizations/${org.id}`)}
              >
                <h3 className="text-lg font-medium text-white mb-2">{org.name}</h3>
                <p className="text-sm text-zinc-500 mb-6 uppercase tracking-wider">{org.type.replace('_', ' ')}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    org.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {org.status}
                  </span>
                  <span className="text-sm text-zinc-500">{org.participantCount || 0} users</span>
                </div>
              </motion.div>
            ))}
          </div>

          {organizations.length === 0 && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-zinc-400 mb-6">No organizations yet. Create your first organization to get started.</p>
              <button
                onClick={() => router.push('/admin/create-organization')}
                className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium"
              >
                Create Organization
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
