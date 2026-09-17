'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { NavTab } from './Sidebar';

interface TopBarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
  onOpenAddStudent?: () => void;
  onSelectStudent?: (student: any) => void;
  onSelectCompetition?: (comp: any) => void;
}

export function TopBar({
  currentTab,
  onNavigate,
  onOpenMobileMenu,
}: TopBarProps) {
  const store = useFestStore();
  const session = store.getSession();
  const settings = store.getSettings();
  const auditLogs = store.getAuditLogs();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Synchronize dark theme class with documentElement
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F5]/95 dark:bg-[#080808]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3 transition-all no-print shadow-xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Left: Menu Bar Trigger & Fest Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            aria-label="Open navigation menu"
            id="nav-menu-bar-btn"
            title="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider hidden xs:inline">Menu</span>
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col cursor-pointer select-none group"
            title="Go to Fest Dashboard"
          >
            <h1 className="text-sm sm:text-base font-black tracking-tight text-neutral-950 dark:text-white uppercase leading-none truncate">
              {settings.eventName || 'FRAGANCIA 2026'}
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold block mt-0.5">
              {settings.logoText || settings.subtitle || 'ARTS FEST'}
            </span>
          </div>
        </div>

        {/* Center: Clean whitespace (all tabs moved to the menu bar as requested) */}
        <div className="flex-1" />

        {/* Right: Only Notification Option */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Activity Notifications"
              className="p-2.5 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all relative cursor-pointer shadow-xs"
              id="notifications-btn"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse ring-2 ring-white dark:ring-neutral-900" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Fest Notifications & Activity
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {auditLogs.length} updates
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1 divide-y divide-black/5 dark:divide-white/5">
                  {auditLogs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 font-mono">
                      No notifications or recent updates recorded yet.
                    </div>
                  ) : (
                    auditLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="pt-2 pb-1.5 first:pt-0">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {log.action}
                          </span>
                          <span>
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-snug">
                          {log.details}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
