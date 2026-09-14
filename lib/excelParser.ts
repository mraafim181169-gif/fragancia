import * as XLSX from 'xlsx';
import { Team, Category, Student } from '@/types/fest';

export interface ParsedStudentRow {
  fullName: string;
  admissionNo: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  categoryId: string;
  categoryName: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  isValid: boolean;
  status: 'READY' | 'DUPLICATE_ADMISSION' | 'WARNING' | 'ERROR';
  statusMessage?: string;
  originalRow: Record<string, any>;
}

export interface ExcelParseResult {
  fileName: string;
  sheetName: string;
  totalRows: number;
  validRows: ParsedStudentRow[];
  invalidRows: ParsedStudentRow[];
  duplicateCount: number;
}

// Clean and normalize strings for matching
function normalize(str: string | number | undefined | null): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Find closest matching team
function matchTeam(rawTeam: string, teams: Team[]): Team {
  if (!teams || teams.length === 0) {
    return {
      id: 'team-1',
      name: 'General House',
      shortCode: 'GEN',
      color: '#4F46E5',
      description: 'General House',
      captain: 'General Captain',
      active: true,
      points: 0,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      studentCount: 0,
      rank: 1,
    };
  }

  const norm = normalize(rawTeam);
  if (!norm) return teams[0];

  // 1. Exact or shortcode match
  const exact = teams.find(
    (t) =>
      normalize(t.name) === norm ||
      normalize(t.shortCode) === norm ||
      normalize(t.id) === norm
  );
  if (exact) return exact;

  // 2. Partial substring match
  const partial = teams.find(
    (t) =>
      normalize(t.name).includes(norm) ||
      norm.includes(normalize(t.name)) ||
      normalize(t.shortCode).includes(norm)
  );
  if (partial) return partial;

  // Fallback to first team
  return teams[0];
}

// Find closest matching category
function matchCategory(rawCat: string, categories: Category[]): Category {
  if (!categories || categories.length === 0) {
    return {
      id: 'cat-junior',
      name: 'Junior',
      description: 'Standard category',
      minAge: 10,
      maxAge: 13,
      studentCount: 0,
      active: true,
    };
  }

  const norm = normalize(rawCat);
  if (!norm) return categories[0];

  // 1. Exact match
  const exact = categories.find(
    (c) => normalize(c.name) === norm || normalize(c.id) === norm
  );
  if (exact) return exact;

  // 2. Substring match
  const partial = categories.find(
    (c) =>
      normalize(c.name).includes(norm) || norm.includes(normalize(c.name))
  );
  if (partial) return partial;

  return categories[0];
}

// Normalize gender
function parseGender(rawGender: string | undefined): 'Male' | 'Female' | 'Other' {
  const g = String(rawGender || '').trim().toLowerCase();
  if (g.startsWith('f') || g === 'female' || g === 'girl') return 'Female';
  if (g.startsWith('o') || g === 'other') return 'Other';
  return 'Male';
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file into structured Student records
 */
export async function parseExcelStudentFile(
  file: File,
  teams: Team[],
  categories: Category[],
  existingStudents: Student[]
): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('No readable worksheet found in the uploaded file.');
  }

  // Convert to JSON objects with raw header keys
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  if (!rawRows || rawRows.length === 0) {
    return {
      fileName: file.name,
      sheetName,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateCount: 0,
    };
  }

  const existingAdmissionSet = new Set(
    existingStudents.map((s) => s.admissionNo.trim().toUpperCase())
  );
  const seenInBatchAdmissionSet = new Set<string>();

  const validRows: ParsedStudentRow[] = [];
  const invalidRows: ParsedStudentRow[] = [];
  let duplicateCount = 0;

  const currentYear = new Date().getFullYear();

  rawRows.forEach((row, index) => {
    // Flexible column resolution
    let rawName = '';
    let rawAdmission = '';
    let rawTeam = '';
    let rawCategory = '';
    let rawPhone = '';
    let rawGender = '';

    for (const [key, val] of Object.entries(row)) {
      const k = key.trim().toLowerCase();
      const stringVal = String(val).trim();

      if (/name|student|candidate|full\s*name/i.test(k) && !rawName) {
        rawName = stringVal;
      } else if (/adm|admission|roll|reg|id/i.test(k) && !rawAdmission) {
        rawAdmission = stringVal;
      } else if (/team|house|group/i.test(k) && !rawTeam) {
        rawTeam = stringVal;
      } else if (/cat|category|class|grade|div/i.test(k) && !rawCategory) {
        rawCategory = stringVal;
      } else if (/phone|mobile|contact|tel|whatsapp/i.test(k) && !rawPhone) {
        rawPhone = stringVal;
      } else if (/gender|sex/i.test(k) && !rawGender) {
        rawGender = stringVal;
      }
    }

    // Fallback if header was simple unnamed columns
    if (!rawName && row['0']) rawName = String(row['0']).trim();
    if (!rawAdmission && row['1']) rawAdmission = String(row['1']).trim();

    // Generate admission number if missing
    const admissionNo = rawAdmission
      ? rawAdmission.toUpperCase()
      : `ADM-${currentYear}-${String(index + 101).padStart(4, '0')}`;

    const matchedTeam = matchTeam(rawTeam, teams);
    const matchedCategory = matchCategory(rawCategory, categories);
    const gender = parseGender(rawGender);

    // Validate Name
    if (!rawName || rawName.length < 2) {
      invalidRows.push({
        fullName: rawName || 'Unknown Student',
        admissionNo,
        teamId: matchedTeam.id,
        teamName: matchedTeam.name,
        teamCode: matchedTeam.shortCode,
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        phone: rawPhone,
        gender,
        isValid: false,
        status: 'ERROR',
        statusMessage: 'Student name is required (minimum 2 characters).',
        originalRow: row,
      });
      return;
    }

    // Check duplicate admission
    if (
      existingAdmissionSet.has(admissionNo) ||
      seenInBatchAdmissionSet.has(admissionNo)
    ) {
      duplicateCount++;
      invalidRows.push({
        fullName: rawName,
        admissionNo,
        teamId: matchedTeam.id,
        teamName: matchedTeam.name,
        teamCode: matchedTeam.shortCode,
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        phone: rawPhone,
        gender,
        isValid: false,
        status: 'DUPLICATE_ADMISSION',
        statusMessage: `Admission No "${admissionNo}" already exists in the system or this batch.`,
        originalRow: row,
      });
      return;
    }

    seenInBatchAdmissionSet.add(admissionNo);

    validRows.push({
      fullName: rawName,
      admissionNo,
      teamId: matchedTeam.id,
      teamName: matchedTeam.name,
      teamCode: matchedTeam.shortCode,
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      phone: rawPhone,
      gender,
      isValid: true,
      status: 'READY',
      originalRow: row,
    });
  });

  return {
    fileName: file.name,
    sheetName,
    totalRows: rawRows.length,
    validRows,
    invalidRows,
    duplicateCount,
  };
}

/**
 * Downloads a pre-formatted Excel template (.xlsx) for bulk enrollment
 */
export function downloadSampleExcelTemplate(teams: Team[], categories: Category[]) {
  const sampleTeam1 = teams[0]?.name || 'AL-FALAH';
  const sampleTeam2 = teams[1]?.name || 'AL-HUDA';
  const sampleTeam3 = teams[2]?.name || 'NOOR';
  const sampleTeam4 = teams[3]?.name || 'SUFFAH';

  const catJunior = categories.find((c) => c.name.toLowerCase().includes('junior'))?.name || 'Junior';
  const catSenior = categories.find((c) => c.name.toLowerCase().includes('senior'))?.name || 'Senior';
  const catSub = categories.find((c) => c.name.toLowerCase().includes('sub'))?.name || 'Sub-Junior';
  const catHigh = categories.find((c) => c.name.toLowerCase().includes('high'))?.name || 'Higher Secondary';

  const templateRows = [
    {
      'Student Full Name': 'Zayd Omar',
      'Admission No': 'ADM-2026-051',
      'House / Team': sampleTeam1,
      'Category': catJunior,
      'Phone / WhatsApp': '+91 98471 99901',
      'Gender': 'Male',
    },
    {
      'Student Full Name': 'Kabeer Hassan',
      'Admission No': 'ADM-2026-052',
      'House / Team': sampleTeam2,
      'Category': catSenior,
      'Phone / WhatsApp': '+91 98471 99902',
      'Gender': 'Male',
    },
    {
      'Student Full Name': 'Fathima Zahra',
      'Admission No': 'ADM-2026-053',
      'House / Team': sampleTeam3,
      'Category': catSub,
      'Phone / WhatsApp': '+91 98471 99903',
      'Gender': 'Female',
    },
    {
      'Student Full Name': 'Taha Yaseen',
      'Admission No': 'ADM-2026-054',
      'House / Team': sampleTeam4,
      'Category': catHigh,
      'Phone / WhatsApp': '+91 98471 99904',
      'Gender': 'Male',
    },
    {
      'Student Full Name': 'Aysha Mariyam',
      'Admission No': 'ADM-2026-055',
      'House / Team': sampleTeam1,
      'Category': catJunior,
      'Phone / WhatsApp': '+91 98471 99905',
      'Gender': 'Female',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 24 }, // Student Full Name
    { wch: 18 }, // Admission No
    { wch: 18 }, // House / Team
    { wch: 18 }, // Category
    { wch: 20 }, // Phone
    { wch: 12 }, // Gender
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'Fragancia_Students_Enrollment_Template.xlsx');
}

/**
 * Downloads a sample CSV template
 */
export function downloadSampleCsvTemplate(teams: Team[], categories: Category[]) {
  const sampleTeam1 = teams[0]?.name || 'TEAM SELJUK';
  const sampleTeam2 = teams[1]?.name || 'TEAM MAMLUK';

  const csvContent =
    'Student Full Name,Admission No,House / Team,Category,Phone / WhatsApp,Gender\n' +
    `MUHAMMED RAZI K,FRG-26-310,${sampleTeam1},Senior,,Male\n` +
    `YOONUS P,FRG-26-410,${sampleTeam2},Senior,,Male\n` +
    `HISAN,FRG-26-321,${sampleTeam1},Junior,,Male\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Fragancia_Students_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
