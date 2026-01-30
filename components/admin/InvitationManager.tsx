'use client';

import { useState, useEffect } from 'react';
import { Invitation, Program } from '@/lib/organizationTypes';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  organizationId: string;
  programs: Program[];
  onUpdate: () => void;
}

export default function InvitationManager({ organizationId, programs, onUpdate }: Props) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentInviteLink, setCurrentInviteLink] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    programId: '',
  });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, [organizationId]);

  const loadInvitations = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          programId: formData.programId || undefined,
          invitedBy: 'current-user-id',
        }),
      });

      if (response.ok) {
        const newInvitation = await response.json();
        setShowCreateForm(false);
        setFormData({ email: '', programId: '' });
        loadInvitations();
        onUpdate();
        
        const inviteLink = `${window.location.origin}/invite/${newInvitation.token}`;
        setCurrentInviteLink(inviteLink);
        setCurrentEmail(formData.email);
        setShowLinkModal(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'revoked': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-zinc-400 text-sm">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-white">Invitations</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Send Invitation'}
        </button>
      </div>

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-white">✅ Invitation Created!</h3>
                    <p className="text-sm text-zinc-400 mt-1">Share this link with {currentEmail}</p>
                  </div>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Invitation Link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentInviteLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-transparent border border-white/10 rounded-xl text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentInviteLink);
                        alert('✅ Link copied!');
                      }}
                      className="px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 whitespace-nowrap font-medium"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-zinc-300">
                    <strong>Note:</strong> This link only works with email <strong>{currentEmail}</strong>.
                    If the user logs in with a different email, the invitation will not be accepted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentInviteLink);
                      setShowLinkModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium"
                  >
                    Copy & Close
                  </button>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-3 border border-white/10 text-white rounded-2xl hover:bg-white/5 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-6">Send New Invitation</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                placeholder="participant@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Program (Optional)
              </label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
              >
                <option value="">No specific program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full px-4 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 font-medium transition-colors"
            >
              {creating ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Invitations Table */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invitations.map((invitation) => {
                const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${invitation.token}`;
                
                return (
                  <tr key={invitation.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{invitation.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {invitation.programId 
                          ? programs.find(p => p.id === invitation.programId)?.name || 'Unknown'
                          : 'No program'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {invitation.invitedAt?.toMillis 
                          ? new Date(invitation.invitedAt.toMillis()).toLocaleDateString()
                          : new Date(invitation.invitedAt).toLocaleDateString()
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {invitation.expiresAt?.toMillis 
                          ? new Date(invitation.expiresAt.toMillis()).toLocaleDateString()
                          : new Date(invitation.expiresAt).toLocaleDateString()
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          alert('✅ Link copied!');
                        }}
                        className="text-sm text-white hover:text-zinc-300 font-medium flex items-center gap-1"
                        title={inviteLink}
                      >
                        📋 Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {invitations.length === 0 && !showCreateForm && (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">✉️</div>
          <p className="text-zinc-400">No invitations yet. Send your first invitation to get started.</p>
        </div>
      )}
    </div>
  );
}
