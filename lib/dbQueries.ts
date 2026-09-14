import { query, execute, isDbConfigured } from '@/lib/db';
import {
  Student,
  Team,
  Category,
  Competition,
  Registration,
  AttendanceRecord,
  JudgeMark,
  CompetitionResult,
  PointAdjustment,
  ScheduleItem,
  AuditLog,
  EventSettings,
  Profile,
  calculateGradeFromScore,
} from '@/types/fest';

// ==========================================
// 1. EVENT SETTINGS
// ==========================================
export async function getSettingsFromDb(): Promise<EventSettings | null> {
  const rows = await query<any>('SELECT * FROM event_settings LIMIT 1');
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    eventName: r.event_name,
    instituteName: r.institute_name,
    logoText: r.logo_text,
    subtitle: r.subtitle,
    academicYear: r.academic_year,
    venue: r.venue,
    eventDates: r.event_dates,
    primaryAccent: r.primary_accent,
    heroTitleLine1: r.hero_title_line1,
    heroTitleLine2: r.hero_title_line2,
    heroDescription: r.hero_description,
    announcementText: r.announcement_text || '',
    isAnnouncementActive: Boolean(r.is_announcement_active),
    featureSubheading: r.feature_subheading,
    featureHeading: r.feature_heading,
    featureDescription: r.feature_description,
    pipelineHeading: r.pipeline_heading,
    pipelineSubtitle: r.pipeline_subtitle,
    portalStatus: r.portal_status,
    portalClosedMessage: r.portal_closed_message,
    chestNumberPrefix: r.chest_number_prefix,
    maxRegistrationsPerStudent: r.max_registrations_per_student,
    chestPrefixAuto: Boolean(r.chest_prefix_auto),
    defaultFirstPoints: r.default_first_points,
    defaultSecondPoints: r.default_second_points,
    defaultThirdPoints: r.default_third_points,
    groupFirstPoints: r.group_first_points,
    groupSecondPoints: r.group_second_points,
    groupThirdPoints: r.group_third_points,
    footerText: r.footer_text,
    copyright: r.copyright,
    helpdeskContact: r.helpdesk_contact,
    signatory1Title: r.signatory1_title,
    signatory2Title: r.signatory2_title,
    themeMode: r.theme_mode || 'dark',
  };
}

export async function updateSettingsInDb(s: Partial<EventSettings>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  const map: Record<string, string> = {
    eventName: 'event_name',
    instituteName: 'institute_name',
    logoText: 'logo_text',
    subtitle: 'subtitle',
    academicYear: 'academic_year',
    venue: 'venue',
    eventDates: 'event_dates',
    primaryAccent: 'primary_accent',
    heroTitleLine1: 'hero_title_line1',
    heroTitleLine2: 'hero_title_line2',
    heroDescription: 'hero_description',
    announcementText: 'announcement_text',
    isAnnouncementActive: 'is_announcement_active',
    featureSubheading: 'feature_subheading',
    featureHeading: 'feature_heading',
    featureDescription: 'feature_description',
    pipelineHeading: 'pipeline_heading',
    pipelineSubtitle: 'pipeline_subtitle',
    portalStatus: 'portal_status',
    portalClosedMessage: 'portal_closed_message',
    chestNumberPrefix: 'chest_number_prefix',
    maxRegistrationsPerStudent: 'max_registrations_per_student',
    chestPrefixAuto: 'chest_prefix_auto',
    defaultFirstPoints: 'default_first_points',
    defaultSecondPoints: 'default_second_points',
    defaultThirdPoints: 'default_third_points',
    groupFirstPoints: 'group_first_points',
    groupSecondPoints: 'group_second_points',
    groupThirdPoints: 'group_third_points',
    footerText: 'footer_text',
    copyright: 'copyright',
    helpdeskContact: 'helpdesk_contact',
    signatory1Title: 'signatory1_title',
    signatory2Title: 'signatory2_title',
    themeMode: 'theme_mode',
  };

  for (const [key, col] of Object.entries(map)) {
    if ((s as any)[key] !== undefined) {
      fields.push(`\`${col}\` = ?`);
      let val = (s as any)[key];
      if (typeof val === 'boolean') val = val ? 1 : 0;
      params.push(val);
    }
  }

  if (fields.length > 0) {
    const sql = `UPDATE event_settings SET ${fields.join(', ')} LIMIT 1`;
    await execute(sql, params);
  }
}

// ==========================================
// 2. TEAMS
// ==========================================
export async function getTeamsFromDb(): Promise<Team[]> {
  const rows = await query<any>(`
    SELECT t.*, 
      (SELECT COUNT(*) FROM students s WHERE s.team_id = t.id) as student_count
    FROM teams t 
    ORDER BY t.name ASC
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    shortCode: r.short_code,
    color: r.color,
    description: r.description || '',
    captain: r.captain || '',
    viceCaptain: r.vice_captain || '',
    active: Boolean(r.active),
    studentCount: Number(r.student_count || 0),
    points: 0,
    onStagePoints: 0,
    offStagePoints: 0,
    goldCount: 0,
    silverCount: 0,
    bronzeCount: 0,
    rank: 1,
  }));
}

export async function createTeamInDb(team: Partial<Team> & { id: string; name: string; shortCode: string }): Promise<void> {
  const sql = `
    INSERT INTO teams (id, name, short_code, color, description, captain, vice_captain, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await execute(sql, [
    team.id,
    team.name,
    team.shortCode,
    team.color || '#0A0A0A',
    team.description || null,
    team.captain || null,
    team.viceCaptain || null,
    team.active !== false ? 1 : 0,
  ]);
}

export async function updateTeamInDb(id: string, updates: Partial<Team>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.name !== undefined) { fields.push('`name` = ?'); params.push(updates.name); }
  if (updates.shortCode !== undefined) { fields.push('`short_code` = ?'); params.push(updates.shortCode); }
  if (updates.color !== undefined) { fields.push('`color` = ?'); params.push(updates.color); }
  if (updates.description !== undefined) { fields.push('`description` = ?'); params.push(updates.description); }
  if (updates.captain !== undefined) { fields.push('`captain` = ?'); params.push(updates.captain); }
  if (updates.viceCaptain !== undefined) { fields.push('`vice_captain` = ?'); params.push(updates.viceCaptain); }
  if (updates.active !== undefined) { fields.push('`active` = ?'); params.push(updates.active ? 1 : 0); }

  if (fields.length > 0) {
    params.push(id);
    await execute(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`, params);
  }
}

export async function deleteTeamInDb(id: string): Promise<void> {
  await execute('DELETE FROM teams WHERE id = ?', [id]);
}

// ==========================================
// 3. CATEGORIES
// ==========================================
export async function getCategoriesFromDb(): Promise<Category[]> {
  const rows = await query<any>(`
    SELECT c.*,
      (SELECT COUNT(*) FROM students s WHERE s.category_id = c.id) as student_count
    FROM categories c
    ORDER BY c.name ASC
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    minAge: Number(r.min_age || 5),
    maxAge: Number(r.max_age || 25),
    description: r.description || '',
    active: Boolean(r.active),
    studentCount: Number(r.student_count || 0),
  }));
}

export async function createCategoryInDb(cat: Partial<Category> & { id: string; name: string }): Promise<void> {
  const sql = `
    INSERT INTO categories (id, name, min_age, max_age, description, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await execute(sql, [
    cat.id,
    cat.name,
    cat.minAge || 5,
    cat.maxAge || 25,
    cat.description || null,
    cat.active !== false ? 1 : 0,
  ]);
}

export async function updateCategoryInDb(id: string, updates: Partial<Category>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.name !== undefined) { fields.push('`name` = ?'); params.push(updates.name); }
  if (updates.minAge !== undefined) { fields.push('`min_age` = ?'); params.push(updates.minAge); }
  if (updates.maxAge !== undefined) { fields.push('`max_age` = ?'); params.push(updates.maxAge); }
  if (updates.description !== undefined) { fields.push('`description` = ?'); params.push(updates.description); }
  if (updates.active !== undefined) { fields.push('`active` = ?'); params.push(updates.active ? 1 : 0); }

  if (fields.length > 0) {
    params.push(id);
    await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);
  }
}

export async function deleteCategoryInDb(id: string): Promise<void> {
  await execute('DELETE FROM categories WHERE id = ?', [id]);
}

// ==========================================
// 4. COMPETITIONS
// ==========================================
export async function getCompetitionsFromDb(): Promise<Competition[]> {
  const rows = await query<any>(`
    SELECT comp.*, c.name as category_name
    FROM competitions comp
    LEFT JOIN categories c ON comp.category_id = c.id
    ORDER BY comp.name ASC
  `);

  return rows.map((r) => {
    let scoringCriteria = r.scoring_criteria;
    if (typeof scoringCriteria === 'string') {
      try { scoringCriteria = JSON.parse(scoringCriteria); } catch {}
    }

    return {
      id: r.id,
      name: r.name,
      type: r.type,
      categoryId: r.category_id,
      categoryName: r.category_name || '',
      stageType: r.stage_type,
      maxParticipants: Number(r.max_participants || 20),
      timeLimit: r.time_limit,
      rules: r.rules || '',
      firstPlacePoints: Number(r.first_place_points || 10),
      secondPlacePoints: Number(r.second_place_points || 7),
      thirdPlacePoints: Number(r.third_place_points || 5),
      status: r.status,
      stage: r.stage || '',
      startTime: r.start_time || '10:00 AM',
      scheduledTime: r.scheduled_time || r.start_time || '10:00 AM',
      durationMinutes: Number(r.duration_minutes || 10),
      scoringCriteria: scoringCriteria || [],
      resultStatus: r.result_status || 'Draft',
      publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
    };
  });
}

export async function createCompetitionInDb(comp: Competition): Promise<void> {
  const sql = `
    INSERT INTO competitions (
      id, name, type, category_id, stage_type, max_participants, time_limit, rules,
      first_place_points, second_place_points, third_place_points, status, stage,
      start_time, scheduled_time, duration_minutes, scoring_criteria, result_status, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await execute(sql, [
    comp.id,
    comp.name,
    comp.type || 'Single',
    comp.categoryId,
    comp.stageType || 'On Stage',
    comp.maxParticipants || 20,
    comp.timeLimit || '7 Mins',
    comp.rules || null,
    comp.firstPlacePoints ?? 10,
    comp.secondPlacePoints ?? 7,
    comp.thirdPlacePoints ?? 5,
    comp.status || 'Upcoming',
    comp.stage || '',
    comp.startTime || '10:00 AM',
    comp.scheduledTime || comp.startTime || '10:00 AM',
    comp.durationMinutes || 10,
    comp.scoringCriteria ? JSON.stringify(comp.scoringCriteria) : null,
    comp.resultStatus || 'Draft',
    comp.publishedAt ? new Date(comp.publishedAt) : null,
  ]);
}

export async function updateCompetitionInDb(id: string, updates: Partial<Competition>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  const map: Record<string, string> = {
    name: 'name',
    type: 'type',
    categoryId: 'category_id',
    stageType: 'stage_type',
    maxParticipants: 'max_participants',
    timeLimit: 'time_limit',
    rules: 'rules',
    firstPlacePoints: 'first_place_points',
    secondPlacePoints: 'second_place_points',
    thirdPlacePoints: 'third_place_points',
    status: 'status',
    stage: 'stage',
    startTime: 'start_time',
    scheduledTime: 'scheduled_time',
    durationMinutes: 'duration_minutes',
    resultStatus: 'result_status',
  };

  for (const [key, col] of Object.entries(map)) {
    if ((updates as any)[key] !== undefined) {
      fields.push(`\`${col}\` = ?`);
      params.push((updates as any)[key]);
    }
  }

  if (updates.scoringCriteria !== undefined) {
    fields.push('`scoring_criteria` = ?');
    params.push(JSON.stringify(updates.scoringCriteria));
  }

  if (updates.publishedAt !== undefined) {
    fields.push('`published_at` = ?');
    params.push(updates.publishedAt ? new Date(updates.publishedAt) : null);
  }

  if (fields.length > 0) {
    params.push(id);
    await execute(`UPDATE competitions SET ${fields.join(', ')} WHERE id = ?`, params);
  }
}

export async function deleteCompetitionInDb(id: string): Promise<void> {
  await execute('DELETE FROM competitions WHERE id = ?', [id]);
}

// ==========================================
// 5. STUDENTS
// ==========================================
export async function getStudentsFromDb(filters?: { teamId?: string; categoryId?: string }): Promise<Student[]> {
  let sql = `
    SELECT s.*, t.name as team_name, t.short_code as team_code, c.name as category_name
    FROM students s
    LEFT JOIN teams t ON s.team_id = t.id
    LEFT JOIN categories c ON s.category_id = c.id
  `;
  const where: string[] = [];
  const params: any[] = [];

  if (filters?.teamId) {
    where.push('s.team_id = ?');
    params.push(filters.teamId);
  }
  if (filters?.categoryId) {
    where.push('s.category_id = ?');
    params.push(filters.categoryId);
  }

  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  sql += ' ORDER BY s.chest_number ASC';

  const rows = await query<any>(sql, params);

  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    admissionNo: r.admission_no,
    chestNumber: r.chest_number,
    phone: r.phone || '',
    teamId: r.team_id,
    teamName: r.team_name || '',
    teamCode: r.team_code || '',
    categoryId: r.category_id,
    categoryName: r.category_name || '',
    gender: r.gender,
    role: r.role,
    photo: r.photo || undefined,
    status: r.status,
    totalPoints: 0,
    onStagePoints: 0,
    offStagePoints: 0,
    rank: 1,
  }));
}

export async function createStudentInDb(s: Omit<Student, 'totalPoints' | 'rank'>): Promise<void> {
  const sql = `
    INSERT INTO students (
      id, full_name, admission_no, chest_number, phone, team_id, category_id,
      gender, role, photo, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await execute(sql, [
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
  ]);
}

export async function updateStudentInDb(id: string, updates: Partial<Student>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.fullName !== undefined) { fields.push('`full_name` = ?'); params.push(updates.fullName); }
  if (updates.admissionNo !== undefined) { fields.push('`admission_no` = ?'); params.push(updates.admissionNo); }
  if (updates.chestNumber !== undefined) { fields.push('`chest_number` = ?'); params.push(updates.chestNumber); }
  if (updates.phone !== undefined) { fields.push('`phone` = ?'); params.push(updates.phone); }
  if (updates.teamId !== undefined) { fields.push('`team_id` = ?'); params.push(updates.teamId); }
  if (updates.categoryId !== undefined) { fields.push('`category_id` = ?'); params.push(updates.categoryId); }
  if (updates.gender !== undefined) { fields.push('`gender` = ?'); params.push(updates.gender); }
  if (updates.role !== undefined) { fields.push('`role` = ?'); params.push(updates.role); }
  if (updates.photo !== undefined) { fields.push('`photo` = ?'); params.push(updates.photo); }
  if (updates.status !== undefined) { fields.push('`status` = ?'); params.push(updates.status); }

  if (fields.length > 0) {
    params.push(id);
    await execute(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, params);
  }
}

export async function deleteStudentInDb(id: string): Promise<void> {
  await execute('DELETE FROM students WHERE id = ?', [id]);
}

// ==========================================
// 6. REGISTRATIONS
// ==========================================
export async function getRegistrationsFromDb(filters?: { competitionId?: string; studentId?: string }): Promise<Registration[]> {
  let sql = `
    SELECT r.*, 
      c.name as competition_name,
      s.full_name as student_name,
      s.chest_number as student_chest,
      s.team_id as student_team_id,
      t.name as student_team_name,
      s.category_id as student_category_id
    FROM registrations r
    JOIN competitions c ON r.competition_id = c.id
    JOIN students s ON r.student_id = s.id
    LEFT JOIN teams t ON s.team_id = t.id
  `;
  const where: string[] = [];
  const params: any[] = [];

  if (filters?.competitionId) {
    where.push('r.competition_id = ?');
    params.push(filters.competitionId);
  }
  if (filters?.studentId) {
    where.push('r.student_id = ?');
    params.push(filters.studentId);
  }

  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  sql += ' ORDER BY r.registered_at ASC';

  const rows = await query<any>(sql, params);

  return rows.map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    competitionName: r.competition_name,
    studentId: r.student_id,
    studentName: r.student_name,
    chestNumber: r.student_chest,
    codeLetter: r.code_letter || '',
    teamId: r.student_team_id,
    teamName: r.student_team_name || '',
    categoryId: r.student_category_id,
    status: r.status,
    registeredAt: new Date(r.registered_at).toISOString(),
  }));
}

export async function createRegistrationInDb(r: Registration): Promise<void> {
  const sql = `
    INSERT INTO registrations (id, competition_id, student_id, code_letter, status, registered_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE code_letter = VALUES(code_letter), status = VALUES(status)
  `;
  await execute(sql, [
    r.id,
    r.competitionId,
    r.studentId,
    r.codeLetter || null,
    r.status || 'Registered',
    r.registeredAt ? new Date(r.registeredAt) : new Date(),
  ]);
}

export async function updateRegistrationCodeLetterInDb(id: string, codeLetter: string): Promise<void> {
  await execute('UPDATE registrations SET code_letter = ? WHERE id = ?', [codeLetter, id]);
}

export async function updateRegistrationStatusInDb(id: string, status: 'Registered' | 'Cancelled' | 'Waitlisted'): Promise<void> {
  await execute('UPDATE registrations SET status = ? WHERE id = ?', [status, id]);
}

export async function deleteRegistrationInDb(id: string): Promise<void> {
  await execute('DELETE FROM registrations WHERE id = ?', [id]);
}

// ==========================================
// 7. ATTENDANCE
// ==========================================
export async function getAttendanceFromDb(competitionId?: string): Promise<AttendanceRecord[]> {
  let sql = `
    SELECT a.*, s.chest_number
    FROM attendance a
    JOIN students s ON a.student_id = s.id
  `;
  const params: any[] = [];
  if (competitionId) {
    sql += ' WHERE a.competition_id = ?';
    params.push(competitionId);
  }

  const rows = await query<any>(sql, params);
  return rows.map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    studentId: r.student_id,
    chestNumber: r.chest_number,
    status: r.status,
    markedAt: new Date(r.marked_at).toISOString(),
  }));
}

export async function markAttendanceInDb(record: { id: string; competitionId: string; studentId: string; status: 'Present' | 'Absent' }): Promise<void> {
  const sql = `
    INSERT INTO attendance (id, competition_id, student_id, status, marked_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE status = VALUES(status), marked_at = NOW()
  `;
  await execute(sql, [record.id, record.competitionId, record.studentId, record.status]);
}

// ==========================================
// 8. JUDGE MARKS
// ==========================================
export async function getMarksFromDb(competitionId?: string): Promise<JudgeMark[]> {
  let sql = `
    SELECT m.*, s.chest_number, r.code_letter
    FROM marks m
    JOIN students s ON m.student_id = s.id
    LEFT JOIN registrations r ON m.competition_id = r.competition_id AND m.student_id = r.student_id
  `;
  const params: any[] = [];
  if (competitionId) {
    sql += ' WHERE m.competition_id = ?';
    params.push(competitionId);
  }

  const rows = await query<any>(sql, params);

  return rows.map((r) => {
    let scores = r.scores;
    if (typeof scores === 'string') {
      try { scores = JSON.parse(scores); } catch {}
    }

    return {
      id: r.id,
      competitionId: r.competition_id,
      studentId: r.student_id,
      chestNumber: r.chest_number,
      codeLetter: r.code_letter || '',
      judgeName: r.judge_name,
      scores: scores || {},
      totalScore: Number(r.total_score || 0),
      grade: r.grade,
      maxScore: Number(r.max_score || 100),
      feedback: r.feedback || '',
      submittedAt: new Date(r.submitted_at).toISOString(),
    };
  });
}

export async function saveJudgeMarkInDb(mark: JudgeMark): Promise<void> {
  const sql = `
    INSERT INTO marks (id, competition_id, student_id, judge_name, scores, total_score, grade, max_score, feedback, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      scores = VALUES(scores),
      total_score = VALUES(total_score),
      grade = VALUES(grade),
      max_score = VALUES(max_score),
      feedback = VALUES(feedback),
      submitted_at = NOW()
  `;
  await execute(sql, [
    mark.id,
    mark.competitionId,
    mark.studentId,
    mark.judgeName,
    JSON.stringify(mark.scores || {}),
    mark.totalScore,
    mark.grade || calculateGradeFromScore(mark.totalScore, mark.maxScore || 100),
    mark.maxScore || 100,
    mark.feedback || null,
  ]);
}

export async function deleteJudgeMarkInDb(id: string): Promise<void> {
  await execute('DELETE FROM marks WHERE id = ?', [id]);
}

// ==========================================
// 9. COMPETITION RESULTS
// ==========================================
export async function getCompetitionResultsFromDb(): Promise<CompetitionResult[]> {
  const rows = await query<any>(`
    SELECT res.*, comp.name as competition_name
    FROM competition_results res
    JOIN competitions comp ON res.competition_id = comp.id
  `);

  return rows.map((r) => {
    let rankings = r.rankings;
    if (typeof rankings === 'string') {
      try { rankings = JSON.parse(rankings); } catch {}
    }

    return {
      id: r.id,
      competitionId: r.competition_id,
      competitionName: r.competition_name,
      rankings: rankings || [],
      status: r.status,
      publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
    };
  });
}

export async function saveCompetitionResultInDb(res: CompetitionResult): Promise<void> {
  const sql = `
    INSERT INTO competition_results (id, competition_id, rankings, status, published_at)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rankings = VALUES(rankings),
      status = VALUES(status),
      published_at = VALUES(published_at)
  `;
  await execute(sql, [
    res.id,
    res.competitionId,
    JSON.stringify(res.rankings || []),
    res.status,
    res.publishedAt ? new Date(res.publishedAt) : (res.status === 'Published' ? new Date() : null),
  ]);

  if (res.status === 'Published') {
    await execute(
      'UPDATE competitions SET status = "Completed", result_status = "Published", published_at = NOW() WHERE id = ?',
      [res.competitionId]
    );
  }
}

export async function unpublishCompetitionResultInDb(competitionId: string): Promise<void> {
  await execute(
    'UPDATE competition_results SET status = "Draft", published_at = NULL WHERE competition_id = ?',
    [competitionId]
  );
  await execute(
    'UPDATE competitions SET result_status = "Draft" WHERE id = ?',
    [competitionId]
  );
}

// ==========================================
// 10. POINT ADJUSTMENTS
// ==========================================
export async function getPointAdjustmentsFromDb(): Promise<PointAdjustment[]> {
  const rows = await query<any>(`
    SELECT pa.*, t.name as team_name
    FROM point_adjustments pa
    JOIN teams t ON pa.team_id = t.id
    ORDER BY pa.created_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    teamId: r.team_id,
    teamName: r.team_name,
    points: Number(r.points),
    reason: r.reason,
    createdAt: new Date(r.created_at).toISOString(),
    createdBy: r.created_by,
  }));
}

export async function createPointAdjustmentInDb(adj: PointAdjustment): Promise<void> {
  const sql = `
    INSERT INTO point_adjustments (id, team_id, points, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  await execute(sql, [
    adj.id,
    adj.teamId,
    adj.points,
    adj.reason,
    adj.createdBy || 'admin@fragancia.local',
  ]);
}

export async function deletePointAdjustmentInDb(id: string): Promise<void> {
  await execute('DELETE FROM point_adjustments WHERE id = ?', [id]);
}

// ==========================================
// 11. SCHEDULE ITEMS
// ==========================================
export async function getScheduleFromDb(): Promise<ScheduleItem[]> {
  const rows = await query<any>('SELECT * FROM schedule_items ORDER BY date ASC, time ASC');
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    stage: r.stage,
    date: r.date,
    time: r.time,
    status: r.status,
    category: r.category,
    competitionId: r.competition_id || undefined,
  }));
}

export async function createScheduleItemInDb(item: ScheduleItem): Promise<void> {
  const sql = `
    INSERT INTO schedule_items (id, title, stage, date, time, status, category, competition_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await execute(sql, [
    item.id,
    item.title,
    item.stage,
    item.date,
    item.time,
    item.status || 'Upcoming',
    item.category,
    item.competitionId || null,
  ]);
}

export async function updateScheduleItemInDb(id: string, updates: Partial<ScheduleItem>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.title !== undefined) { fields.push('`title` = ?'); params.push(updates.title); }
  if (updates.stage !== undefined) { fields.push('`stage` = ?'); params.push(updates.stage); }
  if (updates.date !== undefined) { fields.push('`date` = ?'); params.push(updates.date); }
  if (updates.time !== undefined) { fields.push('`time` = ?'); params.push(updates.time); }
  if (updates.status !== undefined) { fields.push('`status` = ?'); params.push(updates.status); }
  if (updates.category !== undefined) { fields.push('`category` = ?'); params.push(updates.category); }
  if (updates.competitionId !== undefined) { fields.push('`competition_id` = ?'); params.push(updates.competitionId || null); }

  if (fields.length > 0) {
    params.push(id);
    await execute(`UPDATE schedule_items SET ${fields.join(', ')} WHERE id = ?`, params);
  }
}

export async function deleteScheduleItemInDb(id: string): Promise<void> {
  await execute('DELETE FROM schedule_items WHERE id = ?', [id]);
}

// ==========================================
// 12. AUDIT LOGS
// ==========================================
export async function getAuditLogsFromDb(limit = 100): Promise<AuditLog[]> {
  const rows = await query<any>('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    details: r.details,
    user: r.user_email,
    timestamp: new Date(r.timestamp).toISOString(),
  }));
}

export async function createAuditLogInDb(log: { id: string; action: string; details: string; user?: string }): Promise<void> {
  const sql = `
    INSERT INTO audit_logs (id, action, details, user_email, timestamp)
    VALUES (?, ?, ?, ?, NOW())
  `;
  await execute(sql, [
    log.id,
    log.action,
    log.details,
    log.user || 'admin@fragancia.local',
  ]);
}

// ==========================================
// 13. PROFILES
// ==========================================
export async function getProfilesFromDb(): Promise<Profile[]> {
  const rows = await query<any>('SELECT id, name, email, role, created_at FROM profiles ORDER BY name ASC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

// ==========================================
// 14. LIVE SCOREBOARD CALCULATION DIRECTLY FROM MYSQL
// ==========================================
export async function getScoreboardDataFromDb() {
  const teams = await getTeamsFromDb();
  const students = await getStudentsFromDb();
  const competitions = await getCompetitionsFromDb();
  const results = await getCompetitionResultsFromDb();
  const adjustments = await getPointAdjustmentsFromDb();

  // Map competitions by ID
  const compMap = new Map<string, Competition>();
  competitions.forEach((c) => compMap.set(c.id, c));

  // Team accumulator
  const teamStats: Record<string, { points: number; onStagePoints: number; offStagePoints: number; gold: number; silver: number; bronze: number }> = {};
  teams.forEach((t) => {
    teamStats[t.id] = { points: 0, onStagePoints: 0, offStagePoints: 0, gold: 0, silver: 0, bronze: 0 };
  });

  // Student accumulator
  const studentPointsMap: Record<string, { total: number; onStage: number; offStage: number }> = {};
  students.forEach((s) => {
    studentPointsMap[s.id] = { total: 0, onStage: 0, offStage: 0 };
  });

  // Tally published results
  results.filter((r) => r.status === 'Published').forEach((res) => {
    const comp = compMap.get(res.competitionId);
    const isOffStage = comp?.stageType === 'Off Stage' || comp?.categoryName?.toLowerCase().includes('off stage');
    const stageType = isOffStage ? 'Off Stage' : 'On Stage';

    res.rankings.forEach((rnk) => {
      if (teamStats[rnk.teamId]) {
        teamStats[rnk.teamId].points += rnk.pointsAwarded;
        if (stageType === 'On Stage') {
          teamStats[rnk.teamId].onStagePoints += rnk.pointsAwarded;
        } else {
          teamStats[rnk.teamId].offStagePoints += rnk.pointsAwarded;
        }

        if (rnk.rank === 1) teamStats[rnk.teamId].gold += 1;
        else if (rnk.rank === 2) teamStats[rnk.teamId].silver += 1;
        else if (rnk.rank === 3) teamStats[rnk.teamId].bronze += 1;
      }

      if (studentPointsMap[rnk.studentId]) {
        studentPointsMap[rnk.studentId].total += rnk.pointsAwarded;
        if (stageType === 'On Stage') {
          studentPointsMap[rnk.studentId].onStage += rnk.pointsAwarded;
        } else {
          studentPointsMap[rnk.studentId].offStage += rnk.pointsAwarded;
        }
      }
    });
  });

  // Tally bonus / minus adjustments
  adjustments.forEach((adj) => {
    if (teamStats[adj.teamId]) {
      teamStats[adj.teamId].points += adj.points;
    }
  });

  // Build ranked teams
  const finalTeams = teams.map((t) => {
    const stats = teamStats[t.id] || { points: 0, onStagePoints: 0, offStagePoints: 0, gold: 0, silver: 0, bronze: 0 };
    return {
      ...t,
      points: Math.max(0, stats.points),
      onStagePoints: Math.max(0, stats.onStagePoints),
      offStagePoints: Math.max(0, stats.offStagePoints),
      goldCount: stats.gold,
      silverCount: stats.silver,
      bronzeCount: stats.bronze,
    };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
    return b.silverCount - a.silverCount;
  }).map((t, idx) => ({ ...t, rank: idx + 1 }));

  // Build ranked students
  const finalStudents = students.map((s) => {
    const pts = studentPointsMap[s.id] || { total: 0, onStage: 0, offStage: 0 };
    return {
      ...s,
      totalPoints: pts.total,
      onStagePoints: pts.onStage,
      offStagePoints: pts.offStage,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  return {
    teams: finalTeams,
    students: finalStudents,
    topStudents: finalStudents.slice(0, 10),
    totalCompetitions: competitions.length,
    completedCompetitions: competitions.filter((c) => c.status === 'Completed' || c.resultStatus === 'Published').length,
    lastUpdated: new Date().toISOString(),
  };
}

// ==========================================
// 15. FULL DATA SYNC FOR CLIENT STORE
// ==========================================
export async function getFullFestDataFromDb() {
  const [
    settings,
    teams,
    categories,
    competitions,
    students,
    registrations,
    attendance,
    marks,
    results,
    pointAdjustments,
    schedule,
    auditLogs,
  ] = await Promise.all([
    getSettingsFromDb(),
    getTeamsFromDb(),
    getCategoriesFromDb(),
    getCompetitionsFromDb(),
    getStudentsFromDb(),
    getRegistrationsFromDb(),
    getAttendanceFromDb(),
    getMarksFromDb(),
    getCompetitionResultsFromDb(),
    getPointAdjustmentsFromDb(),
    getScheduleFromDb(),
    getAuditLogsFromDb(),
  ]);

  return {
    settings,
    teams,
    categories,
    competitions,
    students,
    registrations,
    attendance,
    marks,
    results,
    pointAdjustments,
    schedule,
    auditLogs,
  };
}
