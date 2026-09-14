'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Printer,
  Radio,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  Eye,
  AlertCircle,
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  Mic,
  FileText,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Competition, CompetitionStatus, StageType, getCompetitionStageType } from '@/types/fest';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface ScheduleTimelineProps {
  onNavigateToJudging?: (comp: Competition) => void;
  onNavigateToAttendance?: (comp: Competition) => void;
}

export function ScheduleTimeline({
  onNavigateToJudging,
  onNavigateToAttendance,
}: ScheduleTimelineProps) {
  const store = useFestStore();
  const session = store.getSession();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const students = store.getStudents();
  const attendanceList = store.getAttendance();

  // Primary Separate Tab: ALL | On Stage | Off Stage
  const [stageTypeFilter, setStageTypeFilter] = useState<'ALL' | 'On Stage' | 'Off Stage'>('ALL');

  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingComp, setViewingComp] = useState<Competition | null>(null);

  const onStageCount = competitions.filter((c) => getCompetitionStageType(c) === 'On Stage').length;
  const offStageCount = competitions.filter((c) => getCompetitionStageType(c) === 'Off Stage').length;

  // Extract unique stages based on current stageTypeFilter (only valid stages)
  const stages = Array.from(
    new Set(
      competitions
        .filter((c) => stageTypeFilter === 'ALL' || getCompetitionStageType(c) === stageTypeFilter)
        .map((c) => c.stage)
        .filter((s): s is string => Boolean(s && s.trim()))
    )
  );

  const filteredCompetitions = competitions.filter((c) => {
    const stageTypeMatch =
      stageTypeFilter === 'ALL' || getCompetitionStageType(c) === stageTypeFilter;
    const stageMatch = selectedStage === 'ALL' || c.stage === selectedStage;
    const statusMatch = selectedStatus === 'ALL' || c.status === selectedStatus;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.stage.toLowerCase().includes(q) ||
      c.categoryName.toLowerCase().includes(q) ||
      (c.scheduledTime && c.scheduledTime.toLowerCase().includes(q));
    return stageTypeMatch && stageMatch && statusMatch && searchMatch;
  });

  const liveCount = filteredCompetitions.filter((c) => c.status === 'Live').length;
  const upcomingCount = filteredCompetitions.filter((c) => c.status === 'Upcoming').length;
  const completedCount = filteredCompetitions.filter((c) => c.status === 'Completed').length;

  const handleStageTypeChange = (type: 'ALL' | 'On Stage' | 'Off Stage') => {
    setStageTypeFilter(type);
    setSelectedStage('ALL');
  };

  const handleStatusChange = (comp: Competition, newStatus: CompetitionStatus) => {
    store.updateCompetition(comp.id, { status: newStatus });
  };

  // Enrolled participants for viewed competition modal
  const viewingCompRegs = viewingComp
    ? registrations.filter((r) => r.competitionId === viewingComp.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
              PROGRAMME SCHEDULE
            </h2>
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-600 dark:text-red-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                {liveCount} LIVE NOW
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Real-time venue stages, chronological timelines, and participant tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Schedule</span>
          </button>
        </div>
      </div>

      {/* Top Prominent Separate Tab Bar for On Stage & Off Stage */}
      <div className="p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* ALL TAB */}
          <button
            type="button"
            onClick={() => handleStageTypeChange('ALL')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageTypeFilter === 'ALL'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">All Programmes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageTypeFilter === 'ALL'
                  ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {competitions.length}
            </span>
          </button>

          {/* ON STAGE TAB */}
          <button
            type="button"
            onClick={() => handleStageTypeChange('On Stage')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageTypeFilter === 'On Stage'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span className="truncate">On Stage</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageTypeFilter === 'On Stage'
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {onStageCount}
            </span>
          </button>

          {/* OFF STAGE TAB */}
          <button
            type="button"
            onClick={() => handleStageTypeChange('Off Stage')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageTypeFilter === 'Off Stage'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">Off Stage</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageTypeFilter === 'Off Stage'
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {offStageCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search schedule by programme, stage, category, or time..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            All ({competitions.length})
          </button>
          <button
            onClick={() => setSelectedStatus('Live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'Live'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Live ({liveCount})
          </button>
          <button
            onClick={() => setSelectedStatus('Upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'Upcoming'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setSelectedStatus('Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'Completed'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Stage Filter Chips - Only show when on-stage or all and valid stages exist */}
      {stageTypeFilter !== 'Off Stage' && stages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedStage('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStage === 'ALL'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            All Venues ({competitions.filter((c) => getCompetitionStageType(c) === 'On Stage').length})
          </button>
          {stages.map((st) => {
            const stageComps = competitions.filter((c) => c.stage === st);
            const stageLive = stageComps.some((c) => c.status === 'Live');
            return (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStage === st
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {stageLive && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
                <span>{st}</span>
                <span className="text-[10px] opacity-70 font-mono">({stageComps.length})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline Layout */}
      {filteredCompetitions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10">
          <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            No programmes match your filter
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try resetting your stage, status, or search keywords to view the complete festival schedule.
          </p>
          <button
            onClick={() => {
              setStageTypeFilter('ALL');
              setSelectedStage('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="relative pl-5 sm:pl-8 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-6 sm:space-y-8 my-4 sm:my-6">
          {filteredCompetitions.map((comp) => {
            const compRegs = registrations.filter((r) => r.competitionId === comp.id);
            const isLive = comp.status === 'Live';
            const compStageType = getCompetitionStageType(comp);

            return (
              <div key={comp.id} className="relative group">
                {/* Bullet on timeline */}
                <div
                  className={`absolute -left-[27px] sm:-left-[39px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-white dark:bg-[#0A0A0A] ${
                    isLive
                      ? 'border-red-500 ring-4 ring-red-100 dark:ring-red-950/50 scale-110'
                      : comp.status === 'Completed'
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-neutral-400'
                  }`}
                />

                {/* Card */}
                <div
                  className={`p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#121212] border shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all ${
                    isLive
                      ? 'border-red-500/40 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm sm:text-base text-neutral-950 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        {comp.scheduledTime || comp.startTime || '10:00 AM'}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        ({comp.durationMinutes || 10} min)
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          compStageType === 'On Stage'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
                        }`}
                      >
                        {compStageType === 'On Stage' ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {compStageType}
                      </span>
                      <Badge variant="category">{comp.categoryName}</Badge>
                      <Badge variant="outline">{comp.type} Event</Badge>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge
                        variant={
                          isLive ? 'live' : comp.status === 'Completed' ? 'completed' : 'upcoming'
                        }
                        pulse={isLive}
                      >
                        {comp.status}
                      </Badge>

                      {/* Admin Quick Status changer */}
                      {session.role === 'ADMIN' && (
                        <select
                          value={comp.status}
                          onChange={(e) =>
                            handleStatusChange(comp, e.target.value as CompetitionStatus)
                          }
                          className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 cursor-pointer text-neutral-700 dark:text-neutral-300"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Live">Live</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-neutral-900 dark:text-white uppercase mt-1">
                    {comp.name}
                  </h3>

                  {comp.rules && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                      {comp.rules}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {compStageType === 'On Stage' && (
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          {comp.stage || 'Main Stage'}
                        </span>
                      </span>
                    )}
                    <button
                      onClick={() => setViewingComp(comp)}
                      className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{compRegs.length} Participants Enrolled</span>
                    </button>
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      {comp.firstPlacePoints} / {comp.secondPlacePoints} / {comp.thirdPlacePoints} PTS
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingComp(comp)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Participants ({compRegs.length})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onNavigateToJudging && (
                        <button
                          onClick={() => onNavigateToJudging(comp)}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Radio className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Judge Panel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Programme Participants Dossier */}
      {viewingComp && (
        <Modal
          isOpen={true}
          onClose={() => setViewingComp(null)}
          title={viewingComp.name}
          subtitle={`Schedule: ${viewingComp.scheduledTime || '10:00 AM'} • Venue: ${viewingComp.stage} • ${viewingComp.categoryName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 block">ENROLLED</span>
                <span className="text-base font-bold text-neutral-900 dark:text-white">
                  {viewingCompRegs.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 block">STATUS</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {viewingComp.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 block">DURATION</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {viewingComp.durationMinutes || 10} Mins
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 block">TOP POINTS</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  1st: {viewingComp.firstPlacePoints}
                </span>
              </div>
            </div>

            {viewingComp.rules && (
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-bold text-neutral-900 dark:text-white block mb-1">
                  Evaluation Rules & Criteria:
                </span>
                {viewingComp.rules}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Enrolled Participants ({viewingCompRegs.length})
              </h4>

              {viewingCompRegs.length === 0 ? (
                <p className="text-xs text-neutral-400 p-4 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  No participants registered for this programme yet.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-black/10 dark:border-white/10 p-2">
                  {viewingCompRegs.map((reg) => {
                    const student = students.find((s) => s.id === reg.studentId);
                    const att = attendanceList.find(
                      (a) => a.studentId === reg.studentId && a.competitionId === viewingComp.id
                    );

                    return (
                      <div
                        key={reg.id}
                        className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-[11px]">
                            {student?.chestNumber || reg.chestNumber}
                          </span>
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              {student?.fullName || reg.studentName}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {student?.admissionNo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="team">{student?.teamName || reg.teamName}</Badge>
                          {att && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                att.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              }`}
                            >
                              {att.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => setViewingComp(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>

              {onNavigateToJudging && (
                <button
                  onClick={() => {
                    const c = viewingComp;
                    setViewingComp(null);
                    onNavigateToJudging(c);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Open Judging for this Programme</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
