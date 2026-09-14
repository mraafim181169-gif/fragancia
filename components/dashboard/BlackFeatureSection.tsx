'use client';

import React from 'react';
import {
  ClipboardCheck,
  Scale,
  Award,
  Trophy,
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Printer,
  Sparkles,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';
import { Badge } from '../ui/Badge';
import { useFestStore } from '@/hooks/useFestStore';

interface BlackFeatureSectionProps {
  onNavigate: (tab: NavTab) => void;
}

export function BlackFeatureSection({ onNavigate }: BlackFeatureSectionProps) {
  const store = useFestStore();
  const settings = store.getSettings();

  const features = [
    {
      id: 'reg',
      title: 'Registration & Chest Cards',
      description: 'Zero-collision unique chest numbers (AF-001) with 1-click printable chest cards & badges.',
      tab: 'students' as NavTab,
      icon: ClipboardCheck,
      tag: 'AUTOMATED',
    },
    {
      id: 'judge',
      title: 'Blind Code Judging',
      description: 'Judges evaluate purely by participant chest codes without bias or student identities revealed.',
      tab: 'judging' as NavTab,
      icon: EyeOff,
      tag: 'ANONYMOUS',
    },
    {
      id: 'results',
      title: 'Dynamic Result Engine',
      description: 'Automatic 1st, 2nd, and 3rd place calculation, tie-breaking rules, and draft review before release.',
      tab: 'competitions' as NavTab,
      icon: Award,
      tag: 'ACCURATE',
    },
    {
      id: 'scoreboard',
      title: 'Live House Leaderboard',
      description: 'Real-time medal tally (Gold/Silver/Bronze) with sports-style podium and bonus/minus audit trails.',
      tab: 'scoreboard' as NavTab,
      icon: Trophy,
      tag: 'INSTANT',
    },
  ];

  return (
    <section className="my-16 sm:my-24 py-16 sm:py-20 px-6 sm:px-12 rounded-[36px] bg-[#0A0A0A] text-white border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Subtle organic light accent */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-900/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
              {settings.featureSubheading || 'ARCHITECTURE & WORKFLOW'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 uppercase leading-none">
              {settings.featureHeading || 'EVERYTHING IN ONE CONTROL CENTER.'}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-neutral-400 max-w-md leading-relaxed">
            {settings.featureDescription ||
              'Eliminate chaotic paper forms and conflicting scorecards. From stage roll call to the final championship trophy, Fragancia guarantees spotless accuracy.'}
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                onClick={() => onNavigate(f.tab)}
                className="p-6 rounded-[28px] bg-[#141414] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400 group-hover:text-white transition-colors">
                  <span className="font-semibold">Open Module</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
