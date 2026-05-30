-- MySQL schema for Eduvix (PHP backend)
-- Run via phpMyAdmin or MySQL CLI.


-- ==========================
-- Auth / Users
-- ==========================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(50) UNIQUE NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  attendance_target INT DEFAULT 75,
  goals TEXT NULL,
  study_start DATETIME NULL,
  study_end DATETIME NULL,
  avatar_url VARCHAR(255) NULL,
  gender ENUM('male','female','') DEFAULT '',
  class VARCHAR(20) NULL,
  theme_preference ENUM('dark','light') DEFAULT 'dark',
  coins INT DEFAULT 0,
  onboarded BOOLEAN DEFAULT FALSE,
  subscription_plan VARCHAR(50) DEFAULT 'free_trial',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(150) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- App Data (equivalent to Supabase tables)
-- All rows are owned by users.id
-- ==========================

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  color VARCHAR(32) NOT NULL,
  attendance_target INT DEFAULT 75,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_subjects_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);

-- Attendance records
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id VARCHAR(64) NULL, -- Nullable for breaks/non-subject blocks
  block_id VARCHAR(64) NULL, -- Optional link to routine block
  date DATE NOT NULL,
  status ENUM('attended','missed','cancelled') NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_att_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_att_user_date ON attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_att_subject ON attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_att_block ON attendance_records(block_id);

-- Routine blocks
CREATE TABLE IF NOT EXISTS routine_blocks (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  day_of_week INT NOT NULL, -- 0..6 (Sun..Sat) or 1..7 depending on UI, keep as INT
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type ENUM('study','break') NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject_id VARCHAR(64) NULL,
  color VARCHAR(32) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_routine_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_routine_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_routine_user_day ON routine_blocks(user_id, day_of_week);

-- Focus sessions (Pomodoro)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id VARCHAR(64) NULL,
  block_id VARCHAR(64) NULL,
  session_type VARCHAR(64) NOT NULL, -- e.g. 'focus'
  duration_seconds INT NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_focus_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_focus_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_focus_user_started ON focus_sessions(user_id, started_at);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  color VARCHAR(32) NULL,
  icon VARCHAR(64) NULL,
  target_per_week INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habits_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);

-- Habit check-ins
CREATE TABLE IF NOT EXISTS habit_checkins (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  habit_id VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkins_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_checkins_habit
    FOREIGN KEY (habit_id) REFERENCES habits(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkins_habit_date ON habit_checkins(habit_id, date);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  syllabus_progress INT NOT NULL DEFAULT 0,
  notes TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_exams_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exams_user_date ON exams(user_id, exam_date);

-- Exam syllabus items
CREATE TABLE IF NOT EXISTS exam_syllabus_items (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  exam_id VARCHAR(64) NOT NULL,
  chapter VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_syllabus_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_syllabus_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_syllabus_exam ON exam_syllabus_items(exam_id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  subject_id VARCHAR(64) NULL,
  tags JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notes_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at);

-- Practice logs
CREATE TABLE IF NOT EXISTS practice_logs (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id VARCHAR(64) NULL,
  subject_name VARCHAR(200) NOT NULL,
  chapter VARCHAR(255) NOT NULL,
  log_date DATE NOT NULL,
  difficulty VARCHAR(64) NULL,
  time_minutes INT NOT NULL DEFAULT 0,
  attempted INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  wrong INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_practice_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_practice_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_user_date ON practice_logs(user_id, log_date);

-- Revision items
CREATE TABLE IF NOT EXISTS revision_items (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  subject_id VARCHAR(64) NULL,
  subject_name VARCHAR(200) NOT NULL,
  chapter VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  interval_days INT NOT NULL DEFAULT 0,
  last_reviewed_at DATETIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_revision_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_revision_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_revision_user_due ON revision_items(user_id, due_date);

-- Coach messages
CREATE TABLE IF NOT EXISTS coach_messages (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  role VARCHAR(32) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coach_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coach_user_created ON coach_messages(user_id, created_at);
-- XP Transactions (Bonuses, Logins, Penalties)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_xp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id);
