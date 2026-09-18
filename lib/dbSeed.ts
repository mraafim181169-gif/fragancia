import { execute, query } from '@/lib/db';
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

// Initial Teams for Fragancia Fest
const INITIAL_TEAMS = [
  {
    id: 'team-1',
    name: 'TEAM SELJUK',
    shortCode: 'SELJUK',
    color: '#0A0A0A',
    description: 'Leader: 310 MUHAMMED RAZI K • Sub: 311 MUHAMMED RAZEEN MK',
    captain: '310 MUHAMMED RAZI K',
    viceCaptain: '311 MUHAMMED RAZEEN MK',
    active: 1,
  },
  {
    id: 'team-2',
    name: 'TEAM MAMLUK',
    shortCode: 'MAMLUK',
    color: '#4338CA',
    description: 'Leader: 410 YOONUS P • Sub: 411 ZIYAD KUTHAR',
    captain: '410 YOONUS P',
    viceCaptain: '411 ZIYAD KUTHAR',
    active: 1,
  },
];

const INITIAL_SETTINGS = {
  id: 'fest_settings_primary',
  eventName: 'Fragancia Arts Fest 2026',
  instituteName: 'Fragancia Committee',
  logoText: 'FRAGANCIA',
  subtitle: 'Grand Arts & Cultural Fest 2026',
  academicYear: '2026-2027',
  venue: 'Main Campus, Grand Auditorium & Open Stage',
  eventDates: 'September 15 - 17, 2026',
  primaryAccent: '#0A0A0A',
  heroTitleLine1: 'RUN THE FEST.',
  heroTitleLine2: 'NOT THE SPREADSHEET.',
  heroDescription: 'Complete autonomous control for Meelad Fest, Arts Fest, and student competitions. Instant chest numbering, blind judging panels, real-time leaderboards, and official print cards.',
  announcementText: '',
  isAnnouncementActive: 0,
  featureSubheading: 'ARCHITECTURE & WORKFLOW',
  featureHeading: 'EVERYTHING IN ONE CONTROL CENTER.',
  featureDescription: 'Eliminate chaotic paper forms and conflicting scorecards. From stage roll call to the final championship trophy, Fragancia guarantees spotless accuracy.',
  pipelineHeading: 'FROM REGISTRATION TO VICTORY.',
  pipelineSubtitle: 'Designed for high-speed fest days where volunteers, judges, and stage coordinators work in tandem.',
  portalStatus: 'OPEN',
  portalClosedMessage: 'Participant registrations are temporarily closed by the Fest Directorate.',
  chestNumberPrefix: '',
  maxRegistrationsPerStudent: 20,
  chestPrefixAuto: 0,
  defaultFirstPoints: 10,
  defaultSecondPoints: 7,
  defaultThirdPoints: 5,
  groupFirstPoints: 15,
  groupSecondPoints: 10,
  groupThirdPoints: 7,
  footerText: 'Fragancia Fest Organising Committee • developed by rafidotcom.in',
  copyright: '© 2026 Fragancia. All rights reserved.',
  helpdeskContact: 'Control Room: Stage 1 Helpdesk | Ph: +91 98470 00000',
  signatory1Title: 'Chief Controller / Convener',
  signatory2Title: 'General Secretary / Chairman',
  themeMode: 'dark',
};

export async function ensureDatabaseSeeded(): Promise<void> {
  try {
    const rows = await query<any>('SELECT COUNT(*) as cnt FROM students');
    const count = Number(rows[0]?.cnt || 0);

    if (count > 0) {
      return; // Already seeded
    }

    console.log('[DB Seed] Seeding MySQL database with initial Fragancia Fest production data...');

    await execute('SET FOREIGN_KEY_CHECKS = 0');
    try {
      // 1. Settings
    await execute(
      `INSERT INTO event_settings (
        id, event_name, institute_name, logo_text, subtitle, academic_year, venue, event_dates,
        primary_accent, hero_title_line1, hero_title_line2, hero_description, announcement_text,
        is_announcement_active, feature_subheading, feature_heading, feature_description,
        pipeline_heading, pipeline_subtitle, portal_status, portal_closed_message,
        chest_number_prefix, max_registrations_per_student, chest_prefix_auto,
        default_first_points, default_second_points, default_third_points,
        group_first_points, group_second_points, group_third_points,
        footer_text, copyright, helpdesk_contact, signatory1_title, signatory2_title, theme_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE event_name = VALUES(event_name)`,
      [
        INITIAL_SETTINGS.id,
        INITIAL_SETTINGS.eventName,
        INITIAL_SETTINGS.instituteName,
        INITIAL_SETTINGS.logoText,
        INITIAL_SETTINGS.subtitle,
        INITIAL_SETTINGS.academicYear,
        INITIAL_SETTINGS.venue,
        INITIAL_SETTINGS.eventDates,
        INITIAL_SETTINGS.primaryAccent,
        INITIAL_SETTINGS.heroTitleLine1,
        INITIAL_SETTINGS.heroTitleLine2,
        INITIAL_SETTINGS.heroDescription,
        INITIAL_SETTINGS.announcementText,
        INITIAL_SETTINGS.isAnnouncementActive,
        INITIAL_SETTINGS.featureSubheading,
        INITIAL_SETTINGS.featureHeading,
        INITIAL_SETTINGS.featureDescription,
        INITIAL_SETTINGS.pipelineHeading,
        INITIAL_SETTINGS.pipelineSubtitle,
        INITIAL_SETTINGS.portalStatus,
        INITIAL_SETTINGS.portalClosedMessage,
        INITIAL_SETTINGS.chestNumberPrefix,
        INITIAL_SETTINGS.maxRegistrationsPerStudent,
        INITIAL_SETTINGS.chestPrefixAuto,
        INITIAL_SETTINGS.defaultFirstPoints,
        INITIAL_SETTINGS.defaultSecondPoints,
        INITIAL_SETTINGS.defaultThirdPoints,
        INITIAL_SETTINGS.groupFirstPoints,
        INITIAL_SETTINGS.groupSecondPoints,
        INITIAL_SETTINGS.groupThirdPoints,
        INITIAL_SETTINGS.footerText,
        INITIAL_SETTINGS.copyright,
        INITIAL_SETTINGS.helpdeskContact,
        INITIAL_SETTINGS.signatory1Title,
        INITIAL_SETTINGS.signatory2Title,
        INITIAL_SETTINGS.themeMode,
      ]
    );

    // 2. Profiles (Admin)
    await execute(
      `INSERT IGNORE INTO profiles (id, email, full_name, role)
       VALUES ('profile-admin', 'admin@fragancia.local', 'Fest Administrator', 'ADMIN')`
    );

    // 3. Teams
    for (const t of INITIAL_TEAMS) {
      await execute(
        `INSERT IGNORE INTO teams (id, name, short_code, color, description, captain, vice_captain, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.name, t.shortCode, t.color, t.description, t.captain, t.viceCaptain, t.active]
      );
    }

    // 4. Categories
    for (const c of INITIAL_CATEGORIES) {
      await execute(
        `INSERT IGNORE INTO categories (id, name, min_age, max_age, description, active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.minAge, c.maxAge, c.description || null, c.active ? 1 : 0]
      );
    }

    // 5. Competitions
    for (const comp of INITIAL_COMPETITIONS) {
      const scoringJson = comp.scoringCriteria ? JSON.stringify(comp.scoringCriteria) : null;
      const stageType = comp.stageType || (comp.categoryId?.includes('off') ? 'Off Stage' : 'On Stage');
      await execute(
        `INSERT IGNORE INTO competitions (
          id, name, type, category_id, stage_type, max_participants, time_limit, rules,
          first_place_points, second_place_points, third_place_points, status, stage,
          start_time, scheduled_time, duration_minutes, scoring_criteria, result_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          comp.id,
          comp.name,
          comp.type || 'Single',
          comp.categoryId,
          stageType,
          comp.maxParticipants || 20,
          comp.timeLimit || '7 Mins',
          comp.rules || '',
          comp.firstPlacePoints || 10,
          comp.secondPlacePoints || 7,
          comp.thirdPlacePoints || 5,
          comp.status || 'Upcoming',
          comp.stage || 'Main Stage',
          comp.startTime || '10:00 AM',
          comp.scheduledTime || '10:00 AM',
          comp.durationMinutes || 10,
          scoringJson,
          comp.resultStatus || 'Draft',
        ]
      );
    }

    // 6. Students
    for (const s of INITIAL_STUDENTS) {
      await execute(
        `INSERT IGNORE INTO students (
          id, full_name, admission_no, chest_number, phone, team_id, category_id, gender, role, photo, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.fullName,
          s.admissionNo,
          s.chestNumber,
          s.phone || null,
          s.teamId,
          s.categoryId,
          s.gender || 'Male',
          s.role || 'Member',
          s.photo || null,
          s.status || 'Active',
        ]
      );
    }

    // 7. Registrations
    for (const r of INITIAL_REGISTRATIONS) {
      await execute(
        `INSERT IGNORE INTO registrations (id, competition_id, student_id, code_letter, status)
         VALUES (?, ?, ?, ?, ?)`,
        [r.id, r.competitionId, r.studentId, r.codeLetter || null, r.status || 'Registered']
      );
    }

    // 8. Schedule
    for (const sch of INITIAL_SCHEDULE) {
      await execute(
        `INSERT IGNORE INTO schedule_items (id, title, stage, date, time, status, category, competition_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sch.id, sch.title, sch.stage, sch.date, sch.time, sch.status, sch.category, sch.competitionId || null]
      );
    }

    // 9. Initial Audit Log
    await execute(
      `INSERT IGNORE INTO audit_logs (id, action, details, user_email)
       VALUES ('log-init', 'SYSTEM_INITIALIZED', 'Initial Fest database successfully initialized in MySQL', 'admin@fragancia.local')`
    );

      console.log('[DB Seed] MySQL database successfully seeded with all initial data!');
    } finally {
      await execute('SET FOREIGN_KEY_CHECKS = 1');
    }
  } catch (err) {
    console.error('[DB Seed Error]', err);
  }
}
