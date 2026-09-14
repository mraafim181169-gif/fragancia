'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Sidebar, NavTab } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { DashboardHero } from '../dashboard/DashboardHero';
import { MetricsGrid } from '../dashboard/MetricsGrid';
import { BlackFeatureSection } from '../dashboard/BlackFeatureSection';
import { ProcessSteps } from '../dashboard/ProcessSteps';
import { StudentManager } from '../students/StudentManager';
import { TeamManager } from '../teams/TeamManager';
import { CategoryManager } from '../categories/CategoryManager';
import { CompetitionManager } from '../competitions/CompetitionManager';
import { RegistrationManager } from '../registrations/RegistrationManager';
import { AttendanceLedger } from '../attendance/AttendanceLedger';
import { JudgePanel } from '../judging/JudgePanel';
import { ScoreboardView } from '../scoreboard/ScoreboardView';
import { ScheduleTimeline } from '../schedule/ScheduleTimeline';
import { ReportsCenter } from '../reports/ReportsCenter';
import { SettingsManager } from '../settings/SettingsManager';
import { Student, Competition } from '@/types/fest';
import { useFestStore } from '@/hooks/useFestStore';

export function AppShell() {
  const festStore = useFestStore();
  const settings = festStore.getSettings();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  useEffect(() => {
    store.initClient();
  }, []);

  // Selected student / competition from search
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddStudent = () => {
    setIsAddStudentOpen(true);
    setCurrentTab('students');
  };

  const handleSelectStudentFromSearch = (student: Student) => {
    setSelectedStudent(student);
    setCurrentTab('students');
  };

  const handleSelectCompFromSearch = (comp: Competition) => {
    setSelectedComp(comp);
    setCurrentTab('competitions');
  };

  const handleNavigateToJudging = (comp: Competition) => {
    setSelectedComp(comp);
    setCurrentTab('judging');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 flex transition-colors duration-200">
      {/* Desktop Sidebar (hidden on print and mobile) */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleNavigate}
          onOpenAddStudent={handleOpenAddStudent}
        />
      </div>

      {/* Mobile Drawer and Bottom Nav */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        isDrawerOpen={isMobileDrawerOpen}
        onToggleDrawer={setIsMobileDrawerOpen}
        onOpenAddStudent={handleOpenAddStudent}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* TopBar */}
        <TopBar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenAddStudent={handleOpenAddStudent}
          onSelectStudent={handleSelectStudentFromSearch}
          onSelectCompetition={handleSelectCompFromSearch}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-28 lg:pb-12 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-12">
              <DashboardHero
                onNavigate={handleNavigate}
                onOpenAddStudent={handleOpenAddStudent}
              />
              <MetricsGrid onNavigate={handleNavigate} />
              <BlackFeatureSection onNavigate={handleNavigate} />
              <ProcessSteps />
            </div>
          )}

          {currentTab === 'students' && (
            <StudentManager
              initialOpenAdd={isAddStudentOpen}
              onCloseAdd={() => setIsAddStudentOpen(false)}
              selectedStudentFromSearch={selectedStudent}
            />
          )}

          {currentTab === 'teams' && <TeamManager />}

          {currentTab === 'categories' && <CategoryManager />}

          {currentTab === 'competitions' && (
            <CompetitionManager
              onNavigateToJudging={handleNavigateToJudging}
              selectedFromSearch={selectedComp}
            />
          )}

          {currentTab === 'registrations' && <RegistrationManager />}

          {currentTab === 'attendance' && <AttendanceLedger />}

          {currentTab === 'judging' && (
            <JudgePanel initialCompetition={selectedComp} />
          )}

          {currentTab === 'scoreboard' && <ScoreboardView />}

          {currentTab === 'schedule' && (
            <ScheduleTimeline onNavigateToJudging={handleNavigateToJudging} />
          )}

          {currentTab === 'reports' && <ReportsCenter />}

          {currentTab === 'settings' && <SettingsManager />}

          {/* Official Footer with Dynamic Content */}
          <footer className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400 no-print">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                {settings.footerText || 'Fragancia Arts Fest 2026'}
              </p>
              {settings.helpdeskContact && (
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {settings.helpdeskContact}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:items-end text-center sm:text-right">
              <p className="text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300">
                developed by{' '}
                <a
                  href="https://rafidotcom.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  rafidotcom.in
                </a>
              </p>
              <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                {settings.copyright || '© 2026 Fragancia. All rights reserved.'}
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
