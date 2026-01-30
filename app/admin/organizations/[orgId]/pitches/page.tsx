'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Program } from '@/lib/organizationTypes';
import PitchesFilter from '@/components/admin/PitchesFilter';

export default function PitchesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orgId = params.orgId as string;
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }
    loadPrograms();
  }, [orgId, user]);

  const loadPrograms = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/programs`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchesFilter organizationId={orgId} programs={programs} />
      </div>
    </div>
  );
}
