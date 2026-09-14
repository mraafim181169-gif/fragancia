'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Users,
  Mic,
  FileText,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Student, Competition, Registration, getCompetitionStageType } from '@/types/fest';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface AssignProgrammesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: Student | null;
}

export function AssignProgrammesModal({
  isOpen,
  onClose,
  initialStudent,
}: AssignProgrammesModalProps) {
  const store = useFestStore();
  const session = store.getSession();
  const students = store.getStudents();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const categories = store.getCategories();
  const settings = store.getSettings();

  // Active student state (allows switching between students directly inside modal)
  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudent?.id || students[0]?.id || ''
  );
  const [prevInitialId, setPrevInitialId] = useState<string | undefined>(initialStudent?.id);

  // Sync if initialStudent prop changes (React recommended pattern for state adjustment from props)
  if (initialStudent?.id && initialStudent.id !== prevInitialId) {
    setPrevInitialId(initialStudent.id);
    setActiveStudentId(initialStudent.id);
  }

  const currentStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) || students[0],
    [students, activeStudentId]
  );

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'On Stage' | 'Off Stage' | 'ASSIGNED'>('ALL');
  const [categoryFilterOnly, setCategoryFilterOnly] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Local refresh tick to force instantaneous state update when assigning/removing
  const [refreshTick, setRefreshTick] = useState(0);

  // Batch selection state
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>([]);

  // Current student's registrations (directly derived on every render to ensure numbers update immediately)
  const studentRegistrations = currentStudent
    ? registrations.filter((r) => r.studentId === currentStudent.id && r.status !== 'Cancelled')
    : [];

  const assignedCompIdSet = new Set(studentRegistrations.map((r) => r.competitionId));

  // Filter competitions for this student (derived directly to ensure immediate reactive updates)
  const query = searchQuery.trim().toLowerCase();
  const filteredCompetitions = currentStudent
    ? competitions.filter((comp) => {
        const compStageType = getCompetitionStageType(comp);

        // Search match
        const matchesSearch =
          !query ||
          comp.name.toLowerCase().includes(query) ||
          comp.categoryName.toLowerCase().includes(query) ||
          (comp.rules || '').toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Stage filter
        if (stageFilter === 'On Stage' && compStageType !== 'On Stage') return false;
        if (stageFilter === 'Off Stage' && compStageType !== 'Off Stage') return false;
        if (stageFilter === 'ASSIGNED' && !assignedCompIdSet.has(comp.id)) return false;

        // Category filter (show matching category or general)
        if (categoryFilterOnly) {
          const sCat = (currentStudent.categoryName || '').toLowerCase();
          const cCat = (comp.categoryName || '').toLowerCase();
          const isGeneral =
            comp.type === 'General' ||
            comp.categoryId === 'cat-general' ||
            cCat.includes('general');

          const matchesSenior = sCat.includes('senior') && cCat.includes('senior');
          const matchesJunior = sCat.includes('junior') && cCat.includes('junior');

          if (!isGeneral && comp.categoryId !== currentStudent.categoryId && !matchesSenior && !matchesJunior) {
            return false;
          }
        }

        return true;
      })
    : [];

  const handleAssignSingle = (comp: Competition) => {
    if (!currentStudent) return;
    setFeedbackMessage(null);

    const result = store.registerStudent(comp.id, currentStudent.id, true);
    setRefreshTick((t) => t + 1);
    if (result.success) {
      setFeedbackMessage({ text: `Assigned "${comp.name}" to ${currentStudent.fullName}!`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: result.message, type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleRemoveRegistration = (regId: string, compName: string) => {
    store.deleteRegistration(regId);
    setRefreshTick((t) => t + 1);
    setFeedbackMessage({ text: `Removed "${compName}" from ${currentStudent?.fullName}`, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleToggleSelectComp = (compId: string) => {
    setSelectedCompIds((prev) =>
      prev.includes(compId) ? prev.filter((id) => id !== compId) : [...prev, compId]
    );
  };

  const handleBatchAssign = () => {
    if (!currentStudent || selectedCompIds.length === 0) return;
    let successCount = 0;
    let failedMsg = '';

    selectedCompIds.forEach((compId) => {
      if (!assignedCompIdSet.has(compId)) {
        const res = store.registerStudent(compId, currentStudent.id, true);
        if (res.success) {
          successCount++;
        } else {
          failedMsg = res.message;
        }
      }
    });

    setRefreshTick((t) => t + 1);
    setSelectedCompIds([]);
    if (successCount > 0) {
      setFeedbackMessage({
        text: `Successfully assigned ${successCount} programme(s) to ${currentStudent.fullName}!`,
        type: 'success',
      });
    } else if (failedMsg) {
      setFeedbackMessage({ text: failedMsg, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  if (!currentStudent) return null;

  const currentCategory = categories.find((c) => c.id === currentStudent.categoryId);
  const maxAllowed = currentCategory?.maxCompetitionsPerStudent || settings.maxRegistrationsPerStudent || 5;
  const isAtOrAboveLimit = studentRegistrations.length >= maxAllowed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Programmes to Participant"
      subtitle="Select and allocate On-Stage and Off-Stage programmes for each student."
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Participant Switcher & Summary Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Select Participant
              </label>
              <select
                value={currentStudent.id}
                onChange={(e) => {
                  setActiveStudentId(e.target.value);
                  setSelectedCompIds([]);
                  setFeedbackMessage(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.chestNumber}] {s.fullName} ({s.teamName} • {s.categoryName})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Stat Badge */}
            <div className="flex items-center gap-2 self-start sm:self-end pt-1">
              <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-right font-mono min-w-[120px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold">Assigned</span>
                  <span className={`text-sm font-black ${isAtOrAboveLimit ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {studentRegistrations.length} / {maxAllowed}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${isAtOrAboveLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (studentRegistrations.length / maxAllowed) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-right font-mono">
                <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Points</span>
                <span className="text-sm font-bold text-amber-500">
                  {currentStudent.totalPoints} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Student Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono font-bold">
              {currentStudent.chestNumber}
            </span>
            <Badge variant="team">{currentStudent.teamName}</Badge>
            <Badge variant="category">{currentStudent.categoryName}</Badge>
            {currentStudent.role && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono font-semibold">
                {currentStudent.role}
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Controls: Search, Stage Filter, Category Toggle */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search programmes by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {/* Category match filter toggle */}
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={categoryFilterOnly}
                onChange={(e) => setCategoryFilterOnly(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
              />
              <span>{currentStudent.categoryName} Only</span>
            </label>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setStageFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stageFilter === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              All Programmes ({competitions.length})
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('On Stage')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stageFilter === 'On Stage'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Main Stage</span>
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('Off Stage')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stageFilter === 'Off Stage'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Off Stage</span>
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('ASSIGNED')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stageFilter === 'ASSIGNED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assigned to Student ({studentRegistrations.length})</span>
            </button>
          </div>
        </div>

        {/* Batch action bar if any selected */}
        {selectedCompIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              {selectedCompIds.length} programme(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompIds([])}
                className="px-2 py-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleBatchAssign}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Assign Selected
              </button>
            </div>
          </div>
        )}

        {/* Programmes List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-black/5 dark:divide-white/5">
          {filteredCompetitions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
              <p className="text-xs text-neutral-500">
                No programmes match your search or category criteria.
              </p>
              {categoryFilterOnly && (
                <button
                  type="button"
                  onClick={() => setCategoryFilterOnly(false)}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Show programmes from all categories
                </button>
              )}
            </div>
          ) : (
            filteredCompetitions.map((comp) => {
              const compStageType = getCompetitionStageType(comp);
              const isAssigned = assignedCompIdSet.has(comp.id);
              const reg = studentRegistrations.find((r) => r.competitionId === comp.id);
              const isSelected = selectedCompIds.includes(comp.id);

              return (
                <div
                  key={comp.id}
                  className={`pt-2 pb-2 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isAssigned
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30'
                      : isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox for batch assign (only if not already assigned) */}
                    {!isAssigned ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectComp(comp.id)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-0 cursor-pointer"
                        title="Select for batch assign"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                          {comp.name}
                        </span>

                        {/* Stage Badge: Main Stage for On Stage; NO stage for Off Stage */}
                        {compStageType === 'On Stage' ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-mono text-[10px] font-bold tracking-tight">
                            🎭 Main Stage
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-mono text-[10px] font-bold tracking-tight">
                            📝 Off Stage
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-neutral-400">
                          {comp.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                        <span>{comp.categoryName}</span>
                        {comp.scheduledTime && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{comp.scheduledTime}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono">Max: {comp.maxParticipants}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isAssigned ? (
                      <div className="flex items-center gap-1">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                          Assigned {reg?.codeLetter ? `[${reg.codeLetter}]` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => reg && handleRemoveRegistration(reg.id, comp.name)}
                          title="Remove registration"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAssignSingle(comp)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-95 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="text-xs text-neutral-500 font-mono">
            {studentRegistrations.length} total programmes assigned
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
