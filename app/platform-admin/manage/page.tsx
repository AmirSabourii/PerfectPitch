'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ManagePlatformAdminsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<string[]>([]);
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
        
        // Load admins list
        // TODO: Implement API endpoint to list admins
      }
    } catch (error) {
      console.error('Error checking access:', error);
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

  if (!isPlatformAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Platform Admins</h1>
          <p className="mt-2 text-gray-600">Add or remove platform administrators</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Platform Admins</h2>
          <p className="text-gray-600">Feature coming soon...</p>
        </div>
      </div>
    </div>
  );
}
