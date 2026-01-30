'use client';

import { useState } from 'react';
import { UsageMetrics, Program } from '@/lib/organizationTypes';

interface Props {
  participants: UsageMetrics[];
  programs: Program[];
  organizationId: string;
}

export default function ParticipantsList({ participants, programs, organizationId }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = participants.filter(p => {
    const matchesProgram = selectedProgram === 'all' || p.programIds.includes(selectedProgram);
    const matchesSearch = searchTerm === '' || 
      p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProgram && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-white">Participants</h2>
      </div>

      {/* Filters */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
              Filter by Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-2xl text-white focus:border-white/20 focus:outline-none"
            >
              <option value="all">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Total Pitches
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Last Pitch
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs text-zinc-500 uppercase tracking-wider">
                  Programs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredParticipants.map((participant) => (
                <tr key={participant.userId} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-white">
                        {participant.userName || 'Unknown'}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {participant.userEmail || participant.userId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{participant.totalPitches}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {participant.lastPitchDate 
                        ? (participant.lastPitchDate?.toMillis 
                            ? new Date(participant.lastPitchDate.toMillis()).toLocaleDateString()
                            : new Date(participant.lastPitchDate).toLocaleDateString())
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {participant.joinedDate?.toMillis 
                        ? new Date(participant.joinedDate.toMillis()).toLocaleDateString()
                        : new Date(participant.joinedDate).toLocaleDateString()
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {participant.programIds.length} program(s)
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredParticipants.length === 0 && (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-zinc-400">No participants found.</p>
        </div>
      )}
    </div>
  );
}
