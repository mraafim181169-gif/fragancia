'use client';

import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Award,
  Save,
  Lock,
  Sparkles,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Users,
  Mic,
  FileText,
  Plus,
  Minus,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import {
  Competition,
  JudgeMark,
  Student,
  FestGrade,
  calculateGradeFromScore,
  getCompetitionStageType,
} from '@/types/fest';
import { Badge } from '../ui/Badge';

interface JudgePanelProps {
  initialCompetition?: Competition | null;
}

export function JudgePanel({ initialCompetition }: JudgePanelProps) {
  const store = useFestStore();
  const session = store.getSession();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const students = store.getStudents();
  const marks = store.getJudgeMarks();
  const results = store.getResults();

  // Search & Filter for selecting programme
  const [programSearch, setProgramSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [selectedCompId, setSelectedCompId] = useState<string>(
    initialCompetition?.id || competitions[0]?.id || ''
  );

  const activeComp = competitions.find((c) => c.id === selectedCompId);
  const compRegs = registrations.filter((r) => r.competitionId === selectedCompId);

  // Selected participant for scoring
  const [activeRegId, setActiveRegId] = useState<string>(
    compRegs[0]?.id || ''
  );

  const selectedReg = compRegs.find((r) => r.id === activeRegId) || compRegs[0];
  const activeChestNumber = selectedReg?.chestNumber || '';
  const activeStudentId = selectedReg?.studentId || '';
  const activeStudent = students.find((s) => s.id === activeStudentId);

  // Mark Setup & Scoring State (Default 10-point scale)
  // Direct marks requested: 10, 9, 8, 7, 6, 5 and customizable 1, 2, 3 etc.
  const [currentMark, setCurrentMark] = useState<number>(9);
  const [customInputStr, setCustomInputStr] = useState<string>('9');
  const [selectedGrade, setSelectedGrade] = useState<FestGrade>('A');
  const [remarks, setRemarks] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active participant's existing mark (if any)
  const existingMark = marks.find(
    (m) =>
      m.competitionId === selectedCompId &&
      m.studentId === activeStudentId &&
      m.judgeName === session.name
  );

  // Calculate grade helper for marks out of 10
  const getGradeForMark = (val: number): FestGrade => {
    return calculateGradeFromScore(val, 10);
  };

  // When participant selection changes
  const handleSelectReg = (regId: string) => {
    setActiveRegId(regId);
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    const mk = marks.find(
      (m) =>
        m.competitionId === selectedCompId &&
        m.studentId === reg.studentId &&
        m.judgeName === session.name
    );

    if (mk) {
      // Score may be stored as 0-10 or 0-100
      const normScore = mk.totalScore > 10 ? Math.round((mk.totalScore / 10) * 10) / 10 : mk.totalScore;
      setCurrentMark(normScore);
      setCustomInputStr(String(normScore));
      setSelectedGrade(mk.grade || getGradeForMark(normScore));
      setRemarks(mk.feedback || '');
    } else {
      setCurrentMark(9);
      setCustomInputStr('9');
      setSelectedGrade('A');
      setRemarks('');
    }
    setSaveSuccess(false);
    setFeedbackMessage(null);
  };

  // Direct quick mark click (10, 9, 8, 7, 6, 5, 4, 3, 2, 1)
  const handleQuickMarkSelect = (markValue: number) => {
    setCurrentMark(markValue);
    setCustomInputStr(String(markValue));
    setSelectedGrade(getGradeForMark(markValue));
  };

  // Custom mark input change
  const handleCustomInputChange = (valStr: string) => {
    setCustomInputStr(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setCurrentMark(num);
      setSelectedGrade(getGradeForMark(num));
    }
  };

  // Adjust mark by step (+0.5, -0.5, +1, -1)
  const handleAdjustMark = (delta: number) => {
    const next = Math.min(10, Math.max(0, Math.round((currentMark + delta) * 10) / 10));
    setCurrentMark(next);
    setCustomInputStr(String(next));
    setSelectedGrade(getGradeForMark(next));
  };

  // Filter programmes
  const filteredCompetitions = competitions.filter((comp) => {
    const q = programSearch.trim().toLowerCase();
    const searchMatch =
      !q ||
      comp.name.toLowerCase().includes(q) ||
      comp.categoryName.toLowerCase().includes(q) ||
      comp.stage.toLowerCase().includes(q);
    const catMatch =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'Junior' && comp.categoryName.toLowerCase().includes('junior')) ||
      (categoryFilter === 'Senior' && comp.categoryName.toLowerCase().includes('senior')) ||
      (categoryFilter === 'On Stage' && getCompetitionStageType(comp) === 'On Stage') ||
      (categoryFilter === 'Off Stage' && getCompetitionStageType(comp) === 'Off Stage');
    return searchMatch && catMatch;
  });

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp || !selectedReg) return;

    const finalMark = Math.min(10, Math.max(0, currentMark));
    const finalGrade = selectedGrade || getGradeForMark(finalMark);

    store.saveJudgeMark({
      competitionId: activeComp.id,
      studentId: activeStudentId,
      chestNumber: activeChestNumber,
      grade: finalGrade,
      judgeName: session.name,
      scores: {
        Mark: finalMark,
      },
      totalScore: finalMark,
      maxScore: 10,
      feedback: remarks.trim(),
    });

    setSaveSuccess(true);
    setFeedbackMessage({
      text: `${existingMark ? 'Updated' : 'Saved'} mark for Chest #${activeChestNumber} (${finalMark}/10 Marks • Grade ${finalGrade})!`,
      type: 'success',
    });
    setTimeout(() => {
      setSaveSuccess(false);
      setFeedbackMessage(null);
    }, 3000);
  };

  const handleDeleteMark = (markIdToDelete?: string, chestForMsg?: string) => {
    if (session.role !== 'ADMIN') return;
    const targetId = markIdToDelete || existingMark?.id;
    if (!targetId) return;

    const chest = chestForMsg || activeChestNumber;
    if (window.confirm(`Are you sure you want to delete the evaluation mark for Chest #${chest}?`)) {
      store.deleteJudgeMark(targetId);
      setCurrentMark(9);
      setCustomInputStr('9');
      setSelectedGrade('A');
      setRemarks('');
      setFeedbackMessage({
        text: `Mark deleted successfully for Chest #${chest}.`,
        type: 'info',
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handlePublishResults = () => {
    if (!activeComp) return;
    if (
      window.confirm(
        `Publish official results for "${activeComp.name}"? This will compute house points and update the scoreboard and dashboard.`
      )
    ) {
      store.publishCompetitionResult(activeComp.id);
    }
  };

  const isPublished = results.some((r) => r.competitionId === selectedCompId && r.status === 'Published');

  // Compute live draft standings preview
  const draftResult = activeComp ? store.calculateDraftResult(activeComp.id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
              JUDGE SCORING PANEL
            </h2>
            <Badge variant="dark" className="text-[10px]">
              <Scale className="w-3 h-3 text-indigo-400" />
              MARK SETUP
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Direct 10-point mark evaluation with real-time automatic standing computation
          </p>
        </div>

        {session.role === 'ADMIN' && (
          <button
            onClick={handlePublishResults}
            disabled={!draftResult || draftResult.rankings.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>{isPublished ? 'Republish Results' : 'Publish Official Results'}</span>
          </button>
        )}
      </div>

      {/* Program Selector with Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search programme by name, category, stage (e.g. Qirath, Elocution, Junior)..."
              value={programSearch}
              onChange={(e) => setProgramSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'Junior', 'Senior', 'On Stage', 'Off Stage'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Programme Dropdown / Card Bar */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">
              ACTIVE PROGRAMME SELECTION ({filteredCompetitions.length} MATCHING)
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => {
                setSelectedCompId(e.target.value);
                const regs = registrations.filter((r) => r.competitionId === e.target.value);
                if (regs[0]) handleSelectReg(regs[0].id);
              }}
              className="w-full text-sm sm:text-base font-bold bg-neutral-50 dark:bg-neutral-900 py-2 px-3 rounded-xl border border-black/10 dark:border-white/10 text-neutral-950 dark:text-white focus:outline-none cursor-pointer"
            >
              {filteredCompetitions.map((c) => {
                const cRegs = registrations.filter((r) => r.competitionId === c.id);
                return (
                  <option key={c.id} value={c.id} className="text-black dark:text-white bg-white dark:bg-neutral-900">
                    {c.name} — {c.categoryName} [{c.stage || 'General'}] ({cRegs.length} Participants • {c.status})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={activeComp?.status === 'Live' ? 'live' : 'default'} pulse={activeComp?.status === 'Live'}>
              {activeComp?.status || 'Upcoming'}
            </Badge>
            {isPublished ? (
              <Badge variant="completed">RESULTS PUBLISHED</Badge>
            ) : (
              <Badge variant="outline">{compRegs.length} Participants</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Participant Queue identified by Chest Number & Name (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>PARTICIPANTS ({compRegs.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              Select to score
            </span>
          </div>

          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {compRegs.length === 0 ? (
              <div className="w-full p-6 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-xs text-neutral-400 text-center">
                No participants registered for this programme.
              </div>
            ) : (
              compRegs.map((reg) => {
                const isSelected = reg.id === activeRegId;
                const regStudent = students.find((s) => s.id === reg.studentId);
                const markRecord = marks.find(
                  (m) =>
                    m.competitionId === selectedCompId &&
                    m.studentId === reg.studentId &&
                    m.judgeName === session.name
                );

                const markDisplay = markRecord
                  ? (markRecord.totalScore <= 10 ? markRecord.totalScore : (markRecord.totalScore / 10).toFixed(1))
                  : null;

                return (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectReg(reg.id)}
                    className={`min-w-[200px] sm:min-w-[220px] lg:min-w-0 shrink-0 lg:shrink p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 shadow-md font-bold'
                        : 'bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Chest Number Badge */}
                      <div className={`px-2.5 py-1.5 rounded-xl font-mono font-black text-xs shrink-0 flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      }`}>
                        #{reg.chestNumber}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold truncate">
                          {regStudent?.fullName || reg.studentName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] opacity-70">
                          <span className="truncate">{regStudent?.teamName || reg.teamName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
                      {markRecord ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{markDisplay} / 10</span>
                          </span>
                          <span className="text-[10px] font-mono font-black uppercase text-amber-500">
                            Grade {markRecord.grade || getGradeForMark(Number(markDisplay))}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono opacity-50 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Scoring Form with Mark Setup (8 cols) */}
        <div className="lg:col-span-8">
          {activeChestNumber ? (
            <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
              {/* Participant Header (Clean Chest Number & Student Name) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex flex-col items-center justify-center font-mono shadow-sm shrink-0">
                    <span className="text-[9px] uppercase tracking-wider opacity-70">CHEST</span>
                    <span className="text-xl font-black">#{activeChestNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        EVALUATING PARTICIPANT
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {activeStudent?.teamName || selectedReg?.teamName || 'House'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg sm:text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
                        {activeStudent?.fullName || selectedReg?.studentName}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Category: {activeComp?.categoryName} • Venue: {activeComp?.stage || 'Main Stage'}
                    </p>
                  </div>
                </div>

                {/* Score & Grade Display */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-2xl bg-neutral-50 dark:bg-neutral-900 sm:bg-transparent">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    SELECTED GRADE
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-3.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black font-mono text-xl">
                      {selectedGrade}
                    </span>
                  </div>
                </div>
              </div>

              {existingMark && (
                <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Existing mark on record: <strong>{existingMark.totalScore <= 10 ? existingMark.totalScore : (existingMark.totalScore / 10).toFixed(1)} / 10 (Grade {existingMark.grade})</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Modify and click Save to update
                  </span>
                </div>
              )}

              {feedbackMessage && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              {/* DIRECT MARK SETUP SECTION (Requested by User) */}
              <form onSubmit={handleSaveScore} className="space-y-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 space-y-5">
                  {/* Primary Marks (10, 9, 8, 7, 6, 5) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        PRIMARY MARKS SETUP (10, 9, 8, 7, 6, 5)
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">1-Tap Direct Score</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                      {[10, 9, 8, 7, 6, 5].map((val) => {
                        const isValActive = currentMark === val;
                        const grade = getGradeForMark(val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleQuickMarkSelect(val)}
                            className={`py-3 px-2 rounded-2xl font-mono transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                              isValActive
                                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md ring-2 ring-indigo-500/40 scale-105 font-black'
                                : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:border-black/30 hover:scale-[1.02]'
                            }`}
                          >
                            <span className="text-2xl font-black">{val}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isValActive ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                            }`}>
                              Grade {grade}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary / Customizable Marks (4, 3, 2, 1) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        CUSTOMIZE MARKS (4, 3, 2, 1)
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">Lower & Custom Range</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {[4, 3, 2, 1].map((val) => {
                        const isValActive = currentMark === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleQuickMarkSelect(val)}
                            className={`py-2 px-2 rounded-xl font-mono transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isValActive
                                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md ring-2 ring-indigo-500/40 font-black'
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10 hover:border-black/30'
                            }`}
                          >
                            <span className="text-lg font-black">{val}</span>
                            <span className="text-[9px] opacity-70">Mark</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Mark Input & Steppers */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                        Custom Mark / Precise Decimal Entry
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Type any custom score (e.g. 9.5, 8.5, 7.2) or use steppers
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustMark(-0.5)}
                        className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold font-mono transition-colors cursor-pointer"
                        title="Decrease by 0.5"
                      >
                        -0.5
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={customInputStr}
                          onChange={(e) => handleCustomInputChange(e.target.value)}
                          className="w-24 px-3 py-2 text-xl font-black font-mono text-center rounded-xl bg-white dark:bg-black border-2 border-indigo-500/50 focus:border-indigo-600 dark:focus:border-indigo-400 text-neutral-950 dark:text-white focus:outline-none shadow-inner"
                        />
                        <span className="absolute right-2 bottom-1.5 text-[10px] font-mono text-neutral-400 pointer-events-none">
                          /10
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdjustMark(0.5)}
                        className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold font-mono transition-colors cursor-pointer"
                        title="Increase by 0.5"
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Confidential Judge Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent articulation, clear pronounciation, strong stage presence."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                  />
                </div>

                {/* Action Buttons: Delete, Reset, Save */}
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-black/5 dark:border-white/5">
                  <div>
                    {existingMark && session.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMark(existingMark.id, activeChestNumber)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs cursor-pointer border border-red-200 dark:border-red-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Mark</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {existingMark && (
                      <button
                        type="button"
                        onClick={() => {
                          const normScore = existingMark.totalScore > 10 ? Math.round((existingMark.totalScore / 10) * 10) / 10 : existingMark.totalScore;
                          setCurrentMark(normScore);
                          setCustomInputStr(String(normScore));
                          setSelectedGrade(existingMark.grade || getGradeForMark(normScore));
                          setRemarks(existingMark.feedback || '');
                        }}
                        title="Reset to saved mark"
                        className="px-3.5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-xs cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      {existingMark ? <Edit2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      <span>
                        {existingMark ? 'Update Mark' : 'Save Mark'} for #{activeChestNumber} ({currentMark}/10 • Grade {selectedGrade})
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-neutral-400">
              Select a participant from the queue to start judging.
            </div>
          )}

          {/* Real-time Computed Standings Preview (Identified by Chest Number & Name) */}
          {draftResult && draftResult.rankings.length > 0 && (
            <div className="mt-6 p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  CURRENT STANDINGS DRAFT ({draftResult.rankings.length} evaluated)
                </h4>
                <span className="text-[11px] font-mono text-neutral-400">
                  Ranked by awarded marks
                </span>
              </div>

              <div className="divide-y divide-black/5 dark:divide-white/5 text-xs font-mono">
                {draftResult.rankings.map((rk) => {
                  const rkDisplay = rk.totalScore <= 10 ? rk.totalScore : (rk.totalScore / 10).toFixed(1);
                  return (
                    <div key={rk.studentId} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 ${
                          rk.rank === 1 ? 'text-amber-500 font-black' : rk.rank === 2 ? 'text-neutral-400 font-black' : rk.rank === 3 ? 'text-amber-700 font-black' : 'text-neutral-400'
                        }`}>
                          #{rk.rank}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-black text-neutral-900 dark:text-white">
                          #{rk.chestNumber}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-neutral-900 dark:text-white">
                            {rk.studentName}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {rk.teamName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                          Grade {rk.grade || getGradeForMark(Number(rkDisplay))}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-neutral-900 dark:text-white">
                            {rkDisplay}
                          </span>
                          <span className="text-neutral-400 text-[10px]">/ 10</span>
                        </div>
                        <div className="flex items-center gap-1 pl-2 border-l border-black/5 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              const targetReg = compRegs.find((r) => r.studentId === rk.studentId);
                              if (targetReg) handleSelectReg(targetReg.id);
                            }}
                            title="Edit this participant score"
                            className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {session.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetMark = marks.find(
                                  (m) =>
                                    m.competitionId === selectedCompId &&
                                    m.studentId === rk.studentId
                                );
                                if (targetMark) {
                                  handleDeleteMark(targetMark.id, rk.chestNumber);
                                }
                              }}
                              title="Delete this participant score"
                              className="p-1 rounded-md bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
