'use client';

import React from 'react';
import {
  Sparkles,
  Trophy,
  ArrowUpRight,
  UserPlus,
  Radio,
  Play,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Megaphone,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { NavTab } from '../layout/Sidebar';
import { CurvedLineDecoration, GeometricAestheticAccent } from '../ui/DecorativeGraphics';
import { Badge } from '../ui/Badge';

interface DashboardHeroProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddStudent?: () => void;
}

export function DashboardHero({ onNavigate, onOpenAddStudent }: DashboardHeroProps) {
  const store = useFestStore();
  const session = store.getSession();
  const isAdmin = session.role === 'ADMIN';
  const settings = store.getSettings();
  const students = store.getStudents();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const liveComps = competitions.filter((c) => c.status === 'Live');
  const topTeam = store.getTeams()[0];

  return (
    <section className="relative pt-6 pb-12 sm:pb-16 overflow-hidden">
      {/* Decorative background curve */}
      <CurvedLineDecoration className="absolute -top-6 right-8 w-72 text-neutral-400 dark:text-neutral-600 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto">
        {/* Top Tag & Status Pill */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <Badge variant="dark" className="px-3 py-1 text-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {settings.eventName.toUpperCase()}
          </Badge>

          <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {liveComps.length > 0 ? `${liveComps.length} PROGRAMMES LIVE` : 'FEST IN SESSION'}
          </span>

          {settings.venue && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300">
              <MapPin className="w-3 h-3 text-neutral-400" />
              {settings.venue}
            </span>
          )}

          {settings.eventDates && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300">
              <Calendar className="w-3 h-3 text-neutral-400" />
              {settings.eventDates}
            </span>
          )}
        </div>

        {/* Editorial Big Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-neutral-950 dark:text-white leading-[0.95] uppercase">
              {settings.heroTitleLine1 || 'RUN THE FEST.'}
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">
                {settings.heroTitleLine2 || 'NOT THE SPREADSHEET.'}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              {settings.heroDescription ||
                'Complete autonomous control for Meelad Fest, Arts Fest, and student competitions. Instant chest numbering, blind judging panels, real-time leaderboards, and official print cards.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('scoreboard')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-sm hover:opacity-90 active:scale-98 transition-all shadow-md cursor-pointer"
                id="hero-scoreboard-btn"
              >
                <Trophy className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                <span>View Live Scoreboard</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </button>

              {isAdmin && onOpenAddStudent && (
                <button
                  onClick={onOpenAddStudent}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-neutral-500" />
                  <span>Enroll Student</span>
                </button>
              )}

              {isAdmin ? (
                <button
                  onClick={() => onNavigate('judging')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span>Judge Panel (Blind)</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('schedule')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>Programme Schedule</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Floating Cards Widget overlapping subtly */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Competition Floating Card */}
            <div
              onClick={() => onNavigate('competitions')}
              className="p-5 rounded-[28px] bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="live" pulse>
                  ACTIVE STAGE
                </Badge>
                <span suppressHydrationWarning className="text-xs font-mono text-neutral-400">
                  {liveComps.length} Active
                </span>
              </div>
              <h3 suppressHydrationWarning className="font-bold text-base text-neutral-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {liveComps[0]?.name || competitions[0]?.name || 'QIRATH'}
              </h3>
              <p suppressHydrationWarning className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {liveComps[0]?.stage || competitions[0]?.stage || 'Main Auditorium'} • {liveComps[0]?.categoryName || competitions[0]?.categoryName || 'Senior On Stage'}
              </p>
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span suppressHydrationWarning>{registrations.filter((r) => r.competitionId === (liveComps[0]?.id || competitions[0]?.id || '')).length} Participants Enrolled</span>
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                  Open <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Top Leaderboard Teaser Card */}
            <div
              onClick={() => onNavigate('scoreboard')}
              className="p-5 rounded-[28px] bg-neutral-950 text-white dark:bg-[#1A1A1A] border border-black/20 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  LEADERBOARD STANDING
                </span>
                <span className="text-xs font-bold text-amber-400">RANK #1</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <h4 suppressHydrationWarning className="text-xl font-black tracking-tight">{topTeam?.name || 'AL-FALAH'}</h4>
                  <p suppressHydrationWarning className="text-xs text-neutral-400 font-mono mt-0.5">
                    Captain: {topTeam?.captain || 'Zaid Bin Haris'}
                  </p>
                </div>
                <div className="text-right">
                  <span suppressHydrationWarning className="text-2xl font-black font-mono text-amber-300">
                    {topTeam?.points || 87}
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-mono">POINTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
