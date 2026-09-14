'use client';

import React from 'react';
import {
  Users,
  Trophy,
  ClipboardList,
  Shield,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { NavTab } from '../layout/Sidebar';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  onNavigate: (tab: NavTab) => void;
}

export function MetricsGrid({ onNavigate }: MetricsGridProps) {
  const store = useFestStore();
  const settings = store.getSettings();
  const session = store.getSession();

  const students = store.getStudents();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const teams = store.getTeams();

  const handleTogglePortal = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.togglePortalStatus();
  };

  const metrics = [
    {
      id: 'students',
      label: 'TOTAL STUDENTS',
      count: students.length,
      detail: `${students.filter((s) => s.status === 'Active').length} Active Enrolled`,
      icon: Users,
      tab: 'students' as NavTab,
    },
    {
      id: 'registrations',
      label: 'REGISTRATIONS',
      count: registrations.length,
      detail: `${registrations.filter((r) => r.status === 'Registered').length} Confirmed Slots`,
      icon: ClipboardList,
      tab: 'registrations' as NavTab,
    },
    {
      id: 'competitions',
      label: 'COMPETITIONS',
      count: competitions.length,
      detail: `${competitions.filter((c) => c.status === 'Completed').length} Published Results`,
      icon: Trophy,
      tab: 'competitions' as NavTab,
    },
    {
      id: 'teams',
      label: 'ACTIVE HOUSES',
      count: teams.length,
      detail: 'Inter-House Ranks Live',
      icon: Shield,
      tab: 'teams' as NavTab,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            onClick={() => onNavigate(m.tab)}
            className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                {m.label}
              </span>
              <Icon className="w-4 h-4 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </div>

            <div className="my-4">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white">
                {m.count}
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {m.detail}
            </div>
          </div>
        );
      })}

      {/* Visually Prominent Portal Status Card */}
      <div
        className={cn(
          'p-6 rounded-[28px] border transition-all flex flex-col justify-between',
          settings.portalStatus === 'OPEN'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
            : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
            REGISTRATION PORTAL
          </span>
          {session.role === 'ADMIN' && (
            <button
              onClick={handleTogglePortal}
              title="Toggle registration status"
              className="cursor-pointer p-0.5"
            >
              {settings.portalStatus === 'OPEN' ? (
                <ToggleRight className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              )}
            </button>
          )}
        </div>

        <div className="my-3">
          <span className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            {settings.portalStatus}
          </span>
        </div>

        <p className="text-[11px] opacity-80 leading-tight">
          {settings.portalStatus === 'OPEN'
            ? 'Students may register for eligible categories'
            : 'Enrollments locked (Admin bypass active)'}
        </p>
      </div>
    </div>
  );
}
