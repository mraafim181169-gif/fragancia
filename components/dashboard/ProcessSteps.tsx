'use client';

import React from 'react';
import { UserCheck, Mic, Award, Share2, Check } from 'lucide-react';
import { DottedConnector } from '../ui/DecorativeGraphics';
import { useFestStore } from '@/hooks/useFestStore';

export function ProcessSteps() {
  const store = useFestStore();
  const settings = store.getSettings();

  const steps = [
    {
      num: '01',
      title: 'REGISTER',
      subtitle: 'Enrollment & Chest Codes',
      desc: 'Students are enrolled with instant non-colliding chest codes (AF-001) and printed badge passes.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'COMPETE',
      subtitle: 'Stage & Roll Call',
      desc: 'Organizers mark digital stage attendance with 1-click attendance ledgers on any mobile device.',
      icon: Mic,
    },
    {
      num: '03',
      title: 'JUDGE',
      subtitle: 'Blind Scoring Interface',
      desc: 'Judges input category marks against anonymous chest numbers. Identity is strictly protected.',
      icon: Award,
    },
    {
      num: '04',
      title: 'PUBLISH',
      subtitle: 'Scoreboard & Medals',
      desc: 'System computes 1st, 2nd, and 3rd rank, tallies house points, and publishes official certificates.',
      icon: Share2,
    },
  ];

  return (
    <section className="my-16 sm:my-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
          EDITORIAL PIPELINE
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white uppercase mt-2">
          {settings.pipelineHeading || 'FROM REGISTRATION TO VICTORY.'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {settings.pipelineSubtitle ||
            'Designed for high-speed fest days where volunteers, judges, and stage coordinators work in tandem.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700">
                    {step.num}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {step.subtitle}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Workflow</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
