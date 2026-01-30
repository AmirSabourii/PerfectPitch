'use client';

import { useState } from 'react';
import { OrganizationAnalytics, Program } from '@/lib/organizationTypes';
import { motion } from 'framer-motion';

interface Props {
  analytics: OrganizationAnalytics;
  programs: Program[];
  organizationId: string;
}

export default function AnalyticsDashboard({ analytics, programs, organizationId }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-white">Analytics</h2>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
        >
          <option value="all">All Programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Total Participants</p>
          <p className="text-4xl font-light text-white">{analytics.totalParticipants}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {analytics.activeParticipants} active, {analytics.inactiveParticipants} inactive
          </p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Total Pitches</p>
          <p className="text-4xl font-light text-white">{analytics.totalPitches}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {analytics.pitchesThisMonth} this month
          </p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Average Score</p>
          <p className="text-4xl font-light text-white">{analytics.averageScore.toFixed(1)}</p>
          <p className="text-xs text-zinc-500 mt-2">Out of 100</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Engagement Rate</p>
          <p className="text-4xl font-light text-white">
            {analytics.totalParticipants > 0 
              ? ((analytics.activeParticipants / analytics.totalParticipants) * 100).toFixed(0)
              : 0
            }%
          </p>
          <p className="text-xs text-zinc-500 mt-2">Active participants</p>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Score Distribution</h3>
        <div className="space-y-4">
          {analytics.scoreDistribution.map((dist, index) => (
            <div key={dist.range}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">{dist.range}</span>
                <span className="text-white">{dist.count} pitches</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.totalPitches > 0 ? (dist.count / analytics.totalPitches) * 100 : 0}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-white/50 to-white/20 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Domain Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.categoryDistribution.map((cat) => (
            <div key={cat.category} className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-zinc-400 uppercase tracking-wider">{cat.category}</span>
                <span className="text-xs text-zinc-500">{cat.percentage.toFixed(1)}%</span>
              </div>
              <p className="text-3xl font-light text-white">{cat.count}</p>
              <p className="text-xs text-zinc-500 mt-1">pitches</p>
            </div>
          ))}
        </div>
        {analytics.categoryDistribution.length === 0 && (
          <p className="text-zinc-500 text-center py-4">No category data available</p>
        )}
      </div>

      {/* Pitch Trend */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Pitch Submissions (Last 30 Days)</h3>
        <div className="h-64 flex items-end space-x-1">
          {analytics.pitchTrend.map((trend, index) => {
            const maxCount = Math.max(...analytics.pitchTrend.map(t => t.count), 1);
            const height = (trend.count / maxCount) * 100;
            return (
              <div
                key={index}
                className="flex-1 bg-white/20 rounded-t hover:bg-white/30 transition-colors relative group"
                style={{ height: `${height}%`, minHeight: trend.count > 0 ? '4px' : '0' }}
                title={`${trend.date}: ${trend.count} pitches`}
              >
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {trend.count}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-zinc-500 text-center">
          Hover over bars to see details
        </div>
      </div>
    </div>
  );
}
