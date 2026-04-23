import connectDb from './connectDb.js'

class InitializeTables {
  async init() {
    let db
    let transaction = false
    try{
      db = await connectDb()
      await db.exec('PRAGMA foreign_keys = ON')
      await db.exec('BEGIN')
      transaction = true
      await db.exec(this.userTable())
      await db.exec(this.assignmentTable())
      await db.exec(this.quizQuestionsTable())
      await db.exec(this.quizSubmissionsTable())
      await db.exec(this.codingPracticeTable())
      await db.exec(this.codeSubmissionsTable())
      await db.exec(this.dailyScoresTable())
      await db.exec(this.index())
      await db.exec('COMMIT')
      transaction = false
    } catch (err) {
      if (db && transaction) await db.exec('ROLLBACK')
      throw err
    }
  }

  userTable() {
    return `
    CREATE TABLE IF NOT EXISTS students (
    student_id    TEXT PRIMARY KEY,
    name          TEXT          NOT NULL                     CHECK(length(name) <= 200),
    email         TEXT          NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,
    avatar        TEXT,
    bio           TEXT          CHECK(length(bio) <= 500),
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
    );`
  }

  assignmentTable() {
    return `
    CREATE TABLE IF NOT EXISTS assignments (
    assignment_id TEXT PRIMARY KEY,
    title         TEXT         NOT NULL CHECK(length(title) <= 200),
    date          DATE         NOT NULL,
    type          TEXT         NOT NULL CHECK(type IN ('quiz', 'coding', 'both')),
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
    );`
  }
  
  quizQuestionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS quiz_questions (
    question_id    TEXT PRIMARY KEY,
    assignment_id  TEXT NOT NULL,
    question_text  TEXT    NOT NULL,
    option_a       TEXT    NOT NULL,
    option_b       TEXT    NOT NULL,
    option_c       TEXT    NOT NULL,
    option_d       TEXT    NOT NULL,
    correct_option TEXT    NOT NULL CHECK(correct_option IN ('a','b','c','d')),
    explanation    TEXT,
    points         INTEGER DEFAULT 10         CHECK(points >= 0),
    order_num      INTEGER DEFAULT 1,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
    );`
  }

  quizSubmissionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS quiz_submissions (
    submission_id   TEXT        PRIMARY KEY,
    student_id      TEXT        NOT NULL,
    question_id     TEXT        NOT NULL,
    attempt_no      INTEGER     NOT NULL        CHECK(attempt_no >= 1),
    selected_option TEXT        NOT NULL        CHECK(selected_option IN ('a','b','c','d')),
    is_correct      INTEGER     NOT NULL        CHECK(is_correct IN (0, 1)),
    points_earned   INTEGER     DEFAULT 0,
    submitted_at    DATETIME    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(student_id),
    FOREIGN KEY (question_id)   REFERENCES quiz_questions(question_id),
    UNIQUE(student_id, question_id, attempt_no)
    );`
  }

  codingPracticeTable() {
    return `
    CREATE TABLE IF NOT EXISTS coding_problems (
    problem_id      TEXT         PRIMARY KEY,
    assignment_id   TEXT         NOT NULL,
    title           TEXT         NOT NULL               CHECK(length(title) <= 200),
    description     TEXT         NOT NULL,
    sample_input    TEXT,
    sample_output   TEXT,
    expected_output TEXT         NOT NULL,
    language        TEXT         DEFAULT 'javascript',
    time_limit_ms   INTEGER      DEFAULT 3000,
    difficulty      TEXT         DEFAULT 'easy'         CHECK(difficulty IN ('easy','medium','hard')),
    points          INTEGER      DEFAULT 20             CHECK(points >= 0),
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
    );`
  }

  codeSubmissionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS code_submissions (
    submission_id     TEXT      PRIMARY KEY,
    student_id        TEXT      NOT NULL,
    problem_id        TEXT      NOT NULL,
    attempt_no        INTEGER   NOT NULL      CHECK(attempt_no >= 1),
    code              TEXT      NOT NULL,
    language          TEXT      NOT NULL      DEFAULT 'javascript',
    actual_output     TEXT,
    is_correct        INTEGER   NOT NULL      DEFAULT 0 CHECK(is_correct IN (0, 1)),
    score             INTEGER   DEFAULT 0     CHECK(score >= 0),
    execution_time_ms INTEGER                 CHECK(execution_time_ms >= 0),
    submitted_at      DATETIME  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(student_id),
    FOREIGN KEY (problem_id)    REFERENCES coding_problems(problem_id),
    UNIQUE(student_id, problem_id, attempt_no)
    );`
  }

  dailyScoresTable() {
    return `
    CREATE TABLE IF NOT EXISTS daily_scores (
    score_id      TEXT PRIMARY KEY,
    student_id    TEXT NOT NULL,
    assignment_id TEXT NOT NULL,
    attempt_no    INTEGER NOT NULL   CHECK(attempt_no >= 1),
    quiz_score    INTEGER DEFAULT 0  CHECK(quiz_score >= 0),
    coding_score  INTEGER DEFAULT 0  CHECK(coding_score >= 0),
    total_score   INTEGER DEFAULT 0 CHECK(total_score = quiz_score + coding_score),
    date          DATE    NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    UNIQUE(student_id, assignment_id, attempt_no)
    );`
  }

  index() {
    return `
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_quiz_student ON quiz_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_code_student ON code_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);
    CREATE INDEX IF NOT EXISTS idx_daily_student ON daily_scores(student_id);
    CREATE INDEX IF NOT EXISTS idx_code_problem ON code_submissions(problem_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_question ON quiz_submissions(question_id);
    CREATE INDEX IF NOT EXISTS idx_daily_assignment ON daily_scores(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_code_student_problem ON code_submissions(student_id, problem_id);
    CREATE INDEX IF NOT EXISTS idx_daily_student_assignment ON daily_scores(student_id, assignment_id);
    CREATE INDEX IF NOT EXISTS idx_daily_attempt ON daily_scores(student_id, assignment_id, attempt_no);
    `
  }
}

export default InitializeTables
