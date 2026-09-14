'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCheck,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { AttendanceStatus } from '@/types/fest';
import { Badge } from '../ui/Badge';

export function AttendanceLedger() {
  const store = useFestStore();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const attendanceList = store.getAttendance();

  const [selectedCompId, setSelectedCompId] = useState<string>(
    competitions[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const activeComp = competitions.find((c) => c.id === selectedCompId);
  const compRegs = registrations.filter((r) => r.competitionId === selectedCompId);

  // Toggle attendance using store.markAttendance(comp.id, studentId, chestNumber, status)
  const handleToggleAttendance = (studentId: string, chestNumber: string, currentStatus?: AttendanceStatus) => {
    if (!selectedCompId) return;
    const nextStatus: AttendanceStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    store.markAttendance(selectedCompId, studentId, chestNumber, nextStatus);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!selectedCompId) return;
    const studentIds = compRegs.map((r) => r.studentId);
    store.bulkMarkAttendance(selectedCompId, studentIds, status);
  };

  const filteredRegs = compRegs.filter((r) => {
    return (
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.chestNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  const presentCount = compRegs.filter((reg) => {
    const att = attendanceList.find(
      (a) => a.competitionId === selectedCompId && a.studentId === reg.studentId
    );
    return att?.status === 'Present';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            STAGE ATTENDANCE LEDGER
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Real-time digital roll call for stage coordinators and green-room managers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('Present')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Select Competition Bar */}
      <div className="p-5 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">
            ACTIVE PROGRAMME / STAGE
          </label>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full text-base sm:text-lg font-bold bg-transparent text-neutral-950 dark:text-white focus:outline-none cursor-pointer"
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id} className="text-black dark:text-white bg-white dark:bg-neutral-900">
                {c.name} — {c.categoryName} ({c.stage} • {c.status})
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold">{presentCount}</span> Present
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold">{compRegs.length - presentCount}</span> Absent
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search participant by name or chest code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('Present')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>All Present</span>
          </button>
          <button
            onClick={() => handleMarkAll('Absent')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>All Absent</span>
          </button>
        </div>
      </div>

      {/* Roll Call Cards Grid */}
      {filteredRegs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-xs text-neutral-500">
          No participants found matching &ldquo;{search}&rdquo; for this programme.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredRegs.map((reg) => {
            const att = attendanceList.find(
              (a) => a.competitionId === selectedCompId && a.studentId === reg.studentId
            );
            const isPresent = att?.status === 'Present';

            return (
              <div
                key={reg.id}
                onClick={() => handleToggleAttendance(reg.studentId, reg.chestNumber, att?.status)}
                className={`p-4 sm:p-5 rounded-[22px] sm:rounded-[24px] border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  isPresent
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-xs tracking-wider">
                    {reg.chestNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                      {reg.studentName}
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono">{reg.teamName}</p>
                  </div>
                </div>

                <div>
                  {isPresent ? (
                    <span className="flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white dark:text-black" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono text-neutral-400">
                      <XCircle className="w-5 h-5 text-neutral-300 dark:text-neutral-700" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
