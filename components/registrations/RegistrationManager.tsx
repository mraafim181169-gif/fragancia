'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Lock,
  Unlock,
  Users,
  Trophy,
  Shuffle,
  Edit2,
  Tag,
  Check,
  ListPlus,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Registration, Student, Competition, getCodeLetterForIndex } from '@/types/fest';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { AssignProgrammesModal } from '../students/AssignProgrammesModal';

export function RegistrationManager() {
  const store = useFestStore();
  const session = store.getSession();
  const settings = store.getSettings();
  const registrations = store.getRegistrations();
  const students = store.getStudents();
  const competitions = store.getCompetitions();
  const categories = store.getCategories();
  const teams = store.getTeams();

  // Filters
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [selectedCompId, setSelectedCompId] = useState<string>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [targetCompId, setTargetCompId] = useState(competitions[0]?.id || '');
  const [customCodeLetter, setCustomCodeLetter] = useState('A');
  const [errorMessage, setErrorMessage] = useState('');

  // Inline editing
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [editingLetterVal, setEditingLetterVal] = useState('');

  const isPortalOpen = settings.portalStatus === 'OPEN';

  // Helper to recommend next available code letter (A, B, C, D...)
  const getNextAvailableLetter = (compId: string) => {
    const existing = new Set(
      registrations
        .filter((r) => r.competitionId === compId && r.status !== 'Cancelled')
        .map((r) => r.codeLetter?.toUpperCase())
        .filter(Boolean)
    );
    let idx = 0;
    while (existing.has(getCodeLetterForIndex(idx))) {
      idx++;
    }
    return getCodeLetterForIndex(idx);
  };

  const handleOpenEnrollModal = () => {
    setErrorMessage('');
    const firstComp = competitions[0]?.id || '';
    setTargetCompId(firstComp);
    setCustomCodeLetter(getNextAvailableLetter(firstComp));
    setIsEnrollModalOpen(true);
  };

  const handleCompChangeInModal = (compId: string) => {
    setTargetCompId(compId);
    setCustomCodeLetter(getNextAvailableLetter(compId));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (session.role !== 'ADMIN') {
      setErrorMessage('Only administrators can register students.');
      return;
    }

    if (!isPortalOpen && session.role !== 'ADMIN') {
      setErrorMessage('Registration portal is currently CLOSED. Only administrators can bypass.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    const comp = competitions.find((c) => c.id === targetCompId);

    if (!student || !comp) {
      setErrorMessage('Please select both a student and a competition.');
      return;
    }

    const result = store.registerStudent(
      comp.id,
      student.id,
      session.role === 'ADMIN',
      customCodeLetter.trim().toUpperCase() || undefined
    );
    if (!result.success) {
      setErrorMessage(result.message);
    } else {
      setIsEnrollModalOpen(false);
    }
  };

  const handleSaveInlineLetter = (regId: string) => {
    if (session.role !== 'ADMIN') return;
    if (editingLetterVal.trim()) {
      store.updateRegistrationCodeLetter(regId, editingLetterVal.trim().toUpperCase());
    }
    setEditingRegId(null);
  };

  const handleAutoAssignLetters = () => {
    if (session.role !== 'ADMIN') return;
    if (selectedCompId === 'ALL') {
      alert('Please select a specific programme from the filter dropdown first to assign code letters.');
      return;
    }
    store.autoAssignCodeLetters(selectedCompId);
  };

  const handleDeleteRegistration = (reg: Registration) => {
    if (session.role !== 'ADMIN') return;
    if (
      window.confirm(
        `Cancel registration of ${reg.studentName} (${reg.chestNumber}) for ${reg.competitionName}?`
      )
    ) {
      store.deleteRegistration(reg.id);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const compMatch = selectedCompId === 'ALL' || r.competitionId === selectedCompId;
    const teamMatch = selectedTeamId === 'ALL' || r.teamId === selectedTeamId;
    const catMatch = selectedCatId === 'ALL' || r.categoryId === selectedCatId;
    const searchLower = search.trim().toLowerCase();
    const searchMatch =
      !searchLower ||
      r.studentName.toLowerCase().includes(searchLower) ||
      r.chestNumber.toLowerCase().includes(searchLower) ||
      r.competitionName.toLowerCase().includes(searchLower);
    return compMatch && teamMatch && catMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            REGISTRATION MODULE
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Enforce category quotas, prevent conflicts, and manage participant slots
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Portal Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
              isPortalOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            {isPortalOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>PORTAL {settings.portalStatus}</span>
          </div>

          {session.role === 'ADMIN' && (
            <>
              {selectedCompId !== 'ALL' && (
                <button
                  onClick={handleAutoAssignLetters}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
                  title="Automatically assign sequential Code Letters (A, B, C...) to all participants in this programme"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Auto-Assign Letters (A, B, C...)</span>
                </button>
              )}

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <ListPlus className="w-4 h-4" />
                <span>Assign by Participant</span>
              </button>

              <button
                onClick={handleOpenEnrollModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Entry</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Closed Notice Banner if portal is closed */}
      {!isPortalOpen && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-3 shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{settings.portalClosedMessage || 'Participant registrations are temporarily closed by the Fest Directorate.'}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student name, chest code, or programme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">All Programmes</option>
            {categories.map((cat) => {
              const catComps = competitions.filter((c) => c.categoryId === cat.id);
              if (catComps.length === 0) return null;
              return (
                <optgroup key={cat.id} label={cat.name}>
                  {catComps.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs cursor-pointer"
          >
            <option value="ALL">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Registrations Table / Grid */}
      <div className="overflow-hidden rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5 text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400">
              <th className="py-3.5 px-5">Code Letter</th>
              <th className="py-3.5 px-4">Chest No</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Programme</th>
              <th className="py-3.5 px-4">House</th>
              <th className="py-3.5 px-4">Enrolled At</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs sm:text-sm">
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-neutral-400">
                  No registrations found for current filters.
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((reg, idx) => {
                const currentLetter = reg.codeLetter || getCodeLetterForIndex(idx);
                const isEditing = editingRegId === reg.id;

                return (
                  <tr
                    key={reg.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      {session.role === 'ADMIN' ? (
                        isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              maxLength={4}
                              value={editingLetterVal}
                              onChange={(e) => setEditingLetterVal(e.target.value.toUpperCase())}
                              className="w-12 px-2 py-1 text-center font-mono font-black text-xs rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-400 focus:outline-none uppercase"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlineLetter(reg.id)}
                              className="p-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRegId(reg.id);
                              setEditingLetterVal(currentLetter);
                            }}
                            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-mono font-black text-xs hover:bg-amber-500/25 transition-all cursor-pointer"
                            title="Click to edit participant's Code Letter"
                          >
                            <span>Code {currentLetter}</span>
                            <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                          </button>
                        )
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-mono font-black text-xs">
                          Code {currentLetter}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                        {reg.chestNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {reg.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-800 dark:text-neutral-200">
                      {reg.competitionName}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="team">{reg.teamName}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-xs">
                      {new Date(reg.registeredAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={reg.status === 'Registered' ? 'completed' : 'default'}>
                        {reg.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {session.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteRegistration(reg)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Cancel Registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Enroll Student in Programme */}
      {isEnrollModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEnrollModalOpen(false)}
          title="Register Participant in Programme"
          subtitle="Assign student, programme, and individual Code Letter (A, B, C, D...)"
        >
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Select Student (Chest No) *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
              >
                {students.map((s) => {
                  const currentRegs = registrations.filter((r) => r.studentId === s.id).length;
                  return (
                    <option key={s.id} value={s.id}>
                      [{s.chestNumber}] {s.fullName} ({s.teamName} • {s.categoryName} • {currentRegs} registered)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Select Programme *
              </label>
              <select
                value={targetCompId}
                onChange={(e) => handleCompChangeInModal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => {
                  const catComps = competitions.filter((c) => c.categoryId === cat.id);
                  if (catComps.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={cat.name}>
                      {catComps.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type} • {c.stage})
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Code Letter Assignment Section (Requested) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Assign Code Letter (A, B, C, D, E...) *</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  Judges evaluate via this Code
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={customCodeLetter}
                  onChange={(e) => setCustomCodeLetter(e.target.value.toUpperCase())}
                  placeholder="e.g. A"
                  className="w-20 px-3 py-2 font-mono font-black text-xl text-center rounded-xl bg-white dark:bg-neutral-900 border border-amber-500/40 text-neutral-900 dark:text-white uppercase focus:outline-none shadow-xs"
                />
                
                <div className="flex items-center gap-1.5 flex-wrap flex-1">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setCustomCodeLetter(letter)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        customCodeLetter === letter
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950'
                          : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10 hover:border-black/30'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer shadow-sm"
              >
                Confirm Registration (Code {customCodeLetter})
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Assign Programmes to Participant */}
      {isAssignModalOpen && (
        <AssignProgrammesModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
    </div>
  );
}
