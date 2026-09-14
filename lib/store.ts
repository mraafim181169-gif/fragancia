import {
  EventSettings,
  Team,
  Category,
  Competition,
  Student,
  Registration,
  AttendanceRecord,
  JudgeMark,
  CompetitionResult,
  PointAdjustment,
  ScheduleItem,
  AuditLog,
  UserSession,
  FestGrade,
  calculateGradeFromScore,
  getCodeLetterForIndex,
  getCompetitionStageType,
} from '@/types/fest';
import {
  INITIAL_CATEGORIES,
  INITIAL_COMPETITIONS,
  INITIAL_STUDENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_JUDGE_MARKS,
  INITIAL_RESULTS,
  INITIAL_SCHEDULE,
} from '@/lib/festData';

const SESSION_KEY = 'fragancia_session_v1';

// Initial Teams for Fragancia Fest (Two Houses: Team Seljuk and Team Mamluk)
const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'TEAM SELJUK',
    shortCode: 'SELJUK',
    color: '#0A0A0A',
    description: 'Leader: 310 MUHAMMED RAZI K • Sub: 311 MUHAMMED RAZEEN MK',
    captain: '310 MUHAMMED RAZI K',
    viceCaptain: '311 MUHAMMED RAZEEN MK',
    active: true,
    studentCount: 22,
    points: 20,
    onStagePoints: 10,
    offStagePoints: 10,
    goldCount: 2,
    silverCount: 0,
    bronzeCount: 0,
    rank: 1,
  },
  {
    id: 'team-2',
    name: 'TEAM MAMLUK',
    shortCode: 'MAMLUK',
    color: '#4338CA',
    description: 'Leader: 410 YOONUS P • Sub: 411 ZIYAD KUTHAR',
    captain: '410 YOONUS P',
    viceCaptain: '411 ZIYAD KUTHAR',
    active: true,
    studentCount: 22,
    points: 17,
    onStagePoints: 10,
    offStagePoints: 7,
    goldCount: 1,
    silverCount: 1,
    bronzeCount: 0,
    rank: 2,
  },
];

// Initial Point Adjustments
const INITIAL_POINT_ADJUSTMENTS: PointAdjustment[] = [
  {
    id: 'adj-1',
    teamId: 'team-1',
    teamName: 'TEAM SELJUK',
    points: 5,
    reason: 'Exemplary Pavilion Discipline & Cleanliness',
    createdAt: '2026-09-03T12:00:00Z',
    createdBy: 'admin@fragancia.local',
  },
  {
    id: 'adj-2',
    teamId: 'team-2',
    teamName: 'TEAM MAMLUK',
    points: 5,
    reason: 'Volunteer Marshaling & Stage Assistance',
    createdAt: '2026-09-03T12:15:00Z',
    createdBy: 'admin@fragancia.local',
  },
];

// Initial Settings
const INITIAL_SETTINGS: EventSettings = {
  eventName: 'Fragancia Arts Fest 2026',
  instituteName: 'Fragancia Committee',
  logoText: 'FRAGANCIA',
  subtitle: 'Grand Arts & Cultural Fest 2026',
  academicYear: '2026-2027',
  venue: 'Main Campus, Grand Auditorium & Open Stage',
  eventDates: 'September 15 - 17, 2026',
  primaryAccent: '#0A0A0A',

  // Hero & Announcement Texts
  heroTitleLine1: 'RUN THE FEST.',
  heroTitleLine2: 'NOT THE SPREADSHEET.',
  heroDescription: 'Complete autonomous control for Meelad Fest, Arts Fest, and student competitions. Instant chest numbering, blind judging panels, real-time leaderboards, and official print cards.',
  announcementText: '',
  isAnnouncementActive: false,

  // Feature Section & Architecture Texts
  featureSubheading: 'ARCHITECTURE & WORKFLOW',
  featureHeading: 'EVERYTHING IN ONE CONTROL CENTER.',
  featureDescription: 'Eliminate chaotic paper forms and conflicting scorecards. From stage roll call to the final championship trophy, Fragancia guarantees spotless accuracy.',

  // Pipeline & Workflow Texts
  pipelineHeading: 'FROM REGISTRATION TO VICTORY.',
  pipelineSubtitle: 'Designed for high-speed fest days where volunteers, judges, and stage coordinators work in tandem.',

  // Registration & Portal Parameters
  portalStatus: 'OPEN',
  portalClosedMessage: 'Participant registrations are temporarily closed by the Fest Directorate.',
  chestNumberPrefix: '',
  maxRegistrationsPerStudent: 20,
  chestPrefixAuto: false,

  // Scoring Rules & Points
  defaultFirstPoints: 10,
  defaultSecondPoints: 7,
  defaultThirdPoints: 5,
  groupFirstPoints: 15,
  groupSecondPoints: 10,
  groupThirdPoints: 7,

  // Footer, Contact & Official Reports
  footerText: 'Fragancia Fest Organising Committee • developed by rafidotcom.in',
  copyright: '© 2026 Fragancia. All rights reserved.',
  helpdeskContact: 'Control Room: Stage 1 Helpdesk | Ph: +91 98470 00000',
  signatory1Title: 'Chief Controller / Convener',
  signatory2Title: 'General Secretary / Chairman',

  themeMode: 'dark',
};

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'PORTAL_OPEN', details: 'Fragancia registration portal opened for all categories', user: 'admin@fragancia.local', timestamp: '2026-09-01T08:00:00Z' },
  { id: 'log-2', action: 'RESULT_PUBLISHED', details: 'ELOCUTION (MAL) results published with medalist rankings', user: 'admin@fragancia.local', timestamp: '2026-09-03T10:00:00Z' },
  { id: 'log-3', action: 'POINT_ADJUSTMENT', details: 'Awarded +5 points to TEAM SELJUK for exemplary pavilion discipline', user: 'admin@fragancia.local', timestamp: '2026-09-03T12:00:00Z' },
];

export interface FestStoreData {
  settings: EventSettings;
  teams: Team[];
  categories: Category[];
  competitions: Competition[];
  students: Student[];
  registrations: Registration[];
  attendance: AttendanceRecord[];
  judgeMarks: JudgeMark[];
  results: CompetitionResult[];
  pointAdjustments: PointAdjustment[];
  schedule: ScheduleItem[];
  auditLogs: AuditLog[];
}

type Listener = () => void;

// Async API helpers for background MySQL persistence
async function apiPost(url: string, body: any) {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[MySQL POST ${url}] Server response:`, err);
    }
  } catch (e) {
    console.error(`[MySQL POST ${url}] Connection error:`, e);
  }
}

async function apiPut(url: string, body: any) {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[MySQL PUT ${url}] Server response:`, err);
    }
  } catch (e) {
    console.error(`[MySQL PUT ${url}] Connection error:`, e);
  }
}

async function apiDelete(url: string) {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[MySQL DELETE ${url}] Server response:`, err);
    }
  } catch (e) {
    console.error(`[MySQL DELETE ${url}] Connection error:`, e);
  }
}

class FestStore {
  private data: FestStoreData;
  private listeners: Set<Listener> = new Set();
  private session: UserSession | null = null;
  private isHydrated: boolean = false;
  private isSyncing: boolean = false;

  constructor() {
    this.data = this.getDefaultData();
    this.recalculateAll();
  }

  public async initClient(): Promise<void> {
    if (typeof window === 'undefined' || this.isHydrated) return;
    this.isHydrated = true;

    // Purge legacy localStorage data to ensure MySQL is the sole source of truth
    try {
      localStorage.removeItem('fragancia_fest_v1');
    } catch {}

    // Load session if present
    try {
      const sessionStored = localStorage.getItem(SESSION_KEY);
      if (sessionStored) {
        this.session = JSON.parse(sessionStored);
      }
    } catch {}

    // Strictly enforce dark mode
    this.data.settings.themeMode = 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    // Hydrate fresh data from MySQL
    await this.refreshFromDb();
  }

  /**
   * Refreshes all Fest data from MySQL database
   */
  public async refreshFromDb(): Promise<void> {
    if (typeof window === 'undefined' || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.settings) {
            this.data.settings = { ...this.data.settings, ...d.settings };
          }
          if (Array.isArray(d.teams) && d.teams.length > 0) {
            this.data.teams = d.teams;
          }
          if (Array.isArray(d.categories) && d.categories.length > 0) {
            this.data.categories = d.categories;
          }
          if (Array.isArray(d.competitions) && d.competitions.length > 0) {
            this.data.competitions = d.competitions;
          }
          if (Array.isArray(d.students) && d.students.length > 0) {
            this.data.students = d.students;
          }
          if (Array.isArray(d.registrations)) {
            this.data.registrations = d.registrations;
          }
          if (Array.isArray(d.attendance)) {
            this.data.attendance = d.attendance;
          }
          if (Array.isArray(d.marks)) {
            this.data.judgeMarks = d.marks;
          }
          if (Array.isArray(d.results)) {
            this.data.results = d.results;
          }
          if (Array.isArray(d.pointAdjustments)) {
            this.data.pointAdjustments = d.pointAdjustments;
          }
          if (Array.isArray(d.schedule)) {
            this.data.schedule = d.schedule;
          }
          if (Array.isArray(d.auditLogs)) {
            this.data.auditLogs = d.auditLogs;
          }

          this.ensureCodeLetters();
          this.recalculateAll();
          this.notify();
        }
      }
    } catch (err) {
      console.warn('[FestStore] Sync from MySQL notice:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  private getDefaultData(): FestStoreData {
    return {
      settings: { ...INITIAL_SETTINGS },
      teams: [...INITIAL_TEAMS],
      categories: [...INITIAL_CATEGORIES],
      competitions: [...INITIAL_COMPETITIONS],
      students: [...INITIAL_STUDENTS],
      registrations: [...INITIAL_REGISTRATIONS],
      attendance: [...INITIAL_ATTENDANCE],
      judgeMarks: [...INITIAL_JUDGE_MARKS],
      results: [...INITIAL_RESULTS],
      pointAdjustments: [...INITIAL_POINT_ADJUSTMENTS],
      schedule: [...INITIAL_SCHEDULE],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };
  }

  public ensureCodeLetters(): void {
    if (!this.data.registrations) return;
    const compMap = new Map<string, Registration[]>();
    this.data.registrations.forEach((r) => {
      if (!compMap.has(r.competitionId)) compMap.set(r.competitionId, []);
      compMap.get(r.competitionId)!.push(r);
    });

    let modified = false;
    compMap.forEach((regs) => {
      const usedLetters = new Set<string>();
      regs.forEach((r) => {
        if (r.codeLetter) usedLetters.add(r.codeLetter.toUpperCase());
      });

      let letterIndex = 0;
      regs.forEach((r) => {
        if (!r.codeLetter) {
          while (usedLetters.has(getCodeLetterForIndex(letterIndex))) {
            letterIndex++;
          }
          const assigned = getCodeLetterForIndex(letterIndex);
          r.codeLetter = assigned;
          usedLetters.add(assigned);
          letterIndex++;
          modified = true;
          // Sync code letter to MySQL
          apiPut('/api/registrations', { id: r.id, codeLetter: assigned });
        }
      });
    });

    if (modified) {
      this.persist();
    }
  }

  private persist() {
    // Notify in-memory subscribers. No localStorage used as primary store.
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Recalculate Points, Medals, and Student Championship
  public recalculateAll() {
    // 1. Reset points for teams
    const teamStats: Record<string, { points: number; onStagePoints: number; offStagePoints: number; gold: number; silver: number; bronze: number; students: number }> = {};
    this.data.teams.forEach((t) => {
      teamStats[t.id] = { points: 0, onStagePoints: 0, offStagePoints: 0, gold: 0, silver: 0, bronze: 0, students: 0 };
    });

    // Count students per team and category
    const catStats: Record<string, number> = {};
    this.data.categories.forEach((c) => {
      catStats[c.id] = 0;
    });

    // Reset student points
    const studentPointsMap: Record<string, number> = {};
    const studentOnStagePointsMap: Record<string, number> = {};
    const studentOffStagePointsMap: Record<string, number> = {};
    this.data.students.forEach((s) => {
      studentPointsMap[s.id] = 0;
      studentOnStagePointsMap[s.id] = 0;
      studentOffStagePointsMap[s.id] = 0;
      if (teamStats[s.teamId]) {
        teamStats[s.teamId].students += 1;
      }
      if (catStats[s.categoryId] !== undefined) {
        catStats[s.categoryId] += 1;
      }
    });

    // Add points from published results
    this.data.results
      .filter((r) => r.status === 'Published')
      .forEach((res) => {
        const comp = this.data.competitions.find((c) => c.id === res.competitionId);
        const stageType = comp ? getCompetitionStageType(comp) : 'On Stage';

        res.rankings.forEach((rnk) => {
          if (teamStats[rnk.teamId]) {
            teamStats[rnk.teamId].points += rnk.pointsAwarded;
            if (stageType === 'On Stage') {
              teamStats[rnk.teamId].onStagePoints += rnk.pointsAwarded;
            } else {
              teamStats[rnk.teamId].offStagePoints += rnk.pointsAwarded;
            }

            if (rnk.rank === 1) {
              teamStats[rnk.teamId].gold += 1;
            } else if (rnk.rank === 2) {
              teamStats[rnk.teamId].silver += 1;
            } else if (rnk.rank === 3) {
              teamStats[rnk.teamId].bronze += 1;
            }
          }

          if (studentPointsMap[rnk.studentId] !== undefined) {
            studentPointsMap[rnk.studentId] += rnk.pointsAwarded;
            if (stageType === 'On Stage') {
              studentOnStagePointsMap[rnk.studentId] = (studentOnStagePointsMap[rnk.studentId] || 0) + rnk.pointsAwarded;
            } else {
              studentOffStagePointsMap[rnk.studentId] = (studentOffStagePointsMap[rnk.studentId] || 0) + rnk.pointsAwarded;
            }
          }
        });
      });

    // Add bonus / minus adjustments
    this.data.pointAdjustments.forEach((adj) => {
      if (teamStats[adj.teamId]) {
        teamStats[adj.teamId].points += adj.points;
      }
    });

    // Update teams
    this.data.teams = this.data.teams.map((t) => {
      const stats = teamStats[t.id] || { points: 0, onStagePoints: 0, offStagePoints: 0, gold: 0, silver: 0, bronze: 0, students: 0 };
      return {
        ...t,
        points: Math.max(0, stats.points),
        onStagePoints: Math.max(0, stats.onStagePoints),
        offStagePoints: Math.max(0, stats.offStagePoints),
        goldCount: stats.gold,
        silverCount: stats.silver,
        bronzeCount: stats.bronze,
        studentCount: stats.students,
      };
    });

    // Rank teams (descending points, then gold, then silver)
    const sortedTeams = [...this.data.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
      return b.silverCount - a.silverCount;
    });

    this.data.teams = this.data.teams.map((t) => {
      const rankIdx = sortedTeams.findIndex((st) => st.id === t.id);
      return { ...t, rank: rankIdx + 1 };
    });

    // Update categories
    this.data.categories = this.data.categories.map((c) => ({
      ...c,
      studentCount: catStats[c.id] || 0,
    }));

    // Update students points and rank
    const studentsWithPoints = this.data.students.map((s) => ({
      ...s,
      totalPoints: studentPointsMap[s.id] || 0,
      onStagePoints: studentOnStagePointsMap[s.id] || 0,
      offStagePoints: studentOffStagePointsMap[s.id] || 0,
    }));

    const sortedStudents = [...studentsWithPoints].sort((a, b) => b.totalPoints - a.totalPoints);
    this.data.students = studentsWithPoints.map((s) => {
      const rankIdx = sortedStudents.findIndex((ss) => ss.id === s.id);
      return { ...s, rank: rankIdx + 1 };
    });
  }

  // ================= AUTH & SESSION =================
  public getSession(): UserSession {
    if (!this.session) {
      this.session = {
        id: 'usr-admin',
        name: 'Fest Director (Admin)',
        email: 'admin@fragancia.local',
        role: 'ADMIN',
      };
    }
    return this.session;
  }

  public setSession(session: UserSession | null) {
    this.session = session;
    if (typeof window !== 'undefined') {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    this.notify();
  }

  // ================= SETTINGS =================
  public getSettings(): EventSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<EventSettings>) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.logAction('SETTINGS_UPDATED', 'Updated event settings and preferences');
    apiPut('/api/settings', settings);
    this.persist();
  }

  public togglePortalStatus(): 'OPEN' | 'CLOSED' {
    const nextStatus = this.data.settings.portalStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    this.data.settings.portalStatus = nextStatus;
    this.logAction('PORTAL_STATUS_CHANGED', `Registration portal changed to ${nextStatus}`);
    apiPut('/api/settings', { portalStatus: nextStatus });
    this.persist();
    return nextStatus;
  }

  // ================= TEAMS =================
  public getTeams(): Team[] {
    return [...this.data.teams].sort((a, b) => a.rank - b.rank);
  }

  public getTeam(id: string): Team | undefined {
    return this.data.teams.find((t) => t.id === id);
  }

  public createTeam(team: Omit<Team, 'id' | 'points' | 'goldCount' | 'silverCount' | 'bronzeCount' | 'studentCount' | 'rank' | 'onStagePoints' | 'offStagePoints'>): Team {
    const newTeam: Team = {
      ...team,
      id: `team-${Date.now()}`,
      points: 0,
      onStagePoints: 0,
      offStagePoints: 0,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      studentCount: 0,
      rank: this.data.teams.length + 1,
    };
    this.data.teams.push(newTeam);
    this.logAction('TEAM_CREATED', `Created team ${newTeam.name} (${newTeam.shortCode})`);
    apiPost('/api/teams', newTeam);
    this.recalculateAll();
    this.persist();
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<Team>) {
    this.data.teams = this.data.teams.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.logAction('TEAM_UPDATED', `Updated team ${updates.name || id}`);
    apiPut('/api/teams', { id, ...updates });
    this.recalculateAll();
    this.persist();
  }

  public deleteTeam(id: string) {
    const team = this.data.teams.find((t) => t.id === id);
    this.data.teams = this.data.teams.filter((t) => t.id !== id);
    this.logAction('TEAM_DELETED', `Deleted team ${team?.name || id}`);
    apiDelete(`/api/teams?id=${encodeURIComponent(id)}`);
    this.recalculateAll();
    this.persist();
  }

  // ================= CATEGORIES =================
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public createCategory(cat: Omit<Category, 'id' | 'studentCount'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      studentCount: 0,
    };
    this.data.categories.push(newCat);
    this.logAction('CATEGORY_CREATED', `Created category ${newCat.name}`);
    apiPost('/api/categories', newCat);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    this.data.categories = this.data.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    apiPut('/api/categories', { id, ...updates });
    this.persist();
  }

  public deleteCategory(id: string) {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    apiDelete(`/api/categories?id=${encodeURIComponent(id)}`);
    this.persist();
  }

  // ================= COMPETITIONS =================
  public getCompetitions(): Competition[] {
    return this.data.competitions;
  }

  public getCompetition(id: string): Competition | undefined {
    return this.data.competitions.find((c) => c.id === id);
  }

  public createCompetition(comp: Partial<Competition> & { name: string; categoryId: string }): Competition {
    const isOffStage = comp.stageType === 'Off Stage' || (comp.categoryName || '').toLowerCase().includes('off stage');
    const stageType: 'On Stage' | 'Off Stage' = isOffStage ? 'Off Stage' : 'On Stage';
    const finalStage = isOffStage ? '' : (comp.stage || 'Main Stage');

    const newComp: Competition = {
      id: `comp-${Date.now()}`,
      name: comp.name,
      type: comp.type || 'Single',
      categoryId: comp.categoryId,
      categoryName: comp.categoryName || '',
      stageType,
      maxParticipants: comp.maxParticipants ?? 20,
      timeLimit: comp.timeLimit || `${comp.durationMinutes || 10} Mins`,
      rules: comp.rules || '',
      firstPlacePoints: comp.firstPlacePoints ?? 10,
      secondPlacePoints: comp.secondPlacePoints ?? 7,
      thirdPlacePoints: comp.thirdPlacePoints ?? 5,
      status: comp.status || 'Upcoming',
      stage: finalStage,
      startTime: comp.startTime || comp.scheduledTime || '10:00 AM',
      scheduledTime: comp.scheduledTime || comp.startTime || '10:00 AM',
      durationMinutes: comp.durationMinutes || 10,
      scoringCriteria: comp.scoringCriteria || [
        { id: 'sc-1', name: 'Pronunciation', maxScore: 30 },
        { id: 'sc-2', name: 'Melody & Tone', maxScore: 30 },
        { id: 'sc-3', name: 'Fluency', maxScore: 20 },
        { id: 'sc-4', name: 'Presentation', maxScore: 20 },
      ],
      resultStatus: 'Draft',
    };
    this.data.competitions.push(newComp);
    this.logAction('COMPETITION_CREATED', `Created competition ${newComp.name}`);
    apiPost('/api/competitions', newComp);
    this.persist();
    return newComp;
  }

  public updateCompetition(id: string, updates: Partial<Competition>) {
    this.data.competitions = this.data.competitions.map((c) => (c.id === id ? { ...c, ...updates } : c));
    apiPut('/api/competitions', { id, ...updates });
    this.persist();
  }

  public deleteCompetition(id: string) {
    this.data.competitions = this.data.competitions.filter((c) => c.id !== id);
    this.data.registrations = this.data.registrations.filter((r) => r.competitionId !== id);
    this.data.results = this.data.results.filter((r) => r.competitionId !== id);
    apiDelete(`/api/competitions?id=${encodeURIComponent(id)}`);
    this.recalculateAll();
    this.persist();
  }

  // ================= STUDENTS & CHEST NUMBERS =================
  public getStudents(): Student[] {
    return [...this.data.students];
  }

  public getStudent(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public generateChestNumber(teamCode: string): string {
    const cleanCode = (teamCode || 'GEN').toUpperCase().trim();
    const existingNums = this.data.students
      .filter((s) => s.chestNumber.startsWith(`${cleanCode}-`))
      .map((s) => {
        const numPart = parseInt(s.chestNumber.replace(`${cleanCode}-`, ''), 10);
        return isNaN(numPart) ? 0 : numPart;
      });

    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `${cleanCode}-${String(nextNum).padStart(3, '0')}`;
  }

  public isChestNumberDuplicate(chestNumber: string, excludeStudentId?: string): boolean {
    return this.data.students.some(
      (s) => s.chestNumber.toUpperCase() === chestNumber.toUpperCase() && s.id !== excludeStudentId
    );
  }

  public isAdmissionNoDuplicate(admissionNo: string, excludeStudentId?: string): boolean {
    return this.data.students.some(
      (s) => s.admissionNo.toUpperCase() === admissionNo.toUpperCase() && s.id !== excludeStudentId
    );
  }

  public createStudent(studentData: Omit<Student, 'id' | 'totalPoints' | 'rank'>): Student {
    const team = this.getTeam(studentData.teamId);
    const category = this.data.categories.find((c) => c.id === studentData.categoryId);

    let chestNumber = studentData.chestNumber?.trim();
    if (!chestNumber) {
      chestNumber = this.generateChestNumber(team?.shortCode || 'GEN');
    }

    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      chestNumber,
      teamName: team?.name || studentData.teamName,
      teamCode: team?.shortCode || studentData.teamCode,
      categoryName: category?.name || studentData.categoryName,
      totalPoints: 0,
      onStagePoints: 0,
      offStagePoints: 0,
      rank: this.data.students.length + 1,
    };

    this.data.students.push(newStudent);
    this.logAction('STUDENT_ADDED', `Enrolled ${newStudent.fullName} [${newStudent.chestNumber}] to ${newStudent.teamName}`);
    apiPost('/api/students', newStudent);
    this.recalculateAll();
    this.persist();
    return newStudent;
  }

  public bulkCreateStudents(
    newStudents: Array<Omit<Student, 'id' | 'totalPoints' | 'rank' | 'chestNumber'> & { chestNumber?: string }>
  ): { enrolledCount: number; students: Student[] } {
    const created: Student[] = [];
    const baseTimestamp = Date.now();

    newStudents.forEach((stData, index) => {
      const team = this.getTeam(stData.teamId);
      const category = this.data.categories.find((c) => c.id === stData.categoryId);

      let chestNumber = stData.chestNumber?.trim();
      if (!chestNumber) {
        chestNumber = this.generateChestNumber(team?.shortCode || 'GEN');
      }

      const student: Student = {
        ...stData,
        id: `stu-${baseTimestamp}-${index}-${Math.floor(Math.random() * 10000)}`,
        chestNumber,
        teamName: team?.name || stData.teamName,
        teamCode: team?.shortCode || stData.teamCode,
        categoryName: category?.name || stData.categoryName,
        totalPoints: 0,
        onStagePoints: 0,
        offStagePoints: 0,
        rank: this.data.students.length + 1,
      };

      this.data.students.push(student);
      created.push(student);
      apiPost('/api/students', student);
    });

    this.logAction('BULK_STUDENT_ENROLLMENT', `Enrolled ${created.length} students via Excel file upload`);
    this.recalculateAll();
    this.persist();
    return { enrolledCount: created.length, students: created };
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    this.data.students = this.data.students.map((s) => {
      if (s.id === id) {
        const team = updates.teamId ? this.getTeam(updates.teamId) : null;
        const category = updates.categoryId ? this.data.categories.find((c) => c.id === updates.categoryId) : null;
        return {
          ...s,
          ...updates,
          teamName: team ? team.name : s.teamName,
          teamCode: team ? team.shortCode : s.teamCode,
          categoryName: category ? category.name : s.categoryName,
        };
      }
      return s;
    });
    apiPut('/api/students', { id, ...updates });
    this.recalculateAll();
    this.persist();
  }

  public deleteStudent(id: string) {
    const student = this.data.students.find((s) => s.id === id);
    this.data.students = this.data.students.filter((s) => s.id !== id);
    this.data.registrations = this.data.registrations.filter((r) => r.studentId !== id);
    this.data.attendance = this.data.attendance.filter((a) => a.studentId !== id);
    this.data.judgeMarks = this.data.judgeMarks.filter((m) => m.studentId !== id);
    this.logAction('STUDENT_DELETED', `Removed student ${student?.fullName} [${student?.chestNumber}]`);
    apiDelete(`/api/students?id=${encodeURIComponent(id)}`);
    this.recalculateAll();
    this.persist();
  }

  // ================= REGISTRATIONS =================
  public getRegistrations(): Registration[] {
    return [...this.data.registrations];
  }

  public getRegistrationsByCompetition(competitionId: string): Registration[] {
    return this.data.registrations.filter((r) => r.competitionId === competitionId);
  }

  public getRegistrationsByStudent(studentId: string): Registration[] {
    return this.data.registrations.filter((r) => r.studentId === studentId);
  }

  public registerStudent(
    competitionId: string,
    studentId: string,
    bypassPortal = false,
    codeLetter?: string
  ): { success: boolean; message: string } {
    if (!bypassPortal && this.data.settings.portalStatus === 'CLOSED') {
      return { success: false, message: 'Registration portal is currently closed.' };
    }

    const comp = this.getCompetition(competitionId);
    const student = this.getStudent(studentId);

    if (!comp || !student) {
      return { success: false, message: 'Invalid competition or student selected.' };
    }

    // Check duplicate
    const isDuplicate = this.data.registrations.some(
      (r) => r.competitionId === competitionId && r.studentId === studentId && r.status !== 'Cancelled'
    );
    if (isDuplicate) {
      return { success: false, message: `${student.fullName} is already registered for this competition.` };
    }

    // Check category eligibility (except general competitions)
    const isGeneral =
      comp.type === 'General' ||
      comp.categoryId === 'cat-general' ||
      comp.categoryName.toLowerCase().includes('general');

    const sCat = (student.categoryName || '').toLowerCase();
    const cCat = (comp.categoryName || '').toLowerCase();

    const matchesSenior = sCat.includes('senior') && cCat.includes('senior');
    const matchesJunior = sCat.includes('junior') && cCat.includes('junior');

    const isEligible = isGeneral || comp.categoryId === student.categoryId || matchesSenior || matchesJunior;

    if (!isEligible) {
      return {
        success: false,
        message: `Ineligible: Competition is restricted to '${comp.categoryName}', but student is in '${student.categoryName}'.`,
      };
    }

    // Check max participants limit
    const currentCount = this.data.registrations.filter(
      (r) => r.competitionId === competitionId && r.status === 'Registered'
    ).length;

    let status: 'Registered' | 'Waitlisted' = 'Registered';
    if (currentCount >= comp.maxParticipants) {
      status = 'Waitlisted';
    }

    // Determine code letter
    let finalCodeLetter = (codeLetter || '').trim().toUpperCase();
    if (!finalCodeLetter) {
      const existingLetters = new Set(
        this.data.registrations
          .filter((r) => r.competitionId === competitionId && r.status !== 'Cancelled')
          .map((r) => r.codeLetter?.toUpperCase())
          .filter(Boolean)
      );
      let idx = 0;
      while (existingLetters.has(getCodeLetterForIndex(idx))) {
        idx++;
      }
      finalCodeLetter = getCodeLetterForIndex(idx);
    }

    const newReg: Registration = {
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      competitionId: comp.id,
      competitionName: comp.name,
      studentId: student.id,
      studentName: student.fullName,
      chestNumber: student.chestNumber,
      codeLetter: finalCodeLetter,
      teamId: student.teamId,
      teamName: student.teamName,
      categoryId: student.categoryId,
      status,
      registeredAt: new Date().toISOString(),
    };

    this.data.registrations = [...this.data.registrations, newReg];
    this.logAction(
      'STUDENT_REGISTERED',
      `Registered ${student.fullName} [${student.chestNumber}] (Code ${finalCodeLetter}) for ${comp.name} (${status})`
    );
    apiPost('/api/registrations', newReg);
    this.persist();
    return {
      success: true,
      message: status === 'Waitlisted' ? 'Participant added to waitlist (cap reached)' : `Registered with Code Letter '${finalCodeLetter}'!`,
    };
  }

  public updateRegistrationCodeLetter(id: string, codeLetter: string) {
    const clean = codeLetter.trim().toUpperCase();
    this.data.registrations = this.data.registrations.map((r) =>
      r.id === id ? { ...r, codeLetter: clean } : r
    );
    this.logAction('CODE_LETTER_UPDATED', `Assigned Code Letter ${clean} to registration`);
    apiPut('/api/registrations', { id, codeLetter: clean });
    this.persist();
  }

  public autoAssignCodeLetters(competitionId: string) {
    const regs = this.data.registrations.filter(
      (r) => r.competitionId === competitionId && r.status !== 'Cancelled'
    );
    regs.forEach((r, idx) => {
      const code = getCodeLetterForIndex(idx);
      r.codeLetter = code;
      apiPut('/api/registrations', { id: r.id, codeLetter: code });
    });
    this.logAction('CODE_LETTERS_ASSIGNED', `Auto-assigned sequential code letters (A, B, C...) for competition`);
    this.persist();
  }

  public deleteRegistration(id: string) {
    this.data.registrations = this.data.registrations.filter((r) => r.id !== id);
    apiDelete(`/api/registrations?id=${encodeURIComponent(id)}`);
    this.persist();
  }

  public updateRegistrationStatus(id: string, status: 'Registered' | 'Cancelled' | 'Waitlisted') {
    this.data.registrations = this.data.registrations.map((r) => (r.id === id ? { ...r, status } : r));
    apiPut('/api/registrations', { id, status });
    this.persist();
  }

  // ================= ATTENDANCE =================
  public getAttendance(): AttendanceRecord[] {
    return this.data.attendance;
  }

  public getCompetitionAttendance(competitionId: string): AttendanceRecord[] {
    return this.data.attendance.filter((a) => a.competitionId === competitionId);
  }

  public markAttendance(competitionId: string, studentId: string, chestNumber: string, status: 'Present' | 'Absent') {
    const existingIdx = this.data.attendance.findIndex(
      (a) => a.competitionId === competitionId && a.studentId === studentId
    );

    const recordId = existingIdx >= 0 ? this.data.attendance[existingIdx].id : `att-${Date.now()}-${studentId}`;

    if (existingIdx >= 0) {
      this.data.attendance[existingIdx].status = status;
      this.data.attendance[existingIdx].markedAt = new Date().toISOString();
    } else {
      this.data.attendance.push({
        id: recordId,
        competitionId,
        studentId,
        chestNumber,
        status,
        markedAt: new Date().toISOString(),
      });
    }

    apiPost('/api/attendance', {
      id: recordId,
      competitionId,
      studentId,
      chestNumber,
      status,
    });

    this.persist();
  }

  public bulkMarkAttendance(competitionId: string, studentIds: string[], status: 'Present' | 'Absent') {
    studentIds.forEach((sid) => {
      const student = this.getStudent(sid);
      if (student) {
        this.markAttendance(competitionId, sid, student.chestNumber, status);
      }
    });
  }

  // ================= JUDGING & MARKS =================
  public getJudgeMarks(): JudgeMark[] {
    return [...this.data.judgeMarks];
  }

  public getMarksForCompetition(competitionId: string): JudgeMark[] {
    return this.data.judgeMarks.filter((m) => m.competitionId === competitionId);
  }

  public saveJudgeMark(mark: Omit<JudgeMark, 'id' | 'submittedAt'>): JudgeMark {
    let codeLetter = mark.codeLetter;
    if (!codeLetter) {
      const reg = this.data.registrations.find(
        (r) => r.competitionId === mark.competitionId && r.studentId === mark.studentId
      );
      codeLetter = reg?.codeLetter;
    }

    const grade = mark.grade || calculateGradeFromScore(mark.totalScore, mark.maxScore || 100);

    const existingIdx = this.data.judgeMarks.findIndex(
      (m) =>
        m.competitionId === mark.competitionId &&
        m.studentId === mark.studentId &&
        m.judgeName === mark.judgeName
    );

    let savedMark: JudgeMark;
    if (existingIdx >= 0) {
      savedMark = {
        ...this.data.judgeMarks[existingIdx],
        ...mark,
        codeLetter: codeLetter || this.data.judgeMarks[existingIdx].codeLetter,
        grade,
        submittedAt: new Date().toISOString(),
      };
      this.data.judgeMarks = this.data.judgeMarks.map((m, idx) => (idx === existingIdx ? savedMark : m));
    } else {
      savedMark = {
        ...mark,
        codeLetter,
        grade,
        id: `jm-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      this.data.judgeMarks = [...this.data.judgeMarks, savedMark];
    }

    this.logAction(
      'MARK_SAVED',
      `Score recorded for Code ${codeLetter || mark.chestNumber} (${mark.totalScore} pts, Grade ${grade}) in competition`
    );
    apiPost('/api/marks', savedMark);
    this.persist();
    return savedMark;
  }

  public updateJudgeMark(id: string, updates: Partial<JudgeMark>): JudgeMark | undefined {
    const mark = this.data.judgeMarks.find((m) => m.id === id);
    if (!mark) return undefined;

    const totalScore = updates.totalScore !== undefined ? updates.totalScore : mark.totalScore;
    const grade = updates.grade || calculateGradeFromScore(totalScore, mark.maxScore || 100);

    const updated: JudgeMark = {
      ...mark,
      ...updates,
      totalScore,
      grade,
      submittedAt: new Date().toISOString(),
    };

    this.data.judgeMarks = this.data.judgeMarks.map((m) => (m.id === id ? updated : m));
    this.logAction(
      'MARK_UPDATED',
      `Updated score for Code ${updated.codeLetter || updated.chestNumber} (${updated.totalScore} pts, Grade ${grade})`
    );
    apiPost('/api/marks', updated);
    this.persist();
    return updated;
  }

  public deleteJudgeMark(id: string) {
    const mark = this.data.judgeMarks.find((m) => m.id === id);
    this.data.judgeMarks = this.data.judgeMarks.filter((m) => m.id !== id);
    this.logAction(
      'MARK_DELETED',
      `Deleted score for Code ${mark?.codeLetter || mark?.chestNumber || id}`
    );
    apiDelete(`/api/marks?id=${encodeURIComponent(id)}`);
    this.persist();
  }

  // ================= RESULTS CALCULATION & PUBLISHING =================
  public getResults(): CompetitionResult[] {
    return this.data.results;
  }

  public getResultForCompetition(competitionId: string): CompetitionResult | undefined {
    return this.data.results.find((r) => r.competitionId === competitionId);
  }

  public calculateDraftResult(competitionId: string): CompetitionResult | null {
    const comp = this.getCompetition(competitionId);
    if (!comp) return null;

    const compMarks = this.data.judgeMarks.filter((m) => m.competitionId === competitionId);
    if (compMarks.length === 0) return null;

    // Group scores by studentId
    const studentScoreTotals: Record<string, { totalScore: number; count: number; studentId: string; chestNumber: string }> = {};

    compMarks.forEach((m) => {
      if (!studentScoreTotals[m.studentId]) {
        studentScoreTotals[m.studentId] = {
          totalScore: 0,
          count: 0,
          studentId: m.studentId,
          chestNumber: m.chestNumber,
        };
      }
      studentScoreTotals[m.studentId].totalScore += m.totalScore;
      studentScoreTotals[m.studentId].count += 1;
    });

    // Calculate averages & sort descending
    const studentAverages = Object.values(studentScoreTotals).map((item) => ({
      studentId: item.studentId,
      chestNumber: item.chestNumber,
      avgScore: Math.round((item.totalScore / item.count) * 10) / 10,
    })).sort((a, b) => b.avgScore - a.avgScore);

    const rankings = studentAverages.map((item, idx) => {
      const student = this.getStudent(item.studentId);
      const reg = this.data.registrations.find(
        (r) => r.competitionId === competitionId && r.studentId === item.studentId
      );
      const rank = idx + 1;
      let points = 0;
      if (rank === 1) points = comp.firstPlacePoints;
      else if (rank === 2) points = comp.secondPlacePoints;
      else if (rank === 3) points = comp.thirdPlacePoints;

      return {
        rank,
        studentId: item.studentId,
        studentName: student?.fullName || 'Unknown',
        chestNumber: item.chestNumber,
        codeLetter: reg?.codeLetter,
        grade: calculateGradeFromScore(item.avgScore, 100),
        teamId: student?.teamId || '',
        teamName: student?.teamName || '',
        totalScore: item.avgScore,
        pointsAwarded: points,
      };
    });

    const existingResult = this.getResultForCompetition(competitionId);

    return {
      id: existingResult ? existingResult.id : `res-${competitionId}`,
      competitionId,
      competitionName: comp.name,
      rankings,
      status: existingResult ? existingResult.status : 'Draft',
      publishedAt: existingResult?.publishedAt || null,
    };
  }

  public publishCompetitionResult(competitionId: string, customRankings?: CompetitionResult['rankings']): CompetitionResult | null {
    const draft = this.calculateDraftResult(competitionId);
    if (!draft) return null;

    const resultToSave: CompetitionResult = {
      ...draft,
      rankings: customRankings || draft.rankings,
      status: 'Published',
      publishedAt: new Date().toISOString(),
    };

    const existingIdx = this.data.results.findIndex((r) => r.competitionId === competitionId);
    if (existingIdx >= 0) {
      this.data.results[existingIdx] = resultToSave;
    } else {
      this.data.results.push(resultToSave);
    }

    // Update competition status to Completed
    this.updateCompetition(competitionId, {
      status: 'Completed',
      resultStatus: 'Published',
      publishedAt: resultToSave.publishedAt,
    });

    this.logAction('RESULT_PUBLISHED', `Published official results for ${draft.competitionName}`);
    apiPost('/api/results', resultToSave);
    this.recalculateAll();
    this.persist();
    return resultToSave;
  }

  public unpublishResult(competitionId: string) {
    this.data.results = this.data.results.map((r) =>
      r.competitionId === competitionId ? { ...r, status: 'Draft', publishedAt: null } : r
    );
    this.updateCompetition(competitionId, { resultStatus: 'Draft' });
    this.logAction('RESULT_UNPUBLISHED', `Withdrew published result for competition ${competitionId}`);
    apiDelete(`/api/results?competitionId=${encodeURIComponent(competitionId)}`);
    this.recalculateAll();
    this.persist();
  }

  // ================= BONUS / MINUS POINTS =================
  public getPointAdjustments(): PointAdjustment[] {
    return this.data.pointAdjustments;
  }

  public addPointAdjustment(teamId: string, points: number, reason: string): PointAdjustment {
    const team = this.getTeam(teamId);
    const newAdj: PointAdjustment = {
      id: `adj-${Date.now()}`,
      teamId,
      teamName: team?.name || 'Unknown',
      points,
      reason,
      createdAt: new Date().toISOString(),
      createdBy: this.getSession().email,
    };
    this.data.pointAdjustments.push(newAdj);
    this.logAction(
      'POINT_ADJUSTMENT',
      `Applied ${points > 0 ? `+${points}` : points} points to ${team?.name}: "${reason}"`
    );
    apiPost('/api/point-adjustments', newAdj);
    this.recalculateAll();
    this.persist();
    return newAdj;
  }

  public deletePointAdjustment(id: string) {
    this.data.pointAdjustments = this.data.pointAdjustments.filter((a) => a.id !== id);
    apiDelete(`/api/point-adjustments?id=${encodeURIComponent(id)}`);
    this.recalculateAll();
    this.persist();
  }

  // ================= SCHEDULE =================
  public getSchedule(): ScheduleItem[] {
    return this.data.schedule;
  }

  public createScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    this.data.schedule.push(newItem);
    apiPost('/api/schedule', newItem);
    this.persist();
    return newItem;
  }

  public updateScheduleItem(id: string, updates: Partial<ScheduleItem>) {
    this.data.schedule = this.data.schedule.map((s) => (s.id === id ? { ...s, ...updates } : s));
    apiPut('/api/schedule', { id, ...updates });
    this.persist();
  }

  public deleteScheduleItem(id: string) {
    this.data.schedule = this.data.schedule.filter((s) => s.id !== id);
    apiDelete(`/api/schedule?id=${encodeURIComponent(id)}`);
    this.persist();
  }

  // ================= AUDIT LOGS =================
  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private logAction(action: string, details: string) {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      user: this.getSession().email,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(logItem);
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs.pop();
    }
    apiPost('/api/audit-logs', logItem);
  }

  // ================= RESET / DEMO & PURGE ALL CONTENT =================
  public clearAllContent(options: { clearCompetitions?: boolean } = {}) {
    this.data.students = [];
    this.data.registrations = [];
    this.data.attendance = [];
    this.data.judgeMarks = [];
    this.data.results = [];
    this.data.pointAdjustments = [];
    this.data.schedule = [];

    if (options.clearCompetitions) {
      this.data.competitions = [];
    } else {
      this.data.competitions = this.data.competitions.map((c) => ({
        ...c,
        status: 'Upcoming',
        resultStatus: 'Draft',
        publishedAt: null,
      }));
    }

    // Reset teams points and counts
    this.data.teams = this.data.teams.map((t) => ({
      ...t,
      points: 0,
      onStagePoints: 0,
      offStagePoints: 0,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
      studentCount: 0,
    }));

    // Reset categories student count
    this.data.categories = this.data.categories.map((c) => ({
      ...c,
      studentCount: 0,
    }));

    this.recalculateAll();
    this.persist();
    this.logAction(
      'ALL_CONTENT_CLEARED',
      `Purged all student enrollments, registrations, results, and records${
        options.clearCompetitions ? ' and competitions' : ''
      }`
    );
  }

  public resetToDemoData() {
    this.data = this.getDefaultData();
    this.recalculateAll();
    this.persist();
    this.logAction('DEMO_RESET', 'Restored pristine sample fest records');
  }
}

// Singleton export
export const store = new FestStore();
