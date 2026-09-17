'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Users,
  Download,
  Flame,
  Search,
  ChevronRight,
  Crown,
  Sparkles,
  Star,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Mic,
  BookOpen,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { exportToCsv } from '@/lib/utils';
import { Team, Student } from '@/types/fest';

export function ScoreboardView() {
  const store = useFestStore();
  const teams = store.getTeams();
  const students = store.getStudents();
  const competitions = store.getCompetitions();
  const results = store.getResults();

  const [activeTab, setActiveTab] = useState<'house' | 'individual'>('house');
  const [individualStageTab, setIndividualStageTab] = useState<'overall' | 'onstage' | 'offstage'>('overall');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  // Sorted teams by points (descending)
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
    return b.silverCount - a.silverCount;
  });

  const team1 = sortedTeams[0];
  const team2 = sortedTeams[1];
  const team3 = sortedTeams[2];

  // Top Individual Students sorted by selected Stage Tab (Overall / On-Stage / Off-Stage)
  const sortedStudents = [...students].sort((a, b) => {
    if (individualStageTab === 'onstage') {
      const diff = (b.onStagePoints ?? 0) - (a.onStagePoints ?? 0);
      if (diff !== 0) return diff;
      return b.totalPoints - a.totalPoints;
    }
    if (individualStageTab === 'offstage') {
      const diff = (b.offStagePoints ?? 0) - (a.offStagePoints ?? 0);
      if (diff !== 0) return diff;
      return b.totalPoints - a.totalPoints;
    }
    return b.totalPoints - a.totalPoints;
  });

  // Filtered lists
  const filteredTeams = sortedTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      t.captain.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = sortedStudents.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.chestNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.teamName.toLowerCase().includes(search.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      (selectedCategory === 'junior' && s.categoryName.toLowerCase().includes('junior')) ||
      (selectedCategory === 'senior' && s.categoryName.toLowerCase().includes('senior'));

    return matchesSearch && matchesCat;
  });

  const handleExportScoreboard = () => {
    if (activeTab === 'house') {
      const rows = sortedTeams.map((t, idx) => ({
        Rank: idx + 1,
        House: t.name,
        Code: t.shortCode,
        TotalPoints: t.points,
        OnStagePoints: t.onStagePoints ?? 0,
        OffStagePoints: t.offStagePoints ?? 0,
        Students: t.studentCount,
        Captain: t.captain,
      }));
      exportToCsv('Fragancia_House_Leaderboard', rows);
    } else {
      const label =
        individualStageTab === 'onstage'
          ? 'OnStage'
          : individualStageTab === 'offstage'
          ? 'OffStage'
          : 'Overall';
      const rows = filteredStudents.map((s, idx) => ({
        Rank: idx + 1,
        ChestNumber: s.chestNumber,
        Name: s.fullName,
        House: s.teamName,
        Category: s.categoryName,
        OnStagePoints: s.onStagePoints ?? 0,
        OffStagePoints: s.offStagePoints ?? 0,
        TotalPoints: s.totalPoints,
      }));
      exportToCsv(`Fragancia_Individual_Champions_${label}`, rows);
    }
  };

  // Get competitions won by a student
  const getStudentResults = (studentId: string) => {
    const list: {
      competitionName: string;
      stageType: 'On Stage' | 'Off Stage';
      rank: number;
      points: number;
    }[] = [];

    results.forEach((res) => {
      const comp = competitions.find((c) => c.id === res.competitionId);
      const isOff =
        (comp?.categoryName || '').toLowerCase().includes('off stage') ||
        comp?.stageType === 'Off Stage';
      const stageType: 'On Stage' | 'Off Stage' = isOff ? 'Off Stage' : 'On Stage';

      res.rankings.forEach((rk) => {
        if (rk.studentId === studentId) {
          list.push({
            competitionName: res.competitionName,
            stageType,
            rank: rk.rank,
            points: rk.pointsAwarded,
          });
        }
      });
    });

    return list.sort((a, b) => a.rank - b.rank);
  };

  // Get competitions won by a team
  const getTeamResults = (teamId: string) => {
    const list: {
      competitionName: string;
      studentName: string;
      chestNumber: string;
      rank: number;
      points: number;
    }[] = [];

    results.forEach((res) => {
      res.rankings.forEach((rk) => {
        if (rk.teamId === teamId) {
          list.push({
            competitionName: res.competitionName,
            studentName: rk.studentName,
            chestNumber: rk.chestNumber,
            rank: rk.rank,
            points: rk.pointsAwarded,
          });
        }
      });
    });

    return list.sort((a, b) => a.rank - b.rank);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
              The Leaderboard
            </h2>
            <Badge variant="live" pulse>
              REAL-TIME
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Official championship standings & individual star rankings
          </p>
        </div>

        {/* Tab switcher & export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-full bg-neutral-100 dark:bg-neutral-800/90 border border-black/5 dark:border-white/5 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setActiveTab('house')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'house'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              House Standings
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'individual'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Individual Champions
            </button>
          </div>

          {/* Clear Scoreboard Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shadow-xs"
            title="Reset scoreboard points to fresh 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset Points</span>
          </button>

          <button
            onClick={handleExportScoreboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </div>

      {resetSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Scoreboard points cleared successfully! Fest ledger is completely fresh at 0 points.</span>
          </div>
          <button onClick={() => setResetSuccessToast(false)} className="text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {activeTab === 'house' && (
        <>
          {/* Minimalist Modern Championship Podium */}
          {sortedTeams.length >= 3 && (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-50/80 dark:bg-[#111111]/90 border border-black/5 dark:border-white/5 p-4 sm:p-8 shadow-xs">
              {/* Subtle architectural background accent */}
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-400">
                  CHAMPIONSHIP PODIUM
                </span>
              </div>

              {/* Responsive Podium Container */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-xl mx-auto pt-2">
                {/* 2nd Place */}
                <div
                  onClick={() => setSelectedTeam(team2)}
                  className="flex flex-col items-center cursor-pointer group select-none"
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    2
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white uppercase text-center truncate w-full tracking-tight">
                    {team2?.name}
                  </h4>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-base sm:text-2xl font-black font-mono text-neutral-900 dark:text-white">
                      {team2?.points}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-neutral-500">PTS</span>
                  </div>

                  {/* Clean minimal pedestal */}
                  <div className="w-full h-20 sm:h-28 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-200/90 to-slate-100/70 dark:from-slate-800/80 dark:to-slate-900/60 border-t-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 p-1.5 space-y-0.5">
                    <span className="font-bold tracking-wider text-[11px] text-neutral-900 dark:text-neutral-100">RANK 2</span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-700 dark:text-neutral-300">On: {team2?.onStagePoints ?? 0} PTS</span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-700 dark:text-neutral-300">Off: {team2?.offStagePoints ?? 0} PTS</span>
                  </div>
                </div>

                {/* 1st Place (Elevated Center) */}
                <div
                  onClick={() => setSelectedTeam(team1)}
                  className="flex flex-col items-center -mt-4 sm:-mt-6 cursor-pointer group select-none"
                >
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black font-mono text-sm sm:text-lg flex items-center justify-center shadow-md border-2 border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform">
                      <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 dark:text-amber-500" />
                    </div>
                  </div>
                  <h4 className="font-black text-xs sm:text-base text-neutral-950 dark:text-white uppercase text-center truncate w-full tracking-tight mt-1.5">
                    {team1?.name}
                  </h4>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-xl sm:text-3xl font-black font-mono text-neutral-950 dark:text-white">
                      {team1?.points}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-neutral-600 dark:text-neutral-400 font-bold">PTS</span>
                  </div>

                  {/* Clean minimal leader pedestal */}
                  <div className="w-full h-28 sm:h-40 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-neutral-200/90 to-neutral-100/70 dark:from-neutral-800/90 dark:to-neutral-900/70 border-t-3 border-neutral-950 dark:border-white flex flex-col items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-neutral-900 dark:text-white p-2 space-y-1">
                    <span className="font-black tracking-wider text-xs sm:text-sm uppercase">RANK 1</span>
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] sm:text-[11px] font-bold">
                      On-Stage: {team1?.onStagePoints ?? 0} PTS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] sm:text-[11px] font-bold">
                      Off-Stage: {team1?.offStagePoints ?? 0} PTS
                    </span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div
                  onClick={() => setSelectedTeam(team3)}
                  className="flex flex-col items-center cursor-pointer group select-none"
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-mono font-black text-xs sm:text-sm mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    3
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white uppercase text-center truncate w-full tracking-tight">
                    {team3?.name}
                  </h4>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-base sm:text-2xl font-black font-mono text-neutral-900 dark:text-white">
                      {team3?.points}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-neutral-500">PTS</span>
                  </div>

                  {/* Clean minimal 3rd place pedestal */}
                  <div className="w-full h-16 sm:h-24 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-200/60 to-slate-100/40 dark:from-slate-800/60 dark:to-slate-900/40 border-t-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 p-1.5 space-y-0.5">
                    <span className="font-bold tracking-wider text-[11px] text-neutral-900 dark:text-neutral-100">RANK 3</span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-700 dark:text-neutral-300">On: {team3?.onStagePoints ?? 0} PTS</span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-700 dark:text-neutral-300">Off: {team3?.offStagePoints ?? 0} PTS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search bar for House filter */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search house by name or captain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-900/90 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white transition-all shadow-xs"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
              {filteredTeams.length} houses competing
            </span>
          </div>

          {/* ================= MOBILE VIEW: STREAMLINED CARDS (< md) ================= */}
          {/* Solves the horizontal cut-off / text-wrapping issue in mobile view */}
          <div className="block md:hidden space-y-3">
            {filteredTeams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-xs text-neutral-500">
                No houses match &ldquo;{search}&rdquo;.
              </div>
            ) : (
              filteredTeams.map((team, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent border-amber-300 dark:border-amber-500/40 shadow-xs'
                        : 'bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    {/* Top line: Rank, Name, ShortCode, Total Points */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isFirst
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-black'
                              : isSecond
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                              : isThird
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                              : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          #{idx + 1}
                        </div>

                        {/* Name & ShortCode */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-sm text-neutral-950 dark:text-white uppercase truncate">
                              {team.name}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                              {team.shortCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">
                            Capt: {team.captain}
                          </p>
                        </div>
                      </div>

                      {/* Points pill */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`font-mono font-black text-lg sm:text-xl ${
                              isFirst
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-neutral-950 dark:text-white'
                            }`}
                          >
                            {team.points}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 font-medium">
                            PTS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom line: On-stage, off-stage, and student count */}
                    <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
                          On-Stage: {team.onStagePoints ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                          Off-Stage: {team.offStagePoints ?? 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Users className="w-3 h-3" />
                        <span>{team.studentCount} enrolled</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ================= DESKTOP VIEW: CLEAN SPACIOUS TABLE (>= md) ================= */}
          <div className="hidden md:block overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-4">House / Team</th>
                    <th className="py-3.5 px-4 text-center">On-Stage Points</th>
                    <th className="py-3.5 px-4 text-center">Off-Stage Points</th>
                    <th className="py-3.5 px-4 text-center">Students</th>
                    <th className="py-3.5 px-6 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                  {filteredTeams.map((team, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <tr
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer ${
                          isFirst ? 'bg-amber-50/20 dark:bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-mono font-black text-sm whitespace-nowrap">
                          {isFirst ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs">
                              ★ #1
                            </span>
                          ) : (
                            <span className="text-neutral-500">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono font-bold text-xs">
                              {team.shortCode}
                            </span>
                            <div>
                              <p className="font-bold text-neutral-950 dark:text-white uppercase">
                                {team.name}
                              </p>
                              <p className="text-xs text-neutral-400">Captain: {team.captain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-neutral-800 dark:text-neutral-200">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                            {team.onStagePoints ?? 0} PTS
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-neutral-800 dark:text-neutral-200">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            {team.offStagePoints ?? 0} PTS
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-neutral-500">
                          {team.studentCount}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-black text-lg text-neutral-950 dark:text-white whitespace-nowrap">
                          {team.points} <span className="text-xs font-normal text-neutral-400">PTS</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= INDIVIDUAL CHAMPIONS TAB ================= */}
      {activeTab === 'individual' && (
        <div className="space-y-6">
          {/* Section Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
                  Individual Championship
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  Kalaprathibha
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Individual student rankings across On-Stage, Off-Stage, and Combined performance
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student, chest, house..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white shadow-xs"
              />
            </div>
          </div>

          {/* Sub-Tabs: Stage Points Switcher (Overall / On-Stage / Off-Stage) + Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5">
            {/* Stage Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setIndividualStageTab('overall')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  individualStageTab === 'overall'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Overall Champions</span>
              </button>

              <button
                onClick={() => setIndividualStageTab('onstage')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  individualStageTab === 'onstage'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>On-Stage Points</span>
              </button>

              <button
                onClick={() => setIndividualStageTab('offstage')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  individualStageTab === 'offstage'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Off-Stage Points</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 shrink-0">
              {(['all', 'junior', 'senior'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-black/5 dark:border-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All (44)' : cat === 'junior' ? 'Junior (22)' : 'Senior (22)'}
                </button>
              ))}
            </div>
          </div>

          {/* Context Banner */}
          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            individualStageTab === 'onstage'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
              : individualStageTab === 'offstage'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-neutral-50 dark:bg-neutral-900/40 border-black/5 dark:border-white/5 text-neutral-600 dark:text-neutral-300'
          }`}>
            <div className="flex items-center gap-2">
              {individualStageTab === 'onstage' ? (
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : individualStageTab === 'offstage' ? (
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Star className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span>
                {individualStageTab === 'onstage'
                  ? 'Showing rankings ranked strictly by On-Stage competitive points.'
                  : individualStageTab === 'offstage'
                  ? 'Showing rankings ranked strictly by Off-Stage written and academic points.'
                  : 'Showing aggregate rankings across both On-Stage and Off-Stage programmes.'}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold shrink-0">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* Top 3 Spotlight Podium for Active Stage */}
          {filteredStudents.length >= 3 && !search && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* #2 Silver */}
              <div
                onClick={() => setSelectedStudent(filteredStudents[1])}
                className="order-2 sm:order-1 p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-black text-xs">
                    🥈 2ND PLACE
                  </span>
                  <Badge variant="team">{filteredStudents[1].teamName}</Badge>
                </div>
                <div className="my-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-[10px]">
                      {filteredStudents[1].chestNumber}
                    </span>
                    <h4 className="font-black text-sm text-neutral-950 dark:text-white truncate">
                      {filteredStudents[1].fullName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{filteredStudents[1].categoryName}</p>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between font-mono">
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold">
                    {individualStageTab === 'onstage' ? 'On-Stage Pts' : individualStageTab === 'offstage' ? 'Off-Stage Pts' : 'Total Points'}
                  </span>
                  <span className={`font-black text-base ${
                    individualStageTab === 'onstage' ? 'text-blue-600 dark:text-blue-400' : individualStageTab === 'offstage' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-950 dark:text-white'
                  }`}>
                    {individualStageTab === 'onstage'
                      ? (filteredStudents[1].onStagePoints ?? 0)
                      : individualStageTab === 'offstage'
                      ? (filteredStudents[1].offStagePoints ?? 0)
                      : filteredStudents[1].totalPoints}{' '}
                    <span className="text-[10px] font-normal text-neutral-400">PTS</span>
                  </span>
                </div>
              </div>

              {/* #1 Gold */}
              <div
                onClick={() => setSelectedStudent(filteredStudents[0])}
                className={`order-1 sm:order-2 p-5 rounded-2xl transition-all cursor-pointer shadow-md flex flex-col justify-between border-2 ${
                  individualStageTab === 'onstage'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 hover:border-blue-500'
                    : individualStageTab === 'offstage'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-500'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/50 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-black font-mono font-black text-xs flex items-center gap-1 shadow-xs">
                    <Crown className="w-3.5 h-3.5" />
                    <span>CHAMPION #1</span>
                  </span>
                  <Badge variant="team">{filteredStudents[0].teamName}</Badge>
                </div>
                <div className="my-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-xs">
                      {filteredStudents[0].chestNumber}
                    </span>
                    <h4 className="font-black text-base text-neutral-950 dark:text-white truncate">
                      {filteredStudents[0].fullName}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{filteredStudents[0].categoryName}</p>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between font-mono">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">
                    {individualStageTab === 'onstage' ? 'On-Stage Score' : individualStageTab === 'offstage' ? 'Off-Stage Score' : 'Grand Total'}
                  </span>
                  <span className={`font-black text-xl ${
                    individualStageTab === 'onstage' ? 'text-blue-600 dark:text-blue-400' : individualStageTab === 'offstage' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {individualStageTab === 'onstage'
                      ? (filteredStudents[0].onStagePoints ?? 0)
                      : individualStageTab === 'offstage'
                      ? (filteredStudents[0].offStagePoints ?? 0)
                      : filteredStudents[0].totalPoints}{' '}
                    <span className="text-xs font-normal text-neutral-400">PTS</span>
                  </span>
                </div>
              </div>

              {/* #3 Bronze */}
              <div
                onClick={() => setSelectedStudent(filteredStudents[2])}
                className="order-3 p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-900/15 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono font-black text-xs">
                    🥉 3RD PLACE
                  </span>
                  <Badge variant="team">{filteredStudents[2].teamName}</Badge>
                </div>
                <div className="my-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-[10px]">
                      {filteredStudents[2].chestNumber}
                    </span>
                    <h4 className="font-black text-sm text-neutral-950 dark:text-white truncate">
                      {filteredStudents[2].fullName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{filteredStudents[2].categoryName}</p>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between font-mono">
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold">
                    {individualStageTab === 'onstage' ? 'On-Stage Pts' : individualStageTab === 'offstage' ? 'Off-Stage Pts' : 'Total Points'}
                  </span>
                  <span className={`font-black text-base ${
                    individualStageTab === 'onstage' ? 'text-blue-600 dark:text-blue-400' : individualStageTab === 'offstage' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-950 dark:text-white'
                  }`}>
                    {individualStageTab === 'onstage'
                      ? (filteredStudents[2].onStagePoints ?? 0)
                      : individualStageTab === 'offstage'
                      ? (filteredStudents[2].offStagePoints ?? 0)
                      : filteredStudents[2].totalPoints}{' '}
                    <span className="text-[10px] font-normal text-neutral-400">PTS</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Cards for Students */}
          <div className="block md:hidden space-y-2.5">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-xs text-neutral-500">
                No participants match &ldquo;{search}&rdquo;.
              </div>
            ) : (
              filteredStudents.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-black/20 dark:hover:border-white/20 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-black font-black'
                          : idx === 1
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : idx === 2
                          ? 'bg-amber-900/20 text-amber-800 dark:text-amber-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {idx === 0 ? '⭐' : `#${idx + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-[10px]">
                          {s.chestNumber}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white truncate">
                          {s.fullName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400">
                        <span>{s.teamName}</span>
                        <span>•</span>
                        <span>{s.categoryName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base text-neutral-950 dark:text-white">
                      {individualStageTab === 'onstage' ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {s.onStagePoints ?? 0} <span className="text-[10px] font-normal text-neutral-400">ON-PTS</span>
                        </span>
                      ) : individualStageTab === 'offstage' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {s.offStagePoints ?? 0} <span className="text-[10px] font-normal text-neutral-400">OFF-PTS</span>
                        </span>
                      ) : (
                        <span>
                          {s.totalPoints} <span className="text-[10px] font-normal text-neutral-400">PTS</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-1 font-mono text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        individualStageTab === 'onstage'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                      }`}>
                        On: {s.onStagePoints ?? 0}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        individualStageTab === 'offstage'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        Off: {s.offStagePoints ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table for Students */}
          <div className="hidden md:block overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-4">Chest No</th>
                    <th className="py-3.5 px-4">Participant Name</th>
                    <th className="py-3.5 px-4">House</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className={`py-3.5 px-4 text-center ${
                      individualStageTab === 'onstage' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black' : ''
                    }`}>
                      On-Stage Pts {individualStageTab === 'onstage' && '★'}
                    </th>
                    <th className={`py-3.5 px-4 text-center ${
                      individualStageTab === 'offstage' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black' : ''
                    }`}>
                      Off-Stage Pts {individualStageTab === 'offstage' && '★'}
                    </th>
                    <th className={`py-3.5 px-6 text-right ${
                      individualStageTab === 'overall' ? 'text-neutral-900 dark:text-white font-black' : ''
                    }`}>
                      Total Points {individualStageTab === 'overall' && '★'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs sm:text-sm">
                  {filteredStudents.map((s, index) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-6 font-mono font-black">
                        {index === 0 ? '⭐ #1' : `#${index + 1}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                          {s.chestNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {s.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="team">{s.teamName}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="category">{s.categoryName}</Badge>
                      </td>
                      <td className={`py-3.5 px-4 text-center font-mono font-bold ${
                        individualStageTab === 'onstage' ? 'bg-blue-500/5' : ''
                      }`}>
                        <span className={`px-2.5 py-1 rounded-md text-xs ${
                          individualStageTab === 'onstage'
                            ? 'bg-blue-600 text-white font-black shadow-xs'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        }`}>
                          {s.onStagePoints ?? 0} PTS
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-center font-mono font-bold ${
                        individualStageTab === 'offstage' ? 'bg-emerald-500/5' : ''
                      }`}>
                        <span className={`px-2.5 py-1 rounded-md text-xs ${
                          individualStageTab === 'offstage'
                            ? 'bg-emerald-600 text-white font-black shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {s.offStagePoints ?? 0} PTS
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-base text-neutral-950 dark:text-white">
                        {s.totalPoints} <span className="text-xs font-normal text-neutral-400">PTS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= HOUSE DOSSIER MODAL ================= */}
      {selectedTeam && (
        <Modal
          isOpen={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
          title={`${selectedTeam.name} (${selectedTeam.shortCode})`}
          subtitle={`Official Championship Dossier • Captain: ${selectedTeam.captain}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Quick stats banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-center font-mono">
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">Total Points</p>
                <p className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
                  {selectedTeam.points}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">On-Stage Points</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                  {selectedTeam.onStagePoints ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">Off-Stage Points</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedTeam.offStagePoints ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">Enrolled Students</p>
                <p className="text-xl sm:text-2xl font-black text-neutral-800 dark:text-neutral-200">
                  {selectedTeam.studentCount}
                </p>
              </div>
            </div>

            {/* Event Victories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Stage Wins & Points Contributed
              </h4>

              {(() => {
                const teamWins = getTeamResults(selectedTeam.id);
                if (teamWins.length === 0) {
                  return (
                    <div className="p-4 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-500">
                      No published results yet for this house.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {teamWins.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-[#151515] border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              w.rank === 1
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : w.rank === 2
                                ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                                : 'bg-amber-900/10 text-amber-800 dark:text-amber-400'
                            }`}
                          >
                            {w.rank === 1 ? '1st' : w.rank === 2 ? '2nd' : '3rd'}
                          </span>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {w.competitionName}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              {w.studentName} ({w.chestNumber})
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-neutral-950 dark:text-white">
                          +{w.points} PTS
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Enrolled students */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Enrolled House Members ({selectedTeam.studentCount})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {students
                  .filter((s) => s.teamId === selectedTeam.id)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-[10px] shrink-0">
                          {s.chestNumber}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white truncate">
                          {s.fullName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                        {s.totalPoints} PTS
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= STUDENT DOSSIER MODAL ================= */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`${selectedStudent.fullName} [${selectedStudent.chestNumber}]`}
          subtitle={`${selectedStudent.teamName} • ${selectedStudent.categoryName}`}
          maxWidth="md"
        >
          <div className="space-y-5">
            {/* Quick points split banner */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-center font-mono">
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">Total Points</p>
                <p className="text-xl font-black text-neutral-950 dark:text-white mt-0.5">
                  {selectedStudent.totalPoints}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">On-Stage</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {selectedStudent.onStagePoints ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-neutral-400 font-semibold">Off-Stage</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedStudent.offStagePoints ?? 0}
                </p>
              </div>
            </div>

            {/* Event Victories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Programmes Won & Contributed
              </h4>

              {(() => {
                const wins = getStudentResults(selectedStudent.id);
                if (wins.length === 0) {
                  return (
                    <div className="p-4 text-center rounded-xl bg-neutral-50 dark:bg-neutral-900/40 text-xs text-neutral-500">
                      No published points recorded yet for this participant.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {wins.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-[#151515] border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-neutral-950 dark:text-white truncate">
                            {w.competitionName}
                          </p>
                          <span
                            className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              w.stageType === 'On Stage'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {w.stageType}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs text-neutral-700 dark:text-neutral-300">
                            Rank #{w.rank}
                          </span>
                          <span className="block font-mono font-black text-xs text-neutral-950 dark:text-white">
                            +{w.points} PTS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= RESET SCOREBOARD MODAL ================= */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title="Reset Scoreboard to Fresh 0 Points"
          subtitle="Championship score ledger reset"
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Are you sure you want to clear all published scores, judge evaluations, and house points?
            </p>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p className="font-bold text-amber-800 dark:text-amber-300">✓ Preserved Data:</p>
              <p>• All 44 student profiles across Junior & Senior categories</p>
              <p>• All 317 registered event slots for Seljuk & Mamluk</p>
              <p>• House structures and competition programmes</p>
              <p className="font-bold text-amber-800 dark:text-amber-300 pt-1.5">↺ Reset to Zero:</p>
              <p>• All team points, on-stage & off-stage points reset to 0</p>
              <p>• All judge marks, evaluations, and published rankings cleared</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  store.resetAllScoreboardPoints();
                  setShowResetConfirm(false);
                  setResetSuccessToast(true);
                  setTimeout(() => setResetSuccessToast(false), 4000);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                Confirm Reset to Fresh 0
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
