'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Type,
  Megaphone,
  Layout,
  Award,
  ShieldCheck,
  FileText,
  MapPin,
  Calendar,
  Eye,
  Info,
  Trash2,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { EventSettings } from '@/types/fest';

type SettingsTab = 'branding' | 'hero' | 'sections' | 'scoring' | 'portal' | 'footer';

export function SettingsManager() {
  const store = useFestStore();
  const session = store.getSession();
  const isAdmin = session.role === 'ADMIN';
  const currentSettings = store.getSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Branding & Identity
  const [eventName, setEventName] = useState(currentSettings.eventName);
  const [logoText, setLogoText] = useState(currentSettings.logoText);
  const [subtitle, setSubtitle] = useState(currentSettings.subtitle || '');
  const [instituteName, setInstituteName] = useState(currentSettings.instituteName || '');
  const [academicYear, setAcademicYear] = useState(currentSettings.academicYear || '2026 - 2027');
  const [venue, setVenue] = useState(currentSettings.venue || '');
  const [eventDates, setEventDates] = useState(currentSettings.eventDates || '');

  // 2. Hero & Announcements
  const [heroTitleLine1, setHeroTitleLine1] = useState(currentSettings.heroTitleLine1 || 'RUN THE FEST.');
  const [heroTitleLine2, setHeroTitleLine2] = useState(currentSettings.heroTitleLine2 || 'NOT THE SPREADSHEET.');
  const [heroDescription, setHeroDescription] = useState(currentSettings.heroDescription || '');
  const [announcementText, setAnnouncementText] = useState(currentSettings.announcementText || '');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(currentSettings.isAnnouncementActive ?? true);

  // 3. Section Slogans & Headings
  const [featureSubheading, setFeatureSubheading] = useState(currentSettings.featureSubheading || 'ARCHITECTURE & WORKFLOW');
  const [featureHeading, setFeatureHeading] = useState(currentSettings.featureHeading || 'EVERYTHING IN ONE CONTROL CENTER.');
  const [featureDescription, setFeatureDescription] = useState(currentSettings.featureDescription || '');
  const [pipelineHeading, setPipelineHeading] = useState(currentSettings.pipelineHeading || 'FROM REGISTRATION TO VICTORY.');
  const [pipelineSubtitle, setPipelineSubtitle] = useState(currentSettings.pipelineSubtitle || '');

  // 4. Scoring Rules
  const [defaultFirstPoints, setDefaultFirstPoints] = useState(currentSettings.defaultFirstPoints ?? 10);
  const [defaultSecondPoints, setDefaultSecondPoints] = useState(currentSettings.defaultSecondPoints ?? 7);
  const [defaultThirdPoints, setDefaultThirdPoints] = useState(currentSettings.defaultThirdPoints ?? 5);
  const [groupFirstPoints, setGroupFirstPoints] = useState(currentSettings.groupFirstPoints ?? 15);
  const [groupSecondPoints, setGroupSecondPoints] = useState(currentSettings.groupSecondPoints ?? 10);
  const [groupThirdPoints, setGroupThirdPoints] = useState(currentSettings.groupThirdPoints ?? 7);

  // 5. Portal & Registrations
  const [portalStatus, setPortalStatus] = useState<'OPEN' | 'CLOSED'>(currentSettings.portalStatus);
  const [portalClosedMessage, setPortalClosedMessage] = useState(currentSettings.portalClosedMessage || '');
  const [chestPrefix, setChestPrefix] = useState(currentSettings.chestNumberPrefix || '');
  const [maxRegs, setMaxRegs] = useState(currentSettings.maxRegistrationsPerStudent || 5);

  // 6. Footer, Helpdesk & Reports
  const [footerText, setFooterText] = useState(currentSettings.footerText || '');
  const [copyright, setCopyright] = useState(currentSettings.copyright || '');
  const [helpdeskContact, setHelpdeskContact] = useState(currentSettings.helpdeskContact || '');
  const [signatory1Title, setSignatory1Title] = useState(currentSettings.signatory1Title || 'Chief Controller / Convener');
  const [signatory2Title, setSignatory2Title] = useState(currentSettings.signatory2Title || 'General Secretary / Chairman');

  // Track if modified
  const handleInputChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;

    const updated: Partial<EventSettings> = {
      // Branding
      eventName: eventName.trim(),
      logoText: logoText.trim(),
      subtitle: subtitle.trim(),
      instituteName: instituteName.trim(),
      academicYear: academicYear.trim(),
      venue: venue.trim(),
      eventDates: eventDates.trim(),

      // Hero & Notice
      heroTitleLine1: heroTitleLine1.trim(),
      heroTitleLine2: heroTitleLine2.trim(),
      heroDescription: heroDescription.trim(),
      announcementText: announcementText.trim(),
      isAnnouncementActive,

      // Sections
      featureSubheading: featureSubheading.trim(),
      featureHeading: featureHeading.trim(),
      featureDescription: featureDescription.trim(),
      pipelineHeading: pipelineHeading.trim(),
      pipelineSubtitle: pipelineSubtitle.trim(),

      // Scoring
      defaultFirstPoints: Number(defaultFirstPoints),
      defaultSecondPoints: Number(defaultSecondPoints),
      defaultThirdPoints: Number(defaultThirdPoints),
      groupFirstPoints: Number(groupFirstPoints),
      groupSecondPoints: Number(groupSecondPoints),
      groupThirdPoints: Number(groupThirdPoints),

      // Portal
      portalStatus,
      portalClosedMessage: portalClosedMessage.trim(),
      chestNumberPrefix: chestPrefix.trim().toUpperCase(),
      maxRegistrationsPerStudent: Number(maxRegs),

      // Footer & Reports
      footerText: footerText.trim(),
      copyright: copyright.trim(),
      helpdeskContact: helpdeskContact.trim(),
      signatory1Title: signatory1Title.trim(),
      signatory2Title: signatory2Title.trim(),
    };

    store.updateSettings(updated);
    setHasUnsavedChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToCleanState = () => {
    if (!isAdmin) return;
    if (
      window.confirm(
        'Reset all settings, texts, and student rosters back to default Fragancia state?'
      )
    ) {
      store.resetToDemoData();
      const updated = store.getSettings();
      setEventName(updated.eventName);
      setLogoText(updated.logoText);
      setSubtitle(updated.subtitle || '');
      setInstituteName(updated.instituteName || '');
      setAcademicYear(updated.academicYear || '2026 - 2027');
      setVenue(updated.venue || '');
      setEventDates(updated.eventDates || '');
      setHeroTitleLine1(updated.heroTitleLine1 || 'RUN THE FEST.');
      setHeroTitleLine2(updated.heroTitleLine2 || 'NOT THE SPREADSHEET.');
      setHeroDescription(updated.heroDescription || '');
      setAnnouncementText(updated.announcementText || '');
      setIsAnnouncementActive(updated.isAnnouncementActive ?? true);
      setFeatureSubheading(updated.featureSubheading || 'ARCHITECTURE & WORKFLOW');
      setFeatureHeading(updated.featureHeading || 'EVERYTHING IN ONE CONTROL CENTER.');
      setFeatureDescription(updated.featureDescription || '');
      setPipelineHeading(updated.pipelineHeading || 'FROM REGISTRATION TO VICTORY.');
      setPipelineSubtitle(updated.pipelineSubtitle || '');
      setDefaultFirstPoints(updated.defaultFirstPoints ?? 10);
      setDefaultSecondPoints(updated.defaultSecondPoints ?? 7);
      setDefaultThirdPoints(updated.defaultThirdPoints ?? 5);
      setGroupFirstPoints(updated.groupFirstPoints ?? 15);
      setGroupSecondPoints(updated.groupSecondPoints ?? 10);
      setGroupThirdPoints(updated.groupThirdPoints ?? 7);
      setPortalStatus(updated.portalStatus);
      setPortalClosedMessage(updated.portalClosedMessage || '');
      setChestPrefix(updated.chestNumberPrefix || '');
      setMaxRegs(updated.maxRegistrationsPerStudent || 5);
      setFooterText(updated.footerText || '');
      setCopyright(updated.copyright || '');
      setHelpdeskContact(updated.helpdeskContact || '');
      setSignatory1Title(updated.signatory1Title || 'Chief Controller / Convener');
      setSignatory2Title(updated.signatory2Title || 'General Secretary / Chairman');
      setHasUnsavedChanges(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleClearAllContent = () => {
    if (!isAdmin) return;
    if (
      window.confirm(
        '⚠️ Are you sure you want to remove ALL content? This will purge all students, registrations, and published results so you can start completely fresh. This action cannot be undone.'
      )
    ) {
      store.clearAllContent();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Info', icon: Sparkles, desc: 'Names, tags & venue' },
    { id: 'hero', label: 'Hero & Notice', icon: Megaphone, desc: 'Banners & headlines' },
    { id: 'sections', label: 'Page Content', icon: Layout, desc: 'Slogans & descriptions' },
    { id: 'scoring', label: 'Points Rules', icon: Award, desc: 'Marking & medaling' },
    { id: 'portal', label: 'Portal Control', icon: ShieldCheck, desc: 'Locks & quota limits' },
    { id: 'footer', label: 'Footer & Reports', icon: FileText, desc: 'Contact & signatures' },
  ];

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
              SITE CMS
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              All Texts & Content Are Editable
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-950 dark:text-white uppercase leading-none">
            CONTENT & SYSTEM SETTINGS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Modify any title, slogan, announcement notice, rubric, or contact detail across the site.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <>
              {hasUnsavedChanges && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse hidden sm:inline">
                  ● Unsaved edits
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                id="save-all-settings-btn"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </>
          ) : (
            <span className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 font-mono">
              View-Only (Admin role required to edit)
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">All texts and site content saved successfully! Changes are immediately live across all pages.</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex flex-col items-center text-center p-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#181818] text-neutral-950 dark:text-white shadow-xs font-bold border border-black/5 dark:border-white/10'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
              <span className="text-xs truncate w-full">{tab.label}</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate w-full hidden sm:block">
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Body */}
      <form onSubmit={handleSave} className="space-y-6">
        <fieldset disabled={!isAdmin} className="space-y-6 border-0 p-0 m-0">
          {/* TAB 1: BRANDING & GENERAL */}
        {activeTab === 'branding' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Brand Identity & Fest Details</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                These texts define the fest name, academy details, and venue stamps seen across the topbar, badges, and export files.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Event Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Fragancia Arts Fest 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Displayed on main badges, certificate banners, and printouts.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  App Logo / Short Brand *
                </label>
                <input
                  type="text"
                  required
                  value={logoText}
                  onChange={(e) => {
                    setLogoText(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. FRAGANCIA"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Shown in the sidebar top logo and navigation pills.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Subtitle / Slogan
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Grand Arts & Cultural Fest 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Organizing Committee / Academy
                </label>
                <input
                  type="text"
                  value={instituteName}
                  onChange={(e) => {
                    setInstituteName(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Fragancia Directorate"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. 2026 - 2027"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Venue & Stages
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Main Auditorium & Open Stage"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Event Dates
                </label>
                <input
                  type="text"
                  value={eventDates}
                  onChange={(e) => {
                    setEventDates(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. September 15 - 17, 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO & ANNOUNCEMENTS */}
        {activeTab === 'hero' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" />
                <span>Hero Banner Texts & Live Official Notice</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Control the big headline on the homepage and display important stage or schedule announcements.
              </p>
            </div>

            {/* Live Notice Toggle & Input */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                    Live Announcement Ticker Banner
                  </span>
                  <span className="text-xs text-neutral-500">
                    Displays an eye-catching announcement banner at the very top of the home view.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAnnouncementActive(!isAnnouncementActive);
                    handleInputChange();
                  }}
                  className="cursor-pointer p-1"
                >
                  {isAnnouncementActive ? (
                    <ToggleRight className="w-9 h-9 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-400" />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Announcement Notice Text
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => {
                    setAnnouncementText(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Welcome to Fragancia Arts Fest 2026! Results will be published live."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-800/80 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Hero Main Big Typography */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                HERO MAIN TYPOGRAPHY
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Hero Headline - Line 1 (Dark Bold)
                  </label>
                  <input
                    type="text"
                    value={heroTitleLine1}
                    onChange={(e) => {
                      setHeroTitleLine1(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. RUN THE FEST."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-black uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Hero Headline - Line 2 (Subtle Accent)
                  </label>
                  <input
                    type="text"
                    value={heroTitleLine2}
                    onChange={(e) => {
                      setHeroTitleLine2(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. NOT THE SPREADSHEET."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-black uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Hero Paragraph / Description
                </label>
                <textarea
                  rows={3}
                  value={heroDescription}
                  onChange={(e) => {
                    setHeroDescription(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="Description of the fest control center..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECTION HEADINGS & SLOGANS */}
        {activeTab === 'sections' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-500" />
                <span>Dashboard Sections & Editorial Text</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Customize headlines and descriptive subtitles for the Black Control Center section and the 4-step workflow pipeline.
              </p>
            </div>

            {/* Feature Section Texts */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                CONTROL CENTER BANNER (BLACK SECTION)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Section Tagline (Mono font)
                  </label>
                  <input
                    type="text"
                    value={featureSubheading}
                    onChange={(e) => {
                      setFeatureSubheading(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. ARCHITECTURE & WORKFLOW"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={featureHeading}
                    onChange={(e) => {
                      setFeatureHeading(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. EVERYTHING IN ONE CONTROL CENTER."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Section Description
                </label>
                <textarea
                  rows={2}
                  value={featureDescription}
                  onChange={(e) => {
                    setFeatureDescription(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="Description..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm leading-relaxed focus:outline-none"
                />
              </div>
            </div>

            {/* Pipeline Section Texts */}
            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                EDITORIAL WORKFLOW PIPELINE (4 STEPS)
              </h4>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Pipeline Heading
                </label>
                <input
                  type="text"
                  value={pipelineHeading}
                  onChange={(e) => {
                    setPipelineHeading(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. FROM REGISTRATION TO VICTORY."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Pipeline Subtitle
                </label>
                <input
                  type="text"
                  value={pipelineSubtitle}
                  onChange={(e) => {
                    setPipelineSubtitle(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Designed for high-speed fest days..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCORING RULES & POINTS */}
        {activeTab === 'scoring' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Points Distribution & Scoreboard Rules</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure default points awarded to houses for individual and group competitions upon publishing results.
              </p>
            </div>

            {/* Individual Points */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-3">
                INDIVIDUAL / SINGLE ITEMS (POINTS)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">1st Place (Gold)</span>
                  <input
                    type="number"
                    min="1"
                    value={defaultFirstPoints}
                    onChange={(e) => {
                      setDefaultFirstPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 10 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">2nd Place (Silver)</span>
                  <input
                    type="number"
                    min="1"
                    value={defaultSecondPoints}
                    onChange={(e) => {
                      setDefaultSecondPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 7 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">3rd Place (Bronze)</span>
                  <input
                    type="number"
                    min="1"
                    value={defaultThirdPoints}
                    onChange={(e) => {
                      setDefaultThirdPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 5 pts</span>
                </div>
              </div>
            </div>

            {/* Group Points */}
            <div className="pt-4 border-t border-black/5 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-3">
                GROUP ITEMS (HIGHER WEIGHTAGE)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">Group 1st Place</span>
                  <input
                    type="number"
                    min="1"
                    value={groupFirstPoints}
                    onChange={(e) => {
                      setGroupFirstPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 15 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">Group 2nd Place</span>
                  <input
                    type="number"
                    min="1"
                    value={groupSecondPoints}
                    onChange={(e) => {
                      setGroupSecondPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 10 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-500 block mb-1">Group 3rd Place</span>
                  <input
                    type="number"
                    min="1"
                    value={groupThirdPoints}
                    onChange={(e) => {
                      setGroupThirdPoints(Number(e.target.value));
                      handleInputChange();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-lg font-bold font-mono focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Default: 7 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PORTAL CONTROL & REGISTRATIONS */}
        {activeTab === 'portal' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Registration Portal Status & Limits</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Open or lock student registrations, define custom closed notices, and restrict maximum entries.
              </p>
            </div>

            {/* Portal Lock Toggle */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    Registration Portal State:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      portalStatus === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {portalStatus}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 mt-1 block">
                  When closed, student enrollments and program additions are locked.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPortalStatus((prev) => (prev === 'OPEN' ? 'CLOSED' : 'OPEN'));
                  handleInputChange();
                }}
                className="cursor-pointer p-1"
              >
                {portalStatus === 'OPEN' ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-neutral-400" />
                )}
              </button>
            </div>

            {/* Closed Notice Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Custom Message Displayed When Portal is Closed
              </label>
              <input
                type="text"
                value={portalClosedMessage}
                onChange={(e) => {
                  setPortalClosedMessage(e.target.value);
                  handleInputChange();
                }}
                placeholder="e.g. Participant registrations are temporarily closed by the Fest Directorate."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Chest Number Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={chestPrefix}
                  onChange={(e) => {
                    setChestPrefix(e.target.value.toUpperCase());
                    handleInputChange();
                  }}
                  placeholder="e.g. FRG (or leave empty for numerical)"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono uppercase focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Prefixed to auto-generated chest IDs.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Max Programme Registrations Per Student
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxRegs}
                  onChange={(e) => {
                    setMaxRegs(Number(e.target.value));
                    handleInputChange();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">Maximum items an individual student can register for.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FOOTER, HELPDESK & REPORTS */}
        {activeTab === 'footer' && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Footer Attributions, Helpdesk & Report Signatures</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Customize copyright lines, control room helpline numbers, and the official signatory designations printed on official scorecards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Footer Heading / Committee Name
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => {
                    setFooterText(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. Fragancia Fest Organising Committee • All Rights Reserved"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={copyright}
                  onChange={(e) => {
                    setCopyright(e.target.value);
                    handleInputChange();
                  }}
                  placeholder="e.g. © 2026 Fragancia. All rights reserved."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Helpdesk / Control Room Contact Line
              </label>
              <input
                type="text"
                value={helpdeskContact}
                onChange={(e) => {
                  setHelpdeskContact(e.target.value);
                  handleInputChange();
                }}
                placeholder="e.g. Control Room: Stage 1 Helpdesk | Ph: +91 98470 00000"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">Displayed in the footer across all views.</span>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-3">
                OFFICIAL REPORT & PRINT SIGNATORIES
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Official Signatory 1 (Left Side)
                  </label>
                  <input
                    type="text"
                    value={signatory1Title}
                    onChange={(e) => {
                      setSignatory1Title(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. Chief Controller / Convener"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Official Signatory 2 (Right Side)
                  </label>
                  <input
                    type="text"
                    value={signatory2Title}
                    onChange={(e) => {
                      setSignatory2Title(e.target.value);
                      handleInputChange();
                    }}
                    placeholder="e.g. General Secretary / Chairman"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        </fieldset>

        {/* Floating / Sticky Save Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <Info className="w-4 h-4 opacity-70" />
            <span>
              {isAdmin
                ? 'Changes made in any tab will be applied together when you click Save.'
                : 'You are currently viewing settings in read-only mode. Switch to Admin role with PIN 18169 to make changes.'}
            </span>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          ) : (
            <span className="text-xs font-mono font-bold opacity-60">Read-Only</span>
          )}
        </div>
      </form>

      {/* Danger Zone / Environment Reset & Content Purge */}
      {isAdmin && (
        <div className="p-6 rounded-[32px] bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm uppercase font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Danger Zone: Content Purge & Environment Reset</span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Purge all contents (registered students, entries, and published results) to begin a fresh fest event, or restore the default Fragancia demo roster.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleClearAllContent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove All Content</span>
            </button>

            <button
              type="button"
              onClick={handleResetToCleanState}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Clean Fragancia Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
