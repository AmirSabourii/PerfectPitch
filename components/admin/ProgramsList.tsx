'use client';

import { useState } from 'react';
import { Program } from '@/lib/organizationTypes';
import { motion } from 'framer-motion';

interface Props {
  programs: Program[];
  organizationId: string;
  onUpdate: () => void;
}

export default function ProgramsList({ programs, organizationId, onUpdate }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: 'current-user-id',
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ name: '', description: '', startDate: '', endDate: '' });
        onUpdate();
      }
    } catch (error) {
      console.error('Error creating program:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-white">Programs</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 font-medium transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create Program'}
        </button>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-6">Create New Program</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Program Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full px-4 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 font-medium transition-colors"
            >
              {creating ? 'Creating...' : 'Create Program'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-white">{program.name}</h3>
              <span className={`px-3 py-1 text-xs rounded-full ${
                program.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : program.status === 'completed'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
              }`}>
                {program.status}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-6">{program.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Participants:</span>
                <span className="text-white">{program.participantIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Start:</span>
                <span className="text-white">
                  {program.startDate?.toMillis 
                    ? new Date(program.startDate.toMillis()).toLocaleDateString()
                    : new Date(program.startDate).toLocaleDateString()
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">End:</span>
                <span className="text-white">
                  {program.endDate?.toMillis 
                    ? new Date(program.endDate.toMillis()).toLocaleDateString()
                    : new Date(program.endDate).toLocaleDateString()
                  }
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {programs.length === 0 && !showCreateForm && (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-zinc-400">No programs yet. Create your first program to get started.</p>
        </div>
      )}
    </div>
  );
}
