'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit2,
  Eye,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  ListPlus,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Student, Team, Category } from '@/types/fest';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { exportToCsv } from '@/lib/utils';
import { StudentExcelImportModal } from './StudentExcelImportModal';
import { AssignProgrammesModal } from './AssignProgrammesModal';

interface StudentManagerProps {
  initialOpenAdd?: boolean;
  onCloseAdd?: () => void;
  selectedStudentFromSearch?: Student | null;
}

export function StudentManager({
  initialOpenAdd = false,
  onCloseAdd,
  selectedStudentFromSearch,
}: StudentManagerProps) {
  const store = useFestStore();
  const session = store.getSession();
  const students = store.getStudents();
  const teams = store.getTeams();
  const categories = store.getCategories();
  const registrations = store.getRegistrations();
  const results = store.getResults();
  const settings = store.getSettings();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(
    selectedStudentFromSearch || null
  );
  const [printStudent, setPrintStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const openAssignModal = (student: Student) => {
    setAssignStudent(student);
    setIsAssignModalOpen(true);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNo: '',
    chestNumber: '',
    phone: '',
    teamId: teams[0]?.id || '',
    categoryId: categories[0]?.id || '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    status: 'Active' as 'Active' | 'Inactive',
    autoGenerateChest: true,
  });
  const [formError, setFormError] = useState('');

  // Handle Team change to auto-update chest code preview
  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    setFormData((prev) => {
      const nextChest = prev.autoGenerateChest && team
        ? store.generateChestNumber(team.shortCode)
        : prev.chestNumber;
      return { ...prev, teamId, chestNumber: nextChest };
    });
  };

  const openAddModal = () => {
    const defaultTeam = teams[0];
    const defaultCategory = categories[0];
    setFormData({
      fullName: '',
      admissionNo: `ADM-${Date.now().toString().slice(-4)}`,
      chestNumber: defaultTeam ? store.generateChestNumber(defaultTeam.shortCode) : 'GEN-001',
      phone: '',
      teamId: defaultTeam?.id || '',
      categoryId: defaultCategory?.id || '',
      gender: 'Male',
      status: 'Active',
      autoGenerateChest: true,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      admissionNo: student.admissionNo,
      chestNumber: student.chestNumber,
      phone: student.phone,
      teamId: student.teamId,
      categoryId: student.categoryId,
      gender: student.gender,
      status: student.status,
      autoGenerateChest: false,
    });
    setFormError('');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim()) {
      setFormError('Student full name is required');
      return;
    }
    if (!formData.admissionNo.trim()) {
      setFormError('Admission number is required');
      return;
    }

    const team = teams.find((t) => t.id === formData.teamId);
    let chestNumber = formData.chestNumber.trim().toUpperCase();

    if (formData.autoGenerateChest && !editingStudent) {
      chestNumber = store.generateChestNumber(team?.shortCode || 'GEN');
    }

    if (!chestNumber) {
      setFormError('Chest number is required');
      return;
    }

    // Check duplicate admission number
    if (store.isAdmissionNoDuplicate(formData.admissionNo, editingStudent?.id)) {
      setFormError(`Admission number ${formData.admissionNo} already exists`);
      return;
    }

    // Check duplicate chest number
    if (store.isChestNumberDuplicate(chestNumber, editingStudent?.id)) {
      setFormError(`Chest number ${chestNumber} is already assigned to another student`);
      return;
    }

    if (editingStudent) {
      store.updateStudent(editingStudent.id, {
        fullName: formData.fullName.trim(),
        admissionNo: formData.admissionNo.trim(),
        chestNumber,
        phone: formData.phone.trim(),
        teamId: formData.teamId,
        categoryId: formData.categoryId,
        gender: formData.gender,
        status: formData.status,
      });
      setEditingStudent(null);
    } else {
      store.createStudent({
        fullName: formData.fullName.trim(),
        admissionNo: formData.admissionNo.trim(),
        chestNumber,
        phone: formData.phone.trim(),
        teamId: formData.teamId,
        teamName: team?.name || '',
        teamCode: team?.shortCode || '',
        categoryId: formData.categoryId,
        categoryName: categories.find((c) => c.id === formData.categoryId)?.name || '',
        gender: formData.gender,
        status: formData.status,
      });
      setIsAddModalOpen(false);
      if (onCloseAdd) onCloseAdd();
    }
  };

  const handleDeleteStudent = (student: Student) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${student.fullName} (${student.chestNumber})? All their registrations and marks will be removed.`
      )
    ) {
      store.deleteStudent(student.id);
      if (profileStudent?.id === student.id) {
        setProfileStudent(null);
      }
    }
  };

  // Filtered student list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.chestNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = selectedTeam === 'ALL' || s.teamId === selectedTeam;
    const matchesCategory = selectedCategory === 'ALL' || s.categoryId === selectedCategory;
    return matchesSearch && matchesTeam && matchesCategory;
  });

  const handleExportCsv = () => {
    const rows = filteredStudents.map((s) => ({
      'Chest Number': s.chestNumber,
      'Full Name': s.fullName,
      'Admission No': s.admissionNo,
      'Team': s.teamName,
      'Category': s.categoryName,
      'Gender': s.gender,
      'Phone': s.phone,
      'Total Points': s.totalPoints,
      'Status': s.status,
    }));
    exportToCsv('Fragancia_Students_List', rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            STUDENTS & CHEST NUMBERS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Total {students.length} students enrolled across {teams.length} houses
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          {session.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                id="excel-import-trigger"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Excel</span>
              </button>

              <button
                onClick={() => openAssignModal(filteredStudents[0] || students[0])}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                id="assign-programmes-button"
              >
                <ListPlus className="w-4 h-4" />
                <span>Assign Programmes</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                id="add-student-button"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by name, chest number (e.g. AF-001), or admission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.shortCode})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            No students found
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filter, or enroll participants individually or via Excel spreadsheet upload.
          </p>
          {session.role === 'ADMIN' && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Upload Excel (.xlsx)</span>
              </button>
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                Enroll First Student
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-5">Chest No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Admission</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Points</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs sm:text-sm">
                {filteredStudents.map((student) => {
                  const assignedCount = registrations.filter(
                    (r) => r.studentId === student.id && r.status !== 'Cancelled'
                  ).length;
                  const studentCat = categories.find((c) => c.id === student.categoryId);
                  const maxAllowed = studentCat?.maxCompetitionsPerStudent || settings.maxRegistrationsPerStudent || 5;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-mono font-bold text-xs tracking-wider">
                          {student.chestNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setProfileStudent(student)}
                            className="hover:underline cursor-pointer text-left"
                          >
                            {student.fullName}
                          </button>
                          {student.role === 'Leader' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold tracking-tight">
                              LEADER
                            </span>
                          )}
                          {student.role === 'Sub-Leader' && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold tracking-tight">
                              SUB-LEADER
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500 text-xs">
                        {student.admissionNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="team">{student.teamName}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="category">{student.categoryName}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {student.totalPoints} PTS
                        </span>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] mt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            On: {student.onStagePoints ?? 0}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Off: {student.offStagePoints ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {session.role === 'ADMIN' ? (
                            <button
                              onClick={() => openAssignModal(student)}
                              title={`Assign Programmes (${assignedCount}/${maxAllowed})`}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer text-xs font-mono font-bold"
                            >
                              <ListPlus className="w-4 h-4" />
                              <span>{assignedCount}/{maxAllowed}</span>
                            </button>
                          ) : (
                            <span
                              title={`Assigned Programmes: ${assignedCount}/${maxAllowed}`}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs font-mono font-medium"
                            >
                              <ListPlus className="w-4 h-4" />
                              <span>{assignedCount}/{maxAllowed}</span>
                            </span>
                          )}
                          <button
                            onClick={() => setProfileStudent(student)}
                            title="View Student Dossier"
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPrintStudent(student)}
                            title="Print Chest Card"
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {session.role === 'ADMIN' && (
                            <>
                              <button
                                onClick={() => openEditModal(student)}
                                title="Edit Student"
                                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                title="Delete Student"
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid (Transforming tables into cards as required) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredStudents.map((student) => {
              const assignedCount = registrations.filter(
                (r) => r.studentId === student.id && r.status !== 'Cancelled'
              ).length;
              const studentCat = categories.find((c) => c.id === student.categoryId);
              const maxAllowed = studentCat?.maxCompetitionsPerStudent || settings.maxRegistrationsPerStudent || 5;

              return (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs tracking-wider">
                      {student.chestNumber}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                        {student.fullName}
                      </h4>
                      {student.role === 'Leader' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold tracking-tight">
                          LEADER
                        </span>
                      )}
                      {student.role === 'Sub-Leader' && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold tracking-tight">
                          SUB-LEADER
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400">
                      {student.admissionNo} • {student.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-lg font-black text-neutral-900 dark:text-white">
                      {student.totalPoints}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">PTS</span>
                    <div className="flex items-center justify-end gap-1 text-[10px] mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">On: {student.onStagePoints ?? 0}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Off: {student.offStagePoints ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="team">{student.teamName}</Badge>
                  <Badge variant="category">{student.categoryName}</Badge>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setProfileStudent(student)}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profile
                    </button>
                    {session.role === 'ADMIN' && (
                      <button
                        onClick={() => openAssignModal(student)}
                        className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ListPlus className="w-3.5 h-3.5" /> Assign ({assignedCount}/{maxAllowed})
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPrintStudent(student)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 transition-colors"
                      title="Print Chest Card"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {session.role === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => openEditModal(student)}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 cursor-pointer hover:bg-red-100 transition-colors"
                          title="Delete Student"
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
        </>
      )}

      {/* Modal: Enroll / Edit Student */}
      {(isAddModalOpen || editingStudent) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
            if (onCloseAdd) onCloseAdd();
          }}
          title={editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
          subtitle="Unique chest numbers are automatically generated per house code."
        >
          <form onSubmit={handleSaveStudent} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ayaan Rahman"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Admission No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ADM-2024-001"
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98471 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  House / Team *
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chest Number Generation Section */}
            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    Chest Number
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Unique participant badge identifier
                  </p>
                </div>
                {!editingStudent && (
                  <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoGenerateChest}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const team = teams.find((t) => t.id === formData.teamId);
                        setFormData({
                          ...formData,
                          autoGenerateChest: checked,
                          chestNumber: checked && team ? store.generateChestNumber(team.shortCode) : formData.chestNumber,
                        });
                      }}
                      className="rounded"
                    />
                    <span>Auto Generate</span>
                  </label>
                )}
              </div>

              <input
                type="text"
                required
                disabled={formData.autoGenerateChest && !editingStudent}
                value={formData.chestNumber}
                onChange={(e) => setFormData({ ...formData, chestNumber: e.target.value.toUpperCase() })}
                placeholder="AF-001"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-base font-mono font-bold tracking-widest uppercase focus:outline-none disabled:opacity-80"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                  if (onCloseAdd) onCloseAdd();
                }}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {editingStudent ? 'Save Changes' : 'Confirm Enrollment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Student Profile Dossier */}
      {profileStudent && (
        <Modal
          isOpen={true}
          onClose={() => setProfileStudent(null)}
          title={profileStudent.fullName}
          subtitle={`Chest No: ${profileStudent.chestNumber} • ${profileStudent.teamName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header badges */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  OFFICIAL BADGE CODE
                </span>
                <p className="text-2xl font-black font-mono tracking-wider text-neutral-900 dark:text-white mt-0.5">
                  {profileStudent.chestNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  CHAMPIONSHIP POINTS
                </span>
                <p className="text-2xl font-black font-mono text-amber-500 mt-0.5">
                  {profileStudent.totalPoints} PTS
                </p>
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                    On-Stage: {profileStudent.onStagePoints ?? 0}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    Off-Stage: {profileStudent.offStagePoints ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-neutral-400 text-[10px] uppercase">Admission</span>
                <p className="font-semibold font-mono mt-0.5">{profileStudent.admissionNo}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-neutral-400 text-[10px] uppercase">House / Team</span>
                <p className="font-semibold mt-0.5">{profileStudent.teamName}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-neutral-400 text-[10px] uppercase">Category</span>
                <p className="font-semibold mt-0.5">{profileStudent.categoryName}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                <span className="text-neutral-400 text-[10px] uppercase">Phone</span>
                <p className="font-semibold mt-0.5">{profileStudent.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Registered Competitions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Registered Competitions
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const target = profileStudent;
                    setProfileStudent(null);
                    openAssignModal(target);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Assign / Manage</span>
                </button>
              </div>
              {registrations.filter((r) => r.studentId === profileStudent.id).length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-500 text-center">
                  Not registered for any competitions yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {registrations
                    .filter((r) => r.studentId === profileStudent.id)
                    .map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {reg.competitionName}
                        </span>
                        <Badge variant={reg.status === 'Registered' ? 'completed' : 'upcoming'}>
                          {reg.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => {
                  setPrintStudent(profileStudent);
                  setProfileStudent(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Chest Card</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Printable Chest Card Badge */}
      {printStudent && (
        <Modal
          isOpen={true}
          onClose={() => setPrintStudent(null)}
          title="Printable Chest Card"
          subtitle="Formatted for standard badges and printable via browser."
          maxWidth="md"
        >
          <div className="space-y-5 text-center">
            {/* The Badge Card Preview */}
            <div
              className="p-8 rounded-3xl bg-white text-black border-2 border-black mx-auto max-w-xs shadow-xl print-card"
              id="student-chest-card-print"
            >
              <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-500">
                {store.getSettings().eventName.toUpperCase()}
              </p>
              <div className="w-8 h-0.5 bg-black mx-auto my-2" />

              <div className="my-6">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter">
                  {printStudent.chestNumber}
                </span>
              </div>

              <h3 className="text-lg font-bold uppercase tracking-tight">
                {printStudent.fullName}
              </h3>

              <div className="mt-4 pt-3 border-t border-neutral-300 flex items-center justify-between text-[11px] font-mono uppercase">
                <span className="font-bold">{printStudent.teamName}</span>
                <span>{printStudent.categoryName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Now (Ctrl+P)</span>
              </button>
              <button
                onClick={() => setPrintStudent(null)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Excel / CSV Import */}
      <StudentExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Modal: Assign Programmes to Participant */}
      {isAssignModalOpen && (
        <AssignProgrammesModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssignStudent(null);
          }}
          initialStudent={assignStudent}
        />
      )}
    </div>
  );
}
