'use client';

import React from 'react';
import {
  LayoutDashboard,
  Award,
  Scale,
  Calendar,
  Menu,
  X,
  Users,
  Trophy,
  ClipboardList,
} from 'lucide-react';
import { NavTab, Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
  onOpenAddStudent?: () => void;
}

export function MobileNav({
  currentTab,
  onSelectTab,
  isDrawerOpen,
  onToggleDrawer,
  onOpenAddStudent,
}: MobileNavProps) {
  const bottomTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'scoreboard', label: 'Scores', icon: Award },
    { id: 'judging', label: 'Judging', icon: Scale },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <>
      {/* Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => onToggleDrawer(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0A0A0A] h-full z-10 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Menu
              </span>
              <button
                onClick={() => onToggleDrawer(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={onSelectTab}
              onOpenAddStudent={onOpenAddStudent}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => onToggleDrawer(false)}
              className="w-full border-r-0 h-full"
            />
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation for Quick Mobile Access */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 px-2 py-1.5 flex items-center justify-around no-print"
      >
        {bottomTabs.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer',
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'scale-110')} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Menu drawer trigger */}
        <button
          onClick={() => onToggleDrawer(true)}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer',
            isDrawerOpen && 'text-black dark:text-white font-bold'
          )}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>All</span>
        </button>
      </nav>
    </>
  );
}
