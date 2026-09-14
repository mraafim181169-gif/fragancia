'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Users,
  Award,
  Trophy,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { exportToCsv } from '@/lib/utils';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function ReportsCenter() {
  const store = useFestStore();
  const settings = store.getSettings();
  const students = store.getStudents();
  const teams = store.getTeams();
  const competitions = store.getCompetitions();
  const registrations = store.getRegistrations();
  const results = store.getResults();

  // Print Preview Modals
  const [printMode, setPrintMode] = useState<'NONE' | 'CHEST_CARDS' | 'JUDGE_SHEET' | 'RESULTS_BULLETIN'>('NONE');
  const [selectedCompForSheet, setSelectedCompForSheet] = useState<string>(competitions[0]?.id || '');

  const activeCompForSheet = competitions.find((c) => c.id === selectedCompForSheet);
  const activeCompRegs = registrations.filter((r) => r.competitionId === selectedCompForSheet);

  // CSV Exporters
  const exportStudents = () => {
    const rows = students.map((s) => ({
      ChestNo: s.chestNumber,
      Name: s.fullName,
      Admission: s.admissionNo,
      House: s.teamName,
      Category: s.categoryName,
      OnStagePoints: s.onStagePoints ?? 0,
      OffStagePoints: s.offStagePoints ?? 0,
      TotalPoints: s.totalPoints,
      Phone: s.phone,
    }));
    exportToCsv('Fragancia_Students_Register', rows);
  };

  const exportResults = () => {
    const rows = results.flatMap((r) =>
      r.rankings.map((rk) => ({
        Competition: r.competitionName,
        Rank: rk.rank,
        ChestNo: rk.chestNumber,
        Student: rk.studentName,
        House: rk.teamName,
        AwardedPoints: rk.pointsAwarded,
        Score: rk.totalScore,
        PublishedAt: r.publishedAt,
      }))
    );
    exportToCsv('Fragancia_Official_Results_Bulletin', rows);
  };

  const exportRegistrations = () => {
    const rows = registrations.map((r) => ({
      ChestNo: r.chestNumber,
      Student: r.studentName,
      Competition: r.competitionName,
      House: r.teamName,
      Status: r.status,
    }));
    exportToCsv('Fragancia_Stage_Registrations', rows);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            OFFICIAL REPORTS & PRINTS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Print-ready participant chest cards, blind judging sheets, and downloadable CSV audits
          </p>
        </div>
      </div>

      {/* Grid of Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Printable Chest Cards Sheet */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Printable Chest Badges (A4 Sheet)
            </h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Generates a printable grid of all {students.length} participant chest cards with high-contrast borders and badge identifiers.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <button
              onClick={() => setPrintMode('CHEST_CARDS')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Preview & Print</span>
            </button>
            <button
              onClick={exportStudents}
              className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Blank Stage Judging Sheet */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Official Judge Evaluation Sheet
            </h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Standard paper scoring rubrics with anonymous chest columns for stage backup and manual evaluator sign-offs.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <button
              onClick={() => setPrintMode('JUDGE_SHEET')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Sheet</span>
            </button>
            <button
              onClick={exportRegistrations}
              className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Official Results Bulletin */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Official Results Bulletin
            </h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Published winner rosters for all completed competitions with gold, silver, and bronze points for board announcements.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <button
              onClick={() => setPrintMode('RESULTS_BULLETIN')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bulletin</span>
            </button>
            <button
              onClick={exportResults}
              className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Printable Modal: Chest Cards Batch */}
      {printMode === 'CHEST_CARDS' && (
        <Modal
          isOpen={true}
          onClose={() => setPrintMode('NONE')}
          title="Printable Chest Cards (Batch View)"
          subtitle="Click Print to format for A4 sheets or label cutters."
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 no-print">
              <span className="text-xs text-neutral-500 font-mono">
                {students.length} Chest Cards Ready
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print All (Ctrl+P)</span>
              </button>
            </div>

            {/* Printable Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-5 rounded-2xl bg-white text-black border-2 border-black flex flex-col justify-between text-center print-card"
                >
                  <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                    {settings.eventName.toUpperCase()}
                  </p>
                  <div className="w-6 h-0.5 bg-black mx-auto my-1.5" />
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tighter">
                      {student.chestNumber}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs uppercase truncate">{student.fullName}</h4>
                  <div className="mt-2 pt-2 border-t border-neutral-300 flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold">{student.teamName}</span>
                    <span>{student.categoryName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Modal: Judge Sheet */}
      {printMode === 'JUDGE_SHEET' && (
        <Modal
          isOpen={true}
          onClose={() => setPrintMode('NONE')}
          title="Stage Judge Evaluation Sheet"
          subtitle="Official paper scorecard for stage evaluators"
          maxWidth="4xl"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 no-print">
              <select
                value={selectedCompForSheet}
                onChange={(e) => setSelectedCompForSheet(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold"
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.categoryName} • {c.stage})
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sheet</span>
              </button>
            </div>

            {/* Scorecard Paper Layout */}
            <div className="p-6 bg-white text-black border border-neutral-300 rounded-2xl print-card">
              <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {settings.eventName}
                </h2>
                <h3 className="text-base font-bold mt-1">
                  OFFICIAL STAGE EVALUATION SHEET — {activeCompForSheet?.name.toUpperCase()}
                </h3>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  Category: {activeCompForSheet?.categoryName} | Venue: {activeCompForSheet?.stage}
                </p>
              </div>

              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-black font-mono uppercase">
                    <th className="p-2 border-r border-black w-12 text-center">#</th>
                    <th className="p-2 border-r border-black w-24">Chest No</th>
                    <th className="p-2 border-r border-black w-28 text-center">Criteria 1 (30)</th>
                    <th className="p-2 border-r border-black w-28 text-center">Criteria 2 (30)</th>
                    <th className="p-2 border-r border-black w-28 text-center">Criteria 3 (20)</th>
                    <th className="p-2 border-r border-black w-28 text-center">Criteria 4 (20)</th>
                    <th className="p-2 border-r border-black w-24 text-center">Total (100)</th>
                    <th className="p-2">Judge Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCompRegs.map((reg, idx) => (
                    <tr key={reg.id} className="border-b border-black h-10">
                      <td className="p-2 border-r border-black text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-black font-mono font-bold">
                        {reg.chestNumber}
                      </td>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 pt-6 border-t border-black flex items-center justify-between text-xs font-mono">
                <div>
                  <p>Judge Name: __________________________</p>
                </div>
                <div>
                  <p>Signature: __________________________</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Modal: Results Bulletin */}
      {printMode === 'RESULTS_BULLETIN' && (
        <Modal
          isOpen={true}
          onClose={() => setPrintMode('NONE')}
          title="Official Results Bulletin"
          subtitle="Signed publication of winners and points"
          maxWidth="4xl"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-end pb-2 border-b border-black/10 dark:border-white/10 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bulletin (Ctrl+P)</span>
              </button>
            </div>

            <div className="p-8 bg-white text-black border border-neutral-300 rounded-2xl print-card space-y-6">
              <div className="text-center border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {settings.eventName}
                </h2>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-600 mt-1">
                  OFFICIAL RESULTS & MERIT BULLETIN
                </h3>
              </div>

              {results.length === 0 ? (
                <p className="text-center text-xs text-neutral-500 py-8">
                  No competition results published yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {results.map((res) => (
                    <div key={res.id} className="border-b border-neutral-300 pb-4">
                      <h4 className="font-black text-sm uppercase tracking-tight mb-2">
                        {res.competitionName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        {res.rankings.map((rk) => (
                          <div
                            key={rk.studentId}
                            className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                          >
                            <span className="font-bold">
                              {rk.rank === 1 ? '🥇 1st' : rk.rank === 2 ? '🥈 2nd' : '🥉 3rd'}
                            </span>
                            <span className="font-semibold">
                              {rk.chestNumber} - {rk.studentName}
                            </span>
                            <span className="font-bold text-neutral-500">{rk.teamName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 pt-6 border-t border-black flex items-center justify-between text-xs font-mono">
                <div>
                  <p>{settings.signatory1Title || 'Chief Controller / Convener'}</p>
                  <p className="mt-8 font-bold">{settings.instituteName || 'Fest Directorate'}</p>
                </div>
                <div className="text-right">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="mt-8 font-bold">{settings.signatory2Title || 'Official Seal'}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
