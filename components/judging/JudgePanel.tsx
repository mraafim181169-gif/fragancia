'use client';

import React, { useState } from 'react';
import {
  Scale,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Award,
  Save,
  Send,
  Lock,
  Sparkles,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import {
  Competition,
  JudgeMark,
  Student,
  FestGrade,
  calculateGradeFromScore,
  getCodeLetterForIndex,
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
  const marks = store.getJudgeMarks();
  const results = store.getResults();

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
  const activeRegIndex = compRegs.findIndex((r) => r.id === (selectedReg?.id || ''));
  const activeCodeLetter = selectedReg?.codeLetter || (activeRegIndex >= 0 ? getCodeLetterForIndex(activeRegIndex) : 'A');

  // Mark scoring state
  const [typedTotal, setTypedTotal] = useState<string>('86');
  const [selectedGrade, setSelectedGrade] = useState<FestGrade>('A+');
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

  const handleSelectReg = (regId: string) => {
    setActiveRegId(regId);
    setSaveSuccess(false);
    setFeedbackMessage(null);
    const reg = compRegs.find((r) => r.id === regId);
    if (!reg) return;

    const existing = marks.find(
      (m) =>
        m.competitionId === selectedCompId &&
        m.studentId === reg.studentId &&
        m.judgeName === session.name
    );

    if (existing) {
      setTypedTotal(String(existing.totalScore));
      setSelectedGrade(existing.grade || calculateGradeFromScore(existing.totalScore, 100));
      setRemarks(existing.feedback || '');
    } else {
      setTypedTotal('85');
      setSelectedGrade('A+');
      setRemarks('');
    }
  };

  const handleTypedTotalChange = (valStr: string) => {
    setTypedTotal(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const g = calculateGradeFromScore(num, 100);
      setSelectedGrade(g);
    }
  };

  const handleGradeButtonClick = (grade: FestGrade) => {
    setSelectedGrade(grade);
    let targetScore = 85;
    if (grade === 'A+') targetScore = 95;
    else if (grade === 'A') targetScore = 85;
    else if (grade === 'B+') targetScore = 75;
    else if (grade === 'B') targetScore = 65;
    else if (grade === 'C+') targetScore = 55;
    else if (grade === 'C') targetScore = 45;
    else if (grade === 'NO GRADE') targetScore = 35;
    setTypedTotal(String(targetScore));
  };

  const currentTotal = Number(typedTotal) || 0;

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp || !selectedReg) return;

    const finalTotal = Math.min(100, Math.max(0, Number(typedTotal) || 0));
    const finalGrade = selectedGrade || calculateGradeFromScore(finalTotal, 100);

    store.saveJudgeMark({
      competitionId: activeComp.id,
      studentId: activeStudentId,
      chestNumber: activeChestNumber,
      codeLetter: activeCodeLetter,
      grade: finalGrade,
      judgeName: session.name,
      scores: {
        Total: finalTotal,
      },
      totalScore: finalTotal,
      maxScore: 100,
      feedback: remarks.trim(),
    });

    setSaveSuccess(true);
    setFeedbackMessage({
      text: `${existingMark ? 'Updated' : 'Saved'} mark for Code ${activeCodeLetter} (${finalTotal} Marks • Grade ${finalGrade})!`,
      type: 'success',
    });
    setTimeout(() => {
      setSaveSuccess(false);
      setFeedbackMessage(null);
    }, 3000);
  };

  const handleDeleteMark = (markIdToDelete?: string, codeLetterForMsg?: string) => {
    if (session.role !== 'ADMIN') return;
    const targetId = markIdToDelete || existingMark?.id;
    if (!targetId) return;

    const code = codeLetterForMsg || activeCodeLetter;
    if (window.confirm(`Are you sure you want to delete the evaluation mark for Code ${code}?`)) {
      store.deleteJudgeMark(targetId);
      setTypedTotal('85');
      setSelectedGrade('A+');
      setRemarks('');
      setFeedbackMessage({
        text: `Mark deleted successfully for Code ${code}.`,
        type: 'info',
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handlePublishResults = () => {
    if (!activeComp) return;
    if (
      window.confirm(
        `Publish official 1st, 2nd, and 3rd rank for "${activeComp.name}"? This will compute house points and update the leaderboard.`
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
              BLIND JUDGING PANEL
            </h2>
            <Badge variant="dark" className="text-[10px]">
              <EyeOff className="w-3 h-3 text-amber-400" />
              ANONYMOUS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Participant identities and house affiliations are strictly hidden to ensure unbiased evaluation
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

      {/* Select Competition Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex-1">
          <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">
            SELECT ACTIVE PROGRAMME
          </label>
          <select
            value={selectedCompId}
            onChange={(e) => {
              setSelectedCompId(e.target.value);
              const regs = registrations.filter((r) => r.competitionId === e.target.value);
              if (regs[0]) handleSelectReg(regs[0].id);
            }}
            className="w-full text-base font-bold bg-transparent text-neutral-950 dark:text-white focus:outline-none cursor-pointer"
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id} className="text-black dark:text-white bg-white dark:bg-neutral-900">
                {c.name} — {c.categoryName} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={activeComp?.status === 'Live' ? 'live' : 'default'} pulse={activeComp?.status === 'Live'}>
            {activeComp?.status}
          </Badge>
          {isPublished && <Badge variant="completed">RESULTS PUBLISHED</Badge>}
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chest Number Selector Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            PARTICIPANT QUEUE ({compRegs.length})
          </h3>

          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {compRegs.length === 0 ? (
              <div className="w-full p-6 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-xs text-neutral-400 text-center">
                No participants registered for this programme.
              </div>
            ) : (
              compRegs.map((reg, idx) => {
                const isSelected = reg.id === activeRegId;
                const codeLetter = reg.codeLetter || getCodeLetterForIndex(idx);
                const markRecord = marks.find(
                  (m) =>
                    m.competitionId === selectedCompId &&
                    m.studentId === reg.studentId &&
                    m.judgeName === session.name
                );

                return (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectReg(reg.id)}
                    className={`min-w-[170px] sm:min-w-[200px] lg:min-w-0 shrink-0 lg:shrink p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 shadow-md font-bold'
                        : 'bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-base ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      }`}>
                        {codeLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black font-mono tracking-wide ${
                            isSelected
                              ? 'text-amber-300 dark:text-amber-600'
                              : 'text-neutral-900 dark:text-white'
                          }`}>
                            Code {codeLetter}
                          </span>
                        </div>
                        <span className="text-[11px] opacity-70 font-mono">
                          Chest {reg.chestNumber}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {markRecord ? (
                        <>
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                              <CheckCircle2 className="w-3 h-3" /> {markRecord.totalScore} pts
                            </span>
                            <span className="text-[10px] font-mono font-black uppercase text-amber-500">
                              {markRecord.grade || calculateGradeFromScore(markRecord.totalScore, 100)}
                            </span>
                          </div>
                          {/* Quick Edit & Delete actions */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectReg(reg.id);
                              }}
                              title="Edit Mark"
                              className={`p-1 rounded-md transition-colors ${
                                isSelected
                                  ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                              }`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            {session.role === 'ADMIN' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMark(markRecord.id, codeLetter);
                                }}
                                title="Delete Mark"
                                className="p-1 rounded-md bg-red-50 dark:bg-red-950/50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
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

        {/* Right: Scoring Form (8 cols) */}
        <div className="lg:col-span-8">
          {activeChestNumber ? (
            <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-6">
              {/* Code Letter & Participant Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex flex-col items-center justify-center font-mono shadow-sm">
                    <span className="text-[9px] uppercase tracking-wider opacity-70">CODE</span>
                    <span className="text-2xl font-black">{activeCodeLetter}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        EVALUATING CODE LETTER
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        Chest {activeChestNumber}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-neutral-950 dark:text-white">
                        Participant Code: {activeCodeLetter}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        (Judge: {session.name})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-2xl bg-neutral-50 dark:bg-neutral-900 sm:bg-transparent">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    AWARDED GRADE
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black font-mono text-xl">
                      {selectedGrade}
                    </span>
                  </div>
                </div>
              </div>

              {existingMark && (
                <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Mark already saved: <strong>{existingMark.totalScore} Marks (Grade {existingMark.grade})</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Modify fields below to update, or click Delete Mark to remove.
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

              {/* DIRECT TOTAL MARK TYPE INPUT & GRADE SELECTOR (Requested) */}
              <form onSubmit={handleSaveScore} className="space-y-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-black/10 dark:border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        DIRECT TOTAL MARK ENTRY (TYPE HERE)
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Type total score directly (0 - 100) or pick a grade. Both auto-synchronize in real time.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={typedTotal}
                          onChange={(e) => handleTypedTotalChange(e.target.value)}
                          placeholder="85"
                          className="w-28 px-3.5 py-2 text-2xl font-black font-mono text-center rounded-xl bg-white dark:bg-black border-2 border-indigo-500/50 focus:border-indigo-600 dark:focus:border-indigo-400 text-neutral-950 dark:text-white focus:outline-none shadow-inner"
                        />
                        <span className="absolute right-2.5 bottom-2.5 text-[10px] font-mono text-neutral-400 pointer-events-none">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Grade Selector Buttons */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      SELECT GRADE (CLICK TO PRESET SCORE)
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {(['A+', 'A', 'B+', 'B', 'C+', 'C', 'NO GRADE'] as FestGrade[]).map((grade) => {
                        const isGradeActive = selectedGrade === grade;
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => handleGradeButtonClick(grade)}
                            className={`py-2 px-2.5 rounded-xl font-mono text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isGradeActive
                                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-sm ring-2 ring-indigo-500/30 scale-105'
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10 hover:border-black/30'
                            }`}
                          >
                            <span className="text-sm font-black whitespace-nowrap">{grade}</span>
                            <span className="text-[9px] opacity-70 whitespace-nowrap">
                              {grade === 'A+' ? '10 • 90-100' : grade === 'A' ? '9 • 80-89' : grade === 'B+' ? '8 • 70-79' : grade === 'B' ? '7 • 60-69' : grade === 'C+' ? '6 • 50-59' : grade === 'C' ? '5 • 40-49' : '0 • <40'}
                            </span>
                          </button>
                        );
                      })}
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
                    placeholder="e.g. Excellent articulation; melodious pitch control in middle verses."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                  />
                </div>

                {/* Action Buttons: Delete, Reset, Update/Save */}
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-black/5 dark:border-white/5">
                  <div>
                    {existingMark && session.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMark(existingMark.id, activeCodeLetter)}
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
                          setTypedTotal(String(existingMark.totalScore));
                          setSelectedGrade(existingMark.grade || calculateGradeFromScore(existingMark.totalScore, 100));
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
                        {existingMark ? 'Update Score' : 'Save Score'} for Code [{activeCodeLetter}] ({typedTotal} Marks • Grade {selectedGrade})
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 text-neutral-400">
              Select a participant code from the queue to start judging.
            </div>
          )}

          {/* Real-time Computed Standings Preview */}
          {draftResult && draftResult.rankings.length > 0 && (
            <div className="mt-6 p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  CURRENT STANDINGS DRAFT ({draftResult.rankings.length} evaluated)
                </h4>
              </div>

              <div className="divide-y divide-black/5 dark:divide-white/5 text-xs font-mono">
                {draftResult.rankings.map((rk) => (
                  <div key={rk.studentId} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-neutral-400 w-6">#{rk.rank}</span>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-black text-neutral-900 dark:text-white">
                        Code {rk.codeLetter || '-'}
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        Chest {rk.chestNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                        Grade {rk.grade || calculateGradeFromScore(rk.totalScore, 100)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-neutral-900 dark:text-white">
                          {rk.totalScore}
                        </span>
                        <span className="text-neutral-400 text-[10px]">AVG PTS</span>
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
                                handleDeleteMark(targetMark.id, rk.codeLetter);
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
