'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Organization } from '@/lib/organizationTypes';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }
    
    checkPlatformAdmin();
    loadOrganizations();
  }, [user]);

  const checkPlatformAdmin = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/platform-admin/check?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setIsPlatformAdmin(data.isPlatformAdmin);
      }
    } catch (error) {
      console.error('Error checking platform admin:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      if (!user) return;
      
      const response = await fetch(`/api/organizations/my-organizations?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading organizations:', error);
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-medium tracking-tight text-white">Organizations</h1>
              {isPlatformAdmin && (
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-xs rounded-full uppercase tracking-wider">
                  Platform Admin
                </span>
              )}
            </div>
            <p className="mt-2 text-zinc-400">Manage your organizations and programs</p>
          </div>
          {isPlatformAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/create-organization')}
              className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium transition-colors"
            >
              + New Organization
            </motion.button>
          )}
        </div>

        {organizations.length === 0 ? (
          <div className="space-y-6">
            {!isPlatformAdmin && (
              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  🔐 Not a Platform Admin?
                </h3>
                <p className="text-zinc-400 mb-4">
                  If you&apos;re the first user, you need to setup platform admin access first.
                </p>
                <button
                  onClick={() => router.push('/platform-admin/setup')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-colors"
                >
                  Setup Platform Admin
                </button>
              </div>
            )}

            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-medium text-white mb-2">No Organizations</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                {isPlatformAdmin 
                  ? "You don&apos;t have any organizations yet. Create one to get started."
                  : "You don&apos;t have access to any organizations yet. Contact a platform admin to get access."
                }
              </p>
              
              {isPlatformAdmin && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/admin/quick-setup')}
                    className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium transition-colors"
                  >
                    🚀 Quick Setup (Demo)
                  </button>
                  <button
                    onClick={() => router.push('/admin/create-organization')}
                    className="px-6 py-3 border border-white/10 hover:border-white/20 text-white rounded-2xl font-medium transition-colors"
                  >
                    Create Custom Organization
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
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
                  <span className="text-sm text-zinc-500">{org.adminIds.length} admins</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
