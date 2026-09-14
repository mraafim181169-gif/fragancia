export type Role = 'ADMIN' | 'JUDGE' | 'VIEWER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface EventSettings {
  // Identity & General Branding
  eventName: string;
  instituteName: string;
  logoText: string;
  subtitle: string;
  academicYear?: string;
  venue?: string;
  eventDates?: string;
  primaryAccent: string;

  // Hero & Announcement Texts
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroDescription?: string;
  announcementText?: string;
  isAnnouncementActive?: boolean;

  // Feature Section & Architecture Texts
  featureSubheading?: string;
  featureHeading?: string;
  featureDescription?: string;

  // Pipeline & Workflow Texts
  pipelineHeading?: string;
  pipelineSubtitle?: string;

  // Registration & Portal Parameters
  portalStatus: 'OPEN' | 'CLOSED';
  portalClosedMessage?: string;
  chestNumberPrefix?: string;
  maxRegistrationsPerStudent?: number;
  chestPrefixAuto: boolean;

  // Scoring Rules & Points
  defaultFirstPoints: number;
  defaultSecondPoints: number;
  defaultThirdPoints: number;
  groupFirstPoints?: number;
  groupSecondPoints?: number;
  groupThirdPoints?: number;

  // Footer, Contact & Official Reports
  footerText: string;
  copyright: string;
  helpdeskContact?: string;
  signatory1Title?: string;
  signatory2Title?: string;

  themeMode: 'light' | 'dark';
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  description: string;
  captain: string;
  viceCaptain?: string;
  active: boolean;
  studentCount: number;
  points: number;
  onStagePoints?: number;
  offStagePoints?: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  rank: number;
}

export interface Category {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  maxCompetitionsPerStudent?: number;
  description: string;
  active: boolean;
  studentCount: number;
}

export type CompetitionType = 'Single' | 'Group' | 'General';
export type CompetitionStatus = 'Upcoming' | 'Live' | 'Completed';
export type StageType = 'On Stage' | 'Off Stage';

export interface ScoringCriterion {
  id: string;
  name: string;
  maxScore: number;
}

export type CompetitionCriteria = ScoringCriterion;

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  categoryId: string;
  categoryName: string;
  stageType?: StageType;
  maxParticipants: number;
  timeLimit: string;
  rules: string;
  firstPlacePoints: number;
  secondPlacePoints: number;
  thirdPlacePoints: number;
  status: CompetitionStatus;
  stage: string;
  startTime: string;
  scheduledTime?: string;
  durationMinutes?: number;
  scoringCriteria: ScoringCriterion[];
  resultStatus: 'Draft' | 'Published';
  publishedAt?: string | null;
}

export function getCompetitionStageType(comp: {
  stageType?: StageType;
  categoryName?: string;
  categoryId?: string;
  stage?: string;
  name?: string;
}): StageType {
  if (comp.stageType === 'On Stage' || comp.stageType === 'Off Stage') {
    return comp.stageType;
  }
  const cat = (comp.categoryName || '').toLowerCase();
  const catId = (comp.categoryId || '').toLowerCase();
  if (cat.includes('on stage') || catId.includes('-on')) {
    return 'On Stage';
  }
  if (cat.includes('off stage') || catId.includes('-off')) {
    return 'Off Stage';
  }

  // General items check
  const stage = (comp.stage || '').toLowerCase();
  if (
    stage.includes('auditorium') ||
    stage.includes('stage') ||
    stage.includes('majlis') ||
    stage.includes('open')
  ) {
    return 'On Stage';
  }
  return 'Off Stage';
}

export interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  chestNumber: string;
  phone: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  categoryId: string;
  categoryName: string;
  gender: 'Male' | 'Female' | 'Other';
  role?: 'Leader' | 'Sub-Leader' | 'Member';
  photo?: string;
  status: 'Active' | 'Inactive';
  totalPoints: number;
  onStagePoints?: number;
  offStagePoints?: number;
  rank: number;
}

export interface Registration {
  id: string;
  competitionId: string;
  competitionName: string;
  studentId: string;
  studentName: string;
  chestNumber: string;
  codeLetter?: string; // e.g. 'A', 'B', 'C', 'D', 'E'
  teamId: string;
  teamName: string;
  categoryId: string;
  status: 'Registered' | 'Cancelled' | 'Waitlisted';
  registeredAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
  id: string;
  competitionId: string;
  studentId: string;
  chestNumber: string;
  codeLetter?: string;
  status: AttendanceStatus;
  markedAt: string;
}

export type FestGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'NO GRADE';

export function calculateGradeFromScore(score: number, maxScore: number = 100): FestGrade {
  if (score <= 0) return 'NO GRADE';
  
  // Direct 10-point scale check if maxScore is 10 or score <= 10
  if (maxScore <= 10) {
    if (score >= 9.5) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 7.5) return 'B+';
    if (score >= 6.5) return 'B';
    if (score >= 5.5) return 'C+';
    if (score >= 4.5) return 'C';
    return 'NO GRADE';
  }

  // 100-point scale / percentage check:
  // 10: A+ (90-100)
  // 9: A   (80-89)
  // 8: B+  (70-79)
  // 7: B   (60-69)
  // 6: C+  (50-59)
  // 5: C   (40-49)
  // 4, 3, 2, 1: NO GRADE (<40)
  const pct = (score / (maxScore || 100)) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  return 'NO GRADE';
}

export function getGradePointValue(grade?: FestGrade | string | null): number {
  if (!grade) return 0;
  const g = grade.trim().toUpperCase();
  if (g === 'A+') return 10;
  if (g === 'A') return 9;
  if (g === 'B+') return 8;
  if (g === 'B') return 7;
  if (g === 'C+') return 6;
  if (g === 'C') return 5;
  return 0; // 4, 3, 2, 1 NO GRADE
}

export function getCodeLetterForIndex(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < letters.length) {
    return letters[index];
  }
  const first = Math.floor(index / letters.length) - 1;
  const second = index % letters.length;
  return `${letters[first] || ''}${letters[second]}`;
}

export interface JudgeMark {
  id: string;
  competitionId: string;
  studentId: string;
  chestNumber: string;
  codeLetter?: string; // e.g. 'A', 'B', 'C'
  judgeName: string;
  scores: Record<string, number>;
  totalScore: number;
  grade?: FestGrade;
  maxScore: number;
  feedback?: string;
  submittedAt: string;
}

export interface CompetitionResultRanking {
  rank: 1 | 2 | 3 | number;
  studentId: string;
  studentName: string;
  chestNumber: string;
  codeLetter?: string;
  grade?: FestGrade;
  teamId: string;
  teamName: string;
  totalScore: number;
  pointsAwarded: number;
}

export interface CompetitionResult {
  id: string;
  competitionId: string;
  competitionName: string;
  rankings: CompetitionResultRanking[];
  status: 'Draft' | 'Published';
  publishedAt?: string | null;
}

export interface PointAdjustment {
  id: string;
  teamId: string;
  teamName: string;
  points: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  stage: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  category: string;
  competitionId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'JUDGE' | 'VIEWER';
  createdAt: string;
}
