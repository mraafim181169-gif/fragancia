-- ==============================================================================
-- FRAGANCIA ARTS FEST 2026 - MYSQL 8.x DATABASE SCHEMA
-- Hostinger MySQL & phpMyAdmin Direct Import Ready
-- 
-- Compatible with MySQL 8.0+ / 8.4+ / MariaDB 10.5+
-- Storage Engine: InnoDB
-- Default Character Set: utf8mb4
-- Default Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET NAMES utf8mb4;
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ==============================================================================
-- DROP TABLES (Reverse Dependency Order for Clean Re-Import)
-- ==============================================================================
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `schedule_items`;
DROP TABLE IF EXISTS `point_adjustments`;
DROP TABLE IF EXISTS `competition_results`;
DROP TABLE IF EXISTS `marks`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `competitions`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `event_settings`;
DROP TABLE IF EXISTS `profiles`;

-- ==============================================================================
-- 1. PROFILES TABLE (Authentication, Staff, Judges & RBAC)
-- ==============================================================================
CREATE TABLE `profiles` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `role` ENUM('ADMIN', 'JUDGE', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_profiles_email` (`email`),
  KEY `idx_profiles_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. EVENT_SETTINGS TABLE (Fest Metadata, Rules, Points & Portal Config)
-- ==============================================================================
CREATE TABLE `event_settings` (
  `id` VARCHAR(64) NOT NULL,
  `event_name` VARCHAR(255) NOT NULL DEFAULT 'Fragancia Arts Fest 2026',
  `institute_name` VARCHAR(255) NOT NULL DEFAULT 'Fragancia Committee',
  `logo_text` VARCHAR(100) NOT NULL DEFAULT 'FRAGANCIA',
  `subtitle` VARCHAR(255) NOT NULL DEFAULT 'Grand Arts & Cultural Fest 2026',
  `academic_year` VARCHAR(50) DEFAULT '2026-2027',
  `venue` VARCHAR(255) DEFAULT 'Main Campus, Grand Auditorium & Open Stage',
  `event_dates` VARCHAR(100) DEFAULT 'September 15 - 17, 2026',
  `primary_accent` VARCHAR(50) NOT NULL DEFAULT '#0A0A0A',
  `hero_title_line1` VARCHAR(255) DEFAULT 'RUN THE FEST.',
  `hero_title_line2` VARCHAR(255) DEFAULT 'NOT THE SPREADSHEET.',
  `hero_description` TEXT NULL,
  `announcement_text` TEXT NULL,
  `is_announcement_active` TINYINT(1) NOT NULL DEFAULT 0,
  `feature_subheading` VARCHAR(255) DEFAULT 'ARCHITECTURE & WORKFLOW',
  `feature_heading` VARCHAR(255) DEFAULT 'EVERYTHING IN ONE CONTROL CENTER.',
  `feature_description` TEXT NULL,
  `pipeline_heading` VARCHAR(255) DEFAULT 'FROM REGISTRATION TO VICTORY.',
  `pipeline_subtitle` VARCHAR(255) DEFAULT 'Designed for high-speed fest days where volunteers, judges, and stage coordinators work in tandem.',
  `portal_status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `portal_closed_message` TEXT NULL,
  `chest_number_prefix` VARCHAR(50) DEFAULT '',
  `max_registrations_per_student` INT NOT NULL DEFAULT 20,
  `chest_prefix_auto` TINYINT(1) NOT NULL DEFAULT 0,
  `default_first_points` INT NOT NULL DEFAULT 10,
  `default_second_points` INT NOT NULL DEFAULT 7,
  `default_third_points` INT NOT NULL DEFAULT 5,
  `group_first_points` INT NOT NULL DEFAULT 15,
  `group_second_points` INT NOT NULL DEFAULT 10,
  `group_third_points` INT NOT NULL DEFAULT 7,
  `footer_text` VARCHAR(255) NOT NULL DEFAULT 'Fragancia Fest Organising Committee • developed by rafidotcom.in',
  `copyright` VARCHAR(255) NOT NULL DEFAULT '© 2026 Fragancia. All rights reserved.',
  `helpdesk_contact` VARCHAR(255) DEFAULT 'Control Room: Stage 1 Helpdesk | Ph: +91 98470 00000',
  `signatory1_title` VARCHAR(255) DEFAULT 'Chief Controller / Convener',
  `signatory2_title` VARCHAR(255) DEFAULT 'General Secretary / Chairman',
  `theme_mode` ENUM('light', 'dark') NOT NULL DEFAULT 'dark',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TEAMS TABLE (Festival Houses / Sub-groups)
-- ==============================================================================
CREATE TABLE `teams` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `short_code` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) NOT NULL DEFAULT '#0A0A0A',
  `description` TEXT NULL,
  `captain` VARCHAR(255) NULL,
  `vice_captain` VARCHAR(255) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_teams_name` (`name`),
  UNIQUE KEY `uniq_teams_short_code` (`short_code`),
  KEY `idx_teams_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. CATEGORIES TABLE (Age Divisions & Stage Classifications)
-- ==============================================================================
CREATE TABLE `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `min_age` INT NOT NULL DEFAULT 5,
  `max_age` INT NOT NULL DEFAULT 25,
  `max_competitions_per_student` INT NOT NULL DEFAULT 10,
  `description` TEXT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_categories_name` (`name`),
  KEY `idx_categories_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. COMPETITIONS TABLE (All 80+ Festival Events / Programmes)
-- ==============================================================================
CREATE TABLE `competitions` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('Single', 'Group', 'General') NOT NULL DEFAULT 'Single',
  `category_id` VARCHAR(64) NOT NULL,
  `stage_type` ENUM('On Stage', 'Off Stage') NOT NULL DEFAULT 'On Stage',
  `max_participants` INT NOT NULL DEFAULT 20,
  `time_limit` VARCHAR(50) NOT NULL DEFAULT '7 Mins',
  `rules` TEXT NULL,
  `first_place_points` INT NOT NULL DEFAULT 10,
  `second_place_points` INT NOT NULL DEFAULT 7,
  `third_place_points` INT NOT NULL DEFAULT 5,
  `status` ENUM('Upcoming', 'Live', 'Completed') NOT NULL DEFAULT 'Upcoming',
  `stage` VARCHAR(255) DEFAULT 'Main Stage',
  `start_time` VARCHAR(50) DEFAULT '10:00 AM',
  `scheduled_time` VARCHAR(50) DEFAULT '10:00 AM',
  `duration_minutes` INT DEFAULT 10,
  `scoring_criteria` JSON NULL,
  `result_status` ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comp_category` (`category_id`),
  KEY `idx_comp_status` (`status`),
  KEY `idx_comp_stage_type` (`stage_type`),
  KEY `idx_comp_result_status` (`result_status`),
  CONSTRAINT `fk_comp_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. STUDENTS TABLE (Roster, Chest Numbers, Team & Category Assignments)
-- ==============================================================================
CREATE TABLE `students` (
  `id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `admission_no` VARCHAR(100) NOT NULL,
  `chest_number` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `team_id` VARCHAR(64) NOT NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
  `role` ENUM('Leader', 'Sub-Leader', 'Member') NOT NULL DEFAULT 'Member',
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_students_admission_no` (`admission_no`),
  UNIQUE KEY `uniq_students_chest_number` (`chest_number`),
  KEY `idx_students_team` (`team_id`),
  KEY `idx_students_category` (`category_id`),
  KEY `idx_students_status` (`status`),
  CONSTRAINT `fk_students_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_students_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. REGISTRATIONS TABLE (Student Entries & Secret Code Letter Assignments)
-- ==============================================================================
CREATE TABLE `registrations` (
  `id` VARCHAR(64) NOT NULL,
  `competition_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `code_letter` VARCHAR(10) DEFAULT NULL,
  `status` ENUM('Registered', 'Cancelled', 'Waitlisted') NOT NULL DEFAULT 'Registered',
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_reg_comp_student` (`competition_id`, `student_id`),
  KEY `idx_reg_comp` (`competition_id`),
  KEY `idx_reg_student` (`student_id`),
  KEY `idx_reg_status` (`status`),
  KEY `idx_reg_code_letter` (`code_letter`),
  CONSTRAINT `fk_reg_competition` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 8. ATTENDANCE TABLE (Stage Call Sheets & Participant Roll-Call)
-- ==============================================================================
CREATE TABLE `attendance` (
  `id` VARCHAR(64) NOT NULL,
  `competition_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `status` ENUM('Present', 'Absent') NOT NULL DEFAULT 'Present',
  `marked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_att_comp_student` (`competition_id`, `student_id`),
  KEY `idx_att_comp` (`competition_id`),
  KEY `idx_att_student` (`student_id`),
  KEY `idx_att_status` (`status`),
  CONSTRAINT `fk_att_competition` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 9. MARKS TABLE (Blind Judge Scoring, Rubric Breakdowns & Feedback)
-- ==============================================================================
CREATE TABLE `marks` (
  `id` VARCHAR(64) NOT NULL,
  `competition_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `judge_name` VARCHAR(255) NOT NULL,
  `scores` JSON NULL,
  `total_score` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `grade` VARCHAR(20) DEFAULT NULL,
  `max_score` DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  `feedback` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_marks_comp_student_judge` (`competition_id`, `student_id`, `judge_name`),
  KEY `idx_marks_comp` (`competition_id`),
  KEY `idx_marks_student` (`student_id`),
  KEY `idx_marks_judge` (`judge_name`),
  CONSTRAINT `fk_marks_competition` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_marks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 10. COMPETITION_RESULTS TABLE (Draft & Published Results / Rankings)
-- ==============================================================================
CREATE TABLE `competition_results` (
  `id` VARCHAR(64) NOT NULL,
  `competition_id` VARCHAR(64) NOT NULL,
  `rankings` JSON NOT NULL,
  `status` ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_results_comp` (`competition_id`),
  KEY `idx_results_status` (`status`),
  CONSTRAINT `fk_results_competition` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 11. POINT_ADJUSTMENTS TABLE (Discretionary Bonus & Penalty Points)
-- ==============================================================================
CREATE TABLE `point_adjustments` (
  `id` VARCHAR(64) NOT NULL,
  `team_id` VARCHAR(64) NOT NULL,
  `points` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'admin@fragancia.local',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adj_team` (`team_id`),
  KEY `idx_adj_created_at` (`created_at`),
  CONSTRAINT `fk_adj_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 12. SCHEDULE_ITEMS TABLE (Fest Timeline, Venues & Programme Sequencing)
-- ==============================================================================
CREATE TABLE `schedule_items` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `stage` VARCHAR(255) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `status` ENUM('Upcoming', 'Ongoing', 'Completed') NOT NULL DEFAULT 'Upcoming',
  `category` VARCHAR(100) NOT NULL,
  `competition_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sch_comp` (`competition_id`),
  KEY `idx_sch_stage` (`stage`),
  KEY `idx_sch_status` (`status`),
  CONSTRAINT `fk_sch_comp` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 13. AUDIT_LOGS TABLE (System Operations, Timestamped Audit Trail)
-- ==============================================================================
CREATE TABLE `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_timestamp` (`timestamp`),
  KEY `idx_logs_user` (`user_email`),
  KEY `idx_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- RESTORE ENVIRONMENT SETTINGS
-- ==============================================================================
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET SQL_MODE=@OLD_SQL_MODE;
