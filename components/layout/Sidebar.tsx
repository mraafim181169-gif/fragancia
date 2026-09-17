'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Layers,
  Trophy,
  ClipboardList,
  UserCheck,
  Scale,
  Award,
  Calendar,
  FileText,
  Settings,
  ToggleLeft,
  ToggleRight,
  LogOut,
  RotateCcw,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { store } from '@/lib/store';
import { useFestStore } from '@/hooks/useFestStore';
import { Role } from '@/types/fest';
import { Modal } from '@/components/ui/Modal';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'teams'
  | 'categories'
  | 'competitions'
  | 'registrations'
  | 'attendance'
  | 'judging'
  | 'scoreboard'
  | 'schedule'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddStudent?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  className,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: SidebarProps) {
  const festStore = useFestStore();
  const settings = festStore.getSettings();
  const session = festStore.getSession();
  const isDarkMode = settings.themeMode === 'dark';

  // Admin password modal states
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Restricted navigation items:
  // For VIEWER role: judge panel, attendance, registrations, reports, settings are strictly hidden.
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string; allowedRoles?: Role[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scoreboard', label: 'Scoreboard', icon: Award, badge: 'Live' },
    { id: 'schedule', label: 'Programme', icon: Calendar },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'judging', label: 'Judge Panel', icon: Scale, badge: 'Blind Code', allowedRoles: ['ADMIN', 'JUDGE'] },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, allowedRoles: ['ADMIN'] },
    { id: 'registrations', label: 'Registrations', icon: ClipboardList, allowedRoles: ['ADMIN'] },
    { id: 'reports', label: 'Reports', icon: FileText, allowedRoles: ['ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, allowedRoles: ['ADMIN'] },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const togglePortal = () => {
    festStore.togglePortalStatus();
  };

  const handleRoleChange = (role: Role) => {
    if (role === 'ADMIN') {
      if (session.role === 'ADMIN') return; // already admin
      setAdminPasswordInput('');
      setAdminPasswordError('');
      setIsAdminAuthModalOpen(true);
      return;
    }

    festStore.setSession({
      id: `usr-${role.toLowerCase()}`,
      name:
        role === 'JUDGE'
          ? 'Usthad Qari (Judge)'
          : 'Public Guest (Viewer)',
      email: `${role.toLowerCase()}@fragancia.local`,
      role,
    });
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === '18169') {
      festStore.setSession({
        id: 'usr-admin',
        name: 'Fest Director (Admin)',
        email: 'admin@fragancia.local',
        role: 'ADMIN',
      });
      setIsAdminAuthModalOpen(false);
      setAdminPasswordInput('');
      setAdminPasswordError('');
    } else {
      setAdminPasswordError('Invalid password! Admin password is 18169.');
    }
  };

  return (
    <aside
      className={cn(
        'w-64 md:w-72 bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-r border-black/5 dark:border-white/5 flex flex-col justify-between h-full select-none transition-all no-print',
        className
      )}
      id="fragancia-sidebar"
    >
      {/* Brand Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="font-black tracking-tight text-lg leading-none text-neutral-950 dark:text-white uppercase">
              {settings.logoText || 'Fragancia'}
            </h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 mt-1">
              Arts & Cultural Fest
            </p>
          </div>
        </div>

        {/* Small Event Pill */}
        <div className="mt-4 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
          <span className="truncate font-medium">{settings.eventName}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* Nav List with generous whitespace */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {navItems.map((item) => {
          if (item.allowedRoles && !item.allowedRoles.includes(session.role)) {
            return null;
          }
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              id={`nav-item-${item.id}`}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer group text-left',
                isActive
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-900/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-105',
                    isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-400 dark:text-neutral-500'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold',
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2.5 bg-neutral-50/50 dark:bg-neutral-950/40">
        {/* Portal Status */}
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
              Reg. Portal
            </span>
            <span
              className={cn(
                'font-bold text-xs',
                settings.portalStatus === 'OPEN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              )}
            >
              {settings.portalStatus}
            </span>
          </div>
          {session.role === 'ADMIN' && (
            <button
              onClick={togglePortal}
              title="Toggle Registration Portal"
              className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
            >
              {settings.portalStatus === 'OPEN' ? (
                <ToggleRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-400" />
              )}
            </button>
          )}
        </div>

        {/* Role Switcher */}
        <div className="flex items-center justify-between pt-1.5 border-t border-black/5 dark:border-white/5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            Switch Role
          </span>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800/70 p-0.5 rounded-full text-[10px]">
            {(['ADMIN', 'JUDGE', 'VIEWER'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={cn(
                  'px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer',
                  session.role === r
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white'
                )}
              >
                {r[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Session User Info */}
        <div className="flex items-center justify-between pt-2 px-1 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 text-[10px] font-bold flex items-center justify-center text-neutral-800 dark:text-neutral-200 flex-shrink-0">
              {session.role[0]}
            </div>
            <div className="truncate">
              <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {session.name}
              </p>
              <p className="text-[9px] text-neutral-400 truncate">{session.role} Role</p>
            </div>
          </div>

          {session.role === 'ADMIN' && (
            <button
              onClick={() => festStore.resetToDemoData()}
              title="Reset to Pristine Demo Data"
              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Admin Password Authentication Modal */}
      {isAdminAuthModalOpen && (
        <Modal
          isOpen={isAdminAuthModalOpen}
          onClose={() => {
            setIsAdminAuthModalOpen(false);
            setAdminPasswordInput('');
            setAdminPasswordError('');
          }}
          title="Admin Verification"
          subtitle="Enter master administrator PIN to unlock management permissions."
          maxWidth="sm"
        >
          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Master Admin Password
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  PIN: 18169
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError('');
                  }}
                  placeholder="Enter admin password (18169)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {adminPasswordError && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {adminPasswordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setAdminPasswordInput('');
                  setAdminPasswordError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Authenticate
              </button>
            </div>
          </form>
        </Modal>
      )}
    </aside>
  );
}
