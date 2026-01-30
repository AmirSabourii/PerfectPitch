'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PlatformAdminSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [setupKey, setSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/platform-admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          setupKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (err) {
      setError('An error occurred during setup');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 max-w-md text-center"
        >
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-medium text-white mb-4">Login Required</h2>
          <p className="text-zinc-400 mb-6">Please login to setup platform admin</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium w-full"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-white mb-2">Success!</h2>
          <p className="text-zinc-400 mb-4">You are now a Platform Admin</p>
          <p className="text-sm text-zinc-500">Redirecting to admin panel...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] py-12">
      <div className="max-w-2xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8"
        >
          <h1 className="text-4xl font-medium tracking-tight text-white mb-2">Platform Admin Setup</h1>
          <p className="text-zinc-400 mb-8">
            Setup the first platform administrator account
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2">⚠️ Important:</h3>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• This page can only be used ONCE to create the first platform admin</li>
              <li>• After setup, additional admins must be added through the admin panel</li>
              <li>• Keep your setup key secure</li>
            </ul>
          </div>

          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Your User ID
              </label>
              <input
                type="text"
                value={user.uid}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500"
              />
              <p className="text-xs text-zinc-500 mt-1">This is your Firebase user ID</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Your Email
              </label>
              <input
                type="text"
                value={user.email || 'No email'}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Setup Key
              </label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Enter setup key"
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">
                Default key for development: <code className="bg-white/10 px-2 py-0.5 rounded">demo-setup-key-123</code>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Setting up...' : 'Become Platform Admin'}
            </button>
          </form>

          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-3">What is Platform Admin?</h3>
            <div className="space-y-3 text-sm text-zinc-300">
              <div>
                <p className="text-white font-medium mb-1">Platform Admin can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-zinc-400">
                  <li>Create new organizations</li>
                  <li>Assign organization admins</li>
                  <li>Manage all organizations</li>
                  <li>Add/remove other platform admins</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Organization Admin can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-zinc-400">
                  <li>Manage their own organization</li>
                  <li>Create programs</li>
                  <li>Invite participants</li>
                  <li>View analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
