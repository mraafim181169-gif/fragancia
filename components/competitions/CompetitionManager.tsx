'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Users,
  Award,
  Radio,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
  Search,
  Mic,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import {
  Competition,
  CompetitionStatus,
  CompetitionType,
  CompetitionCriteria,
  StageType,
  getCompetitionStageType,
} from '@/types/fest';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { NavTab } from '../layout/Sidebar';

interface CompetitionManagerProps {
  onNavigateToJudging?: (comp: Competition) => void;
  selectedFromSearch?: Competition | null;
}

export function CompetitionManager({
  onNavigateToJudging,
  selectedFromSearch,
}: CompetitionManagerProps) {
  const store = useFestStore();
  const session = store.getSession();
  const competitions = store.getCompetitions();
  const categories = store.getCategories();
  const registrations = store.getRegistrations();
  const results = store.getResults();

  // Primary Separate Tab Filter: ALL | On Stage | Off Stage
  const [stageFilter, setStageFilter] = useState<'ALL' | 'On Stage' | 'Off Stage'>('ALL');

  // Secondary Filters
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [viewingComp, setViewingComp] = useState<Competition | null>(
    selectedFromSearch || null
  );

  // Counts for tabs
  const onStageCount = competitions.filter((c) => getCompetitionStageType(c) === 'On Stage').length;
  const offStageCount = competitions.filter((c) => getCompetitionStageType(c) === 'Off Stage').length;

  const handleStageTabChange = (tab: 'ALL' | 'On Stage' | 'Off Stage') => {
    setStageFilter(tab);
    // If current category is incompatible with the chosen tab, gently reset to ALL
    if (tab === 'On Stage') {
      const isOffCat = selectedCat === 'cat-senior-off' || selectedCat === 'cat-junior-off';
      if (isOffCat) setSelectedCat('ALL');
    } else if (tab === 'Off Stage') {
      const isOnCat = selectedCat === 'cat-senior-on' || selectedCat === 'cat-junior-on';
      if (isOnCat) setSelectedCat('ALL');
    }
  };

  // Add/Edit Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    type: 'Single' as CompetitionType,
    stageType: 'On Stage' as StageType,
    stage: 'Main Auditorium',
    scheduledTime: '10:00 AM',
    durationMinutes: 10,
    firstPlacePoints: 10,
    secondPlacePoints: 7,
    thirdPlacePoints: 5,
    rules: '',
  });

  const openCreateModal = () => {
    const initialStageType = stageFilter === 'Off Stage' ? 'Off Stage' : 'On Stage';
    const matchingCat = categories.find((c) =>
      initialStageType === 'On Stage' ? c.name.includes('On Stage') : c.name.includes('Off Stage')
    );

    setFormData({
      name: '',
      categoryId: matchingCat?.id || categories[0]?.id || '',
      type: 'Single',
      stageType: initialStageType,
      stage: initialStageType === 'On Stage' ? 'Main Auditorium' : 'Exam Hall 1',
      scheduledTime: '11:00 AM',
      durationMinutes: 10,
      firstPlacePoints: 10,
      secondPlacePoints: 7,
      thirdPlacePoints: 5,
      rules:
        initialStageType === 'On Stage'
          ? 'Judging based on stage poise, vocal modulation, cadence, and adherence to time.'
          : 'Strict adherence to theme, neatness, time duration, and originality.',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (comp: Competition) => {
    const computedStageType = getCompetitionStageType(comp);
    setEditingComp(comp);
    setFormData({
      name: comp.name,
      categoryId: comp.categoryId,
      type: comp.type,
      stageType: comp.stageType || computedStageType,
      stage: comp.stage,
      scheduledTime: comp.scheduledTime || comp.startTime || '09:00 AM',
      durationMinutes: comp.durationMinutes || 10,
      firstPlacePoints: comp.firstPlacePoints,
      secondPlacePoints: comp.secondPlacePoints,
      thirdPlacePoints: comp.thirdPlacePoints,
      rules: comp.rules || '',
    });
  };

  const handleSaveCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const cat = categories.find((c) => c.id === formData.categoryId);
    const finalStage = formData.stageType === 'Off Stage' ? '' : (formData.stage.trim() || 'Main Stage');

    if (editingComp) {
      store.updateCompetition(editingComp.id, {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: cat?.name || '',
        type: formData.type,
        stageType: formData.stageType,
        stage: finalStage,
        scheduledTime: formData.scheduledTime.trim(),
        durationMinutes: Number(formData.durationMinutes),
        firstPlacePoints: Number(formData.firstPlacePoints),
        secondPlacePoints: Number(formData.secondPlacePoints),
        thirdPlacePoints: Number(formData.thirdPlacePoints),
        rules: formData.rules.trim(),
      });
      setEditingComp(null);
    } else {
      store.createCompetition({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: cat?.name || '',
        type: formData.type,
        stageType: formData.stageType,
        stage: finalStage,
        scheduledTime: formData.scheduledTime.trim(),
        durationMinutes: Number(formData.durationMinutes),
        firstPlacePoints: Number(formData.firstPlacePoints),
        secondPlacePoints: Number(formData.secondPlacePoints),
        thirdPlacePoints: Number(formData.thirdPlacePoints),
        rules: formData.rules.trim(),
        status: 'Upcoming',
      });
      setIsAddModalOpen(false);
    }
  };

  const handleStatusChange = (comp: Competition, nextStatus: CompetitionStatus) => {
    store.updateCompetition(comp.id, { status: nextStatus });
  };

  const handleDeleteComp = (comp: Competition) => {
    if (window.confirm(`Are you sure you want to delete "${comp.name}"?`)) {
      store.deleteCompetition(comp.id);
      if (viewingComp?.id === comp.id) setViewingComp(null);
    }
  };

  const filteredCompetitions = competitions.filter((c) => {
    const compStageType = getCompetitionStageType(c);
    const stageTypeMatch = stageFilter === 'ALL' || compStageType === stageFilter;
    const catMatch = selectedCat === 'ALL' || c.categoryId === selectedCat;
    const statusMatch = selectedStatus === 'ALL' || c.status === selectedStatus;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.stage.toLowerCase().includes(q) ||
      c.categoryName.toLowerCase().includes(q);
    return stageTypeMatch && catMatch && statusMatch && searchMatch;
  });

  // Filter available category pills based on selected stageFilter
  const visibleCategories = categories.filter((c) => {
    if (stageFilter === 'On Stage') {
      return !c.name.toLowerCase().includes('off stage');
    }
    if (stageFilter === 'Off Stage') {
      return !c.name.toLowerCase().includes('on stage');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            COMPETITIONS & PROGRAMMES
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Stages, point weightage and live evaluation statuses
          </p>
        </div>

        {session.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Programme</span>
          </button>
        )}
      </div>

      {/* Top Prominent Separate Tab Bar for On Stage & Off Stage */}
      <div className="p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* ALL TAB */}
          <button
            type="button"
            onClick={() => handleStageTabChange('ALL')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageFilter === 'ALL'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">All Programmes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageFilter === 'ALL'
                  ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {competitions.length}
            </span>
          </button>

          {/* ON STAGE TAB */}
          <button
            type="button"
            onClick={() => handleStageTabChange('On Stage')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageFilter === 'On Stage'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span className="truncate">On Stage</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageFilter === 'On Stage'
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {onStageCount}
            </span>
          </button>

          {/* OFF STAGE TAB */}
          <button
            type="button"
            onClick={() => handleStageTabChange('Off Stage')}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              stageFilter === 'Off Stage'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">Off Stage</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                stageFilter === 'Off Stage'
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {offStageCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${stageFilter === 'ALL' ? 'programmes' : stageFilter + ' programmes'} by name, venue or category...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="text-xs text-neutral-500 font-mono whitespace-nowrap pl-1 hidden lg:block">
            {filteredCompetitions.length} of {competitions.length}
          </div>
        </div>
      </div>

      {/* Category Pills Bar for Quick Tap Filtering */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCat === 'ALL'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          All ({competitions.filter((c) => stageFilter === 'ALL' || getCompetitionStageType(c) === stageFilter).length})
        </button>
        {visibleCategories.map((c) => {
          const count = competitions.filter(
            (comp) =>
              comp.categoryId === c.id &&
              (stageFilter === 'ALL' || getCompetitionStageType(comp) === stageFilter)
          ).length;
          const active = selectedCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                active
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Competitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions.map((comp) => {
          const compRegs = registrations.filter((r) => r.competitionId === comp.id);
          const compResult = results.find((r) => r.competitionId === comp.id);
          const compStageType = getCompetitionStageType(comp);

          return (
            <div
              key={comp.id}
              className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        compStageType === 'On Stage'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
                      }`}
                    >
                      {compStageType === 'On Stage' ? (
                        <Mic className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {compStageType}
                    </span>
                    <Badge variant="category">{comp.categoryName}</Badge>
                  </div>

                  <Badge
                    variant={
                      comp.status === 'Live'
                        ? 'live'
                        : comp.status === 'Completed'
                        ? 'completed'
                        : 'upcoming'
                    }
                    pulse={comp.status === 'Live'}
                  >
                    {comp.status}
                  </Badge>
                </div>

                {/* Competition Name */}
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {comp.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {comp.rules || 'Official competition rules and criteria apply.'}
                </p>

                {/* Logistics */}
                <div className="mt-4 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  {compStageType === 'On Stage' && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{comp.stage || 'Main Stage'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {comp.scheduledTime} ({comp.durationMinutes} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{compRegs.length} Participants Enrolled</span>
                  </div>
                </div>

                {/* Point Allocation Box */}
                <div className="mt-5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-neutral-400 uppercase">Points:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      1st: {comp.firstPlacePoints}
                    </span>
                    <span className="text-neutral-500">2nd: {comp.secondPlacePoints}</span>
                    <span className="text-neutral-500">3rd: {comp.thirdPlacePoints}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingComp(comp)}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Status Toggle Quick Buttons for Admin */}
                  {session.role === 'ADMIN' && (
                    <select
                      value={comp.status}
                      onChange={(e) =>
                        handleStatusChange(comp, e.target.value as CompetitionStatus)
                      }
                      className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 cursor-pointer"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Live">Live</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}

                  {/* Judge Panel CTA */}
                  {onNavigateToJudging && (
                    <button
                      onClick={() => onNavigateToJudging(comp)}
                      title="Open Blind Judging Panel"
                      className="p-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                    >
                      <Radio className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Score</span>
                    </button>
                  )}

                  {session.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => openEditModal(comp)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComp(comp)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Competition */}
      {(isAddModalOpen || editingComp) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingComp(null);
          }}
          title={editingComp ? 'Edit Competition' : 'Create New Competition'}
          subtitle="Configure stage, scheduled timeline, and point allocations."
          maxWidth="xl"
        >
          <form onSubmit={handleSaveCompetition} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Programme Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Elocution (English)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            {/* Stage Classification: On Stage vs Off Stage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Stage Classification *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      stageType: 'On Stage',
                      stage: formData.stage.trim() || 'Main Stage',
                    })
                  }
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    formData.stageType === 'On Stage'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Mic className="w-4 h-4 text-indigo-500" />
                  <span>🎭 On Stage (Main Stage)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      stageType: 'Off Stage',
                      stage: '',
                    })
                  }
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    formData.stageType === 'Off Stage'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>📝 Off Stage (No Stage)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const nextCatId = e.target.value;
                    const catObj = categories.find((c) => c.id === nextCatId);
                    let inferredStageType = formData.stageType;
                    if (catObj?.name.toLowerCase().includes('on stage')) {
                      inferredStageType = 'On Stage';
                    } else if (catObj?.name.toLowerCase().includes('off stage')) {
                      inferredStageType = 'Off Stage';
                    }
                    setFormData({
                      ...formData,
                      categoryId: nextCatId,
                      stageType: inferredStageType,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as CompetitionType })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="Single">Single (Individual)</option>
                  <option value="Group">Group</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Stage
                </label>
                {formData.stageType === 'Off Stage' ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 text-xs text-neutral-400 italic">
                    Off Stage (No Stage)
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Main Stage"
                    value={formData.stage || 'Main Stage'}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  placeholder="10:30 AM"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Points Weightage */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Points Allocation (House Standings)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-amber-600 block">
                    1st Place (Gold)
                  </label>
                  <input
                    type="number"
                    value={formData.firstPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, firstPlacePoints: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block">
                    2nd Place (Silver)
                  </label>
                  <input
                    type="number"
                    value={formData.secondPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, secondPlacePoints: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-amber-700 block">
                    3rd Place (Bronze)
                  </label>
                  <input
                    type="number"
                    value={formData.thirdPlacePoints}
                    onChange={(e) =>
                      setFormData({ ...formData, thirdPlacePoints: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-sm font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Rules & Judging Criteria
              </label>
              <textarea
                rows={3}
                placeholder="Detail time limits, evaluation dimensions, and deduction guidelines"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingComp(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                {editingComp ? 'Save Changes' : 'Create Competition'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Competition Dossier */}
      {viewingComp && (
        <Modal
          isOpen={true}
          onClose={() => setViewingComp(null)}
          title={viewingComp.name}
          subtitle={`${getCompetitionStageType(viewingComp)} • ${viewingComp.categoryName} • ${viewingComp.stage} • ${viewingComp.scheduledTime}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Criteria / Rules */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Rules & Criteria
              </h4>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {viewingComp.rules}
              </p>
            </div>

            {/* Enrolled Participants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Enrolled Participants ({registrations.filter((r) => r.competitionId === viewingComp.id).length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {registrations
                  .filter((r) => r.competitionId === viewingComp.id)
                  .map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                          {reg.chestNumber}
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {reg.studentName}
                        </span>
                        <span className="text-neutral-400">({reg.teamName})</span>
                      </div>
                      <Badge variant={reg.status === 'Registered' ? 'completed' : 'upcoming'}>
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Official Results If Published */}
            {results.find((r) => r.competitionId === viewingComp.id) && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Official Published Podium
                </h4>
                <div className="space-y-2 text-xs">
                  {results
                    .find((r) => r.competitionId === viewingComp.id)
                    ?.rankings.map((rk) => (
                      <div
                        key={rk.rank}
                        className="flex items-center justify-between font-mono p-2 rounded-xl bg-white/60 dark:bg-neutral-900/80"
                      >
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          {rk.rank === 1 ? '🥇 1ST PLACE' : rk.rank === 2 ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}
                        </span>
                        <span className="font-bold">
                          {rk.chestNumber} - {rk.studentName} ({rk.teamName})
                        </span>
                        <span className="font-bold text-amber-600">{rk.pointsAwarded} PTS</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
