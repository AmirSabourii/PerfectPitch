'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [orgId, setOrgId] = useState('');
  const [programId, setProgramId] = useState('');

  const createDemoOrganization = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setCreating(true);
    try {
      // Create organization
      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Organization',
          type: 'accelerator',
          contactName: user.displayName || 'Admin User',
          contactEmail: user.email || 'admin@example.com',
          subscriptionPlan: {
            planId: 'demo',
            participantLimit: 100,
            pitchesPerMonth: 1000,
            features: ['analytics', 'programs', 'invitations'],
          },
          adminIds: [user.uid],
        }),
      });

      if (!orgResponse.ok) {
        throw new Error('Failed to create organization');
      }

      const org = await orgResponse.json();
      setOrgId(org.id);
      setStep(2);

      // Create demo program
      const programResponse = await fetch(`/api/organizations/${org.id}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Bootcamp 2024',
          description: 'A demo bootcamp for testing',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: user.uid,
        }),
      });

      if (programResponse.ok) {
        const program = await programResponse.json();
        setProgramId(program.id);
      }

      setStep(3);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/admin/organizations/${org.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating demo:', error);
      alert('Failed to create demo organization');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to create an organization</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Setup</h1>
          <p className="text-gray-600 mb-8">
            Create a demo organization with sample data to get started quickly
          </p>

          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  What will be created:
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>A demo organization named &quot;Demo Organization&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>A demo program named &quot;Demo Bootcamp 2024&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>You will be set as the admin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>100 participant limit, 1000 pitches/month</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is for testing purposes. You can create a real organization later.
                </p>
              </div>

              <button
                onClick={createDemoOrganization}
                disabled={creating}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {creating ? 'Creating...' : 'Create Demo Organization'}
              </button>

              <button
                onClick={() => router.push('/admin/create-organization')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Create Custom Organization Instead
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Organization...</h3>
              <p className="text-gray-600">Setting up your demo environment</p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-4">Your demo organization has been created</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Organization ID:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                  {orgId}
                </code>
              </div>
              <p className="text-sm text-gray-500">Redirecting to your organization...</p>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps:</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>Create your organization (demo or custom)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>Create programs for different cohorts/bootcamps</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Invite participants via email</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>Participants submit pitches with organization tags</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">5.</span>
                <span>View analytics and filter pitches by score/category</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
