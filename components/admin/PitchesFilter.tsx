'use client';

import { useState, useEffect } from 'react';
import { EnhancedPitchSubmission, Program } from '@/lib/organizationTypes';
import { motion } from 'framer-motion';

interface Props {
  organizationId: string;
  programs: Program[];
}

export default function PitchesFilter({ organizationId, programs }: Props) {
  const [pitches, setPitches] = useState<EnhancedPitchSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    programId: '',
    scoreThreshold: '',
    scoreField: 'overall' as 'overall' | 'market' | 'team' | 'innovation',
    categories: [] as string[],
  });

  const availableCategories = [
    'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-commerce',
    'SaaS', 'AI/ML', 'IoT', 'Blockchain', 'Other'
  ];

  const loadPitches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.programId) params.append('programId', filters.programId);
      if (filters.scoreThreshold) {
        params.append('scoreThreshold', filters.scoreThreshold);
        params.append('scoreField', filters.scoreField);
      }
      if (filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }

      const response = await fetch(
        `/api/organizations/${organizationId}/pitches?${params.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPitches(data);
      }
    } catch (error) {
      console.error('Error loading pitches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPitches();
  }, [organizationId]);

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-medium text-white">Filter Pitches</h2>

      {/* Filters */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Program
            </label>
            <select
              value={filters.programId}
              onChange={(e) => setFilters({ ...filters, programId: e.target.value })}
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Score Field
            </label>
            <select
              value={filters.scoreField}
              onChange={(e) => setFilters({ ...filters, scoreField: e.target.value as any })}
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
            >
              <option value="overall">Overall Score</option>
              <option value="market">Market Score</option>
              <option value="team">Team Score</option>
              <option value="innovation">Innovation Score</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Minimum Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.scoreThreshold}
              onChange={(e) => setFilters({ ...filters, scoreThreshold: e.target.value })}
              placeholder="e.g., 70"
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filters.categories.includes(category)
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={loadPitches}
          disabled={loading}
          className="w-full px-4 py-3 bg-white text-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>

      {/* Results */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">
            Results ({pitches.length} pitches)
          </h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {pitches.map((pitch, index) => (
            <motion.div
              key={pitch.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-sm text-zinc-500 mb-2">
                    {pitch.createdAt?.toMillis 
                      ? new Date(pitch.createdAt.toMillis()).toLocaleDateString()
                      : new Date(pitch.createdAt).toLocaleDateString()
                    }
                  </p>
                  <p className="text-white line-clamp-2">{pitch.transcript.substring(0, 200)}...</p>
                </div>
                <div className="ml-6 text-right">
                  {pitch.scores && (
                    <div className="text-3xl font-light text-white">
                      {pitch.scores[filters.scoreField].toFixed(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {pitch.domainCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-white/10 text-zinc-400 text-xs rounded-full border border-white/10"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {pitches.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-zinc-400">No pitches found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
