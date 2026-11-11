-- 不如见一面 MySQL v1.
-- tracking_event triggers need log_bin_trust_function_creators=1 when the binary log is on.
-- The Compose files set that, and also skip the binary log on this single node.
-- Question keys stay in the questionnaire catalog. Do not add option enum tables.
-- Phase 2 tables are intentionally absent: match_cycle, match_result, blocklist, meetup.

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE school (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  city VARCHAR(32) NOT NULL DEFAULT '北京',
  district VARCHAR(32) NOT NULL DEFAULT '房山',
  enabled TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_school_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE app_user (
  id BIGINT NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL,
  display_name VARCHAR(64) NULL,
  email VARCHAR(255) NULL,
  email_verified_at DATETIME(3) NULL,
  school_id BIGINT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_user_public_id (public_id),
  KEY idx_app_user_email (email),
  CONSTRAINT fk_app_user_school FOREIGN KEY (school_id) REFERENCES school (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_email_otp (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  consumed_at DATETIME(3) NULL,
  ip VARCHAR(45) NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_user_email_otp_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE questionnaire_answer (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  answer_value JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_questionnaire_answer_user_question (user_id, question_id),
  CONSTRAINT fk_questionnaire_answer_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE questionnaire_answer_revision (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  from_value JSON NULL,
  to_value JSON NOT NULL,
  via_back TINYINT NOT NULL,
  source VARCHAR(16) NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_qar_user_question_occurred (user_id, question_id, occurred_at),
  CONSTRAINT fk_qar_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_photo (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  slot TINYINT NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_photo_user_slot (user_id, slot),
  CONSTRAINT fk_user_photo_user FOREIGN KEY (user_id) REFERENCES app_user (id),
  CONSTRAINT chk_user_photo_slot CHECK (slot BETWEEN 0 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE weekly_submission (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  cycle_key VARCHAR(16) NOT NULL,
  submitted_at DATETIME(3) NOT NULL,
  answer_snapshot JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_weekly_submission_user_cycle (user_id, cycle_key),
  CONSTRAINT fk_weekly_submission_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tracking_session (
  id BIGINT NOT NULL AUTO_INCREMENT,
  session_id CHAR(36) NOT NULL,
  visitor_id CHAR(36) NULL,
  user_id BIGINT NULL,
  started_at DATETIME(3) NOT NULL,
  ended_at DATETIME(3) NULL,
  entry_url TEXT NULL,
  referrer VARCHAR(1024) NULL,
  first_ip VARCHAR(45) NULL,
  last_ip VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  device_class VARCHAR(32) NULL,
  consent TINYINT NOT NULL DEFAULT 0,
  landing_screen VARCHAR(64) NULL,
  last_screen_key VARCHAR(64) NULL,
  last_screen_index INT NULL,
  screens_seen_count INT NULL,
  had_cta_click TINYINT NOT NULL DEFAULT 0,
  quiz_started TINYINT NOT NULL DEFAULT 0,
  quiz_submitted TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tracking_session_session_id (session_id),
  KEY idx_tracking_session_user_started (user_id, started_at),
  KEY idx_tracking_session_started (started_at),
  KEY idx_tracking_session_last_screen (last_screen_index),
  CONSTRAINT fk_tracking_session_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tracking_event (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_id CHAR(36) NOT NULL,
  session_id CHAR(36) NOT NULL,
  user_id BIGINT NULL,
  name VARCHAR(64) NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  received_at DATETIME(3) NOT NULL,
  duration_ms INT NULL,
  screen_key VARCHAR(64) NULL,
  screen_index INT NULL,
  question_id VARCHAR(64) NULL,
  option_id VARCHAR(64) NULL,
  props JSON NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tracking_event_event_id (event_id),
  KEY idx_tracking_event_session_occurred (session_id, occurred_at),
  KEY idx_tracking_event_name_occurred (name, occurred_at),
  KEY idx_tracking_event_user_occurred (user_id, occurred_at),
  KEY idx_tracking_event_question_name (question_id, name),
  CONSTRAINT fk_tracking_event_session FOREIGN KEY (session_id) REFERENCES tracking_session (session_id),
  CONSTRAINT fk_tracking_event_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER trg_tracking_event_append_only_update
BEFORE UPDATE ON tracking_event
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tracking_event is append-only';
END;

CREATE TRIGGER trg_tracking_event_append_only_delete
BEFORE DELETE ON tracking_event
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tracking_event is append-only';
END;

-- Codes match apps/api/src/schools/catalog.ts. Fangshan campuses only.
INSERT INTO school (code, name, city, district, enabled, created_at) VALUES
  ('cnu_liangxiang', '首都师范大学（良乡校区）', '北京', '房山', 1, '2026-11-11 00:00:00.000'),
  ('bucm', '北京中医药大学', '北京', '房山', 1, '2026-11-11 00:00:00.000'),
  ('btbu', '北京工商大学（良乡校区）', '北京', '房山', 1, '2026-11-11 00:00:00.000'),
  ('bit_liangxiang', '北京理工大学（良乡校区）', '北京', '房山', 1, '2026-11-11 00:00:00.000'),
  ('ucass', '中国社会科学院大学', '北京', '房山', 1, '2026-11-11 00:00:00.000');
