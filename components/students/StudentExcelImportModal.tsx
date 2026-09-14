'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  parseExcelStudentFile,
  downloadSampleExcelTemplate,
  downloadSampleCsvTemplate,
  ParsedStudentRow,
  ExcelParseResult,
} from '@/lib/excelParser';

interface StudentExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function StudentExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentExcelImportModalProps) {
  const store = useFestStore();
  const teams = store.getTeams();
  const categories = store.getCategories();
  const existingStudents = store.getStudents();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<{
    enrolledCount: number;
    teamBreakdown: Record<string, number>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await parseExcelStudentFile(
        file,
        teams,
        categories,
        existingStudents
      );
      setParseResult(result);

      if (result.validRows.length === 0) {
        setErrorMessage(
          result.totalRows === 0
            ? 'The uploaded sheet appears to be empty.'
            : 'No valid student rows could be identified. Please ensure student names are present and check column headers.'
        );
        setIsProcessing(false);
        return;
      }

      // If Auto-Save is checked, immediately commit to store!
      if (autoSave && result.validRows.length > 0) {
        commitEnrollment(result.validRows);
      }
    } catch (err: any) {
      console.error('Failed to parse Excel file:', err);
      setErrorMessage(
        err.message || 'An error occurred while reading the Excel file. Please ensure it is a valid .xlsx, .xls, or .csv document.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const commitEnrollment = (rowsToEnroll: ParsedStudentRow[]) => {
    const teamCounts: Record<string, number> = {};

    const payload = rowsToEnroll.map((r) => {
      teamCounts[r.teamName] = (teamCounts[r.teamName] || 0) + 1;
      return {
        fullName: r.fullName,
        admissionNo: r.admissionNo,
        teamId: r.teamId,
        teamName: r.teamName,
        teamCode: r.teamCode,
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        phone: r.phone,
        gender: r.gender,
        status: 'Active' as const,
      };
    });

    const result = store.bulkCreateStudents(payload);

    setSavedSummary({
      enrolledCount: result.enrolledCount,
      teamBreakdown: teamCounts,
    });

    if (onSuccess) {
      onSuccess(result.enrolledCount);
    }
  };

  const handleManualSave = () => {
    if (parseResult && parseResult.validRows.length > 0) {
      commitEnrollment(parseResult.validRows);
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setSavedSummary(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll Students via Excel File"
      subtitle="Upload .xlsx or .csv to parse, validate, and automatically save participants"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Success State (Auto-Saved) */}
        {savedSummary ? (
          <div className="text-center py-6 px-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                {savedSummary.enrolledCount} Students Enrolled!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                Participant records have been automatically validated, assigned unique chest codes, and saved to the official directory.
              </p>
            </div>

            {/* Breakdown by House */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 max-w-md mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                House Allotment Breakdown
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Object.entries(savedSummary.teamBreakdown).map(([tName, count]) => (
                  <div
                    key={tName}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151515] border border-black/5 dark:border-white/5 text-xs font-semibold"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-neutral-900 dark:text-white">{tName}:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Duplicate Notice if any were skipped */}
            {parseResult && parseResult.duplicateCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200 text-left max-w-md mx-auto flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  {parseResult.duplicateCount} duplicate records with existing admission numbers were safely skipped.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Upload Another File
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                View Student Directory
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Auto-Save Toggle & Template Download Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-900 dark:text-white select-none">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="w-4 h-4 rounded text-black dark:text-white focus:ring-black cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Automatically Save & Enroll upon upload
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleExcelTemplate(teams, categories)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Download standard Excel .xlsx format"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sample Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleCsvTemplate(teams, categories)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Download CSV format"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* File Drop Area */}
            {!parseResult && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-[#111111]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  className="hidden"
                  id="excel-file-input"
                />

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-8 h-8" />
                  )}
                </div>

                <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {isProcessing
                    ? 'Reading and validating Excel sheet...'
                    : 'Drop your Excel (.xlsx, .xls) or CSV file here'}
                </h4>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                  Click to browse from your device. Supported headers: Student Name, Admission No, House / Team, Category, Phone, Gender.
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Excel File</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-[11px] text-red-500 mt-0.5">
                    Tip: You can download our sample Excel template above to ensure column formatting matches.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Table if autoSave is false and rows parsed */}
            {parseResult && !autoSave && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Found {parseResult.validRows.length} Valid Student Records
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      File: {parseResult.fileName} • Sheet: {parseResult.sheetName}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    Change File
                  </button>
                </div>

                {/* Table Container */}
                <div className="max-h-64 overflow-y-auto overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Admission</th>
                        <th className="py-2.5 px-3">House</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {parseResult.validRows.map((r, i) => (
                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                          <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white">
                            {r.fullName}
                          </td>
                          <td className="py-2 px-3 font-mono text-neutral-500">
                            {r.admissionNo}
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="team">{r.teamName}</Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="category">{r.categoryName}</Badge>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[11px] text-emerald-600 font-medium">
                              Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Manual Commit CTA */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Enroll & Save {parseResult.validRows.length} Students</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
