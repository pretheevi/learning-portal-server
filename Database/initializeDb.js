import connectDb from './connectDb.js'

class InitializeTables {
  async init() {
    let db
    let transaction = false

    try {
      db = await connectDb()

      await db.exec('PRAGMA foreign_keys = ON')
      await db.exec('BEGIN')
      transaction = true

      await db.exec(this.userTable())
      await db.exec(this.assignmentTable())
      await db.exec(this.studentAssignmentAccessTable()) 
      await db.exec(this.quizQuestionsTable())
      await db.exec(this.quizSubmissionsTable())

      await db.exec(this.codingProblemsTable())
      await db.exec(this.codingProblemExamplesTable())
      await db.exec(this.codingProblemTestcasesTable())
      await db.exec(this.codeSubmissionsTable())
      await db.exec(this.adminTable())
      await db.exec(this.announcementTable())
      
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
      name          TEXT NOT NULL CHECK(length(name) <= 200),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar        TEXT,
      bio           TEXT CHECK(length(bio) <= 500),
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  }

  assignmentTable() {
  return `
    CREATE TABLE IF NOT EXISTS assignments (
      assignment_id TEXT PRIMARY KEY,
      title         TEXT NOT NULL CHECK(length(title) <= 200),
      date          DATE NOT NULL,
      type          TEXT NOT NULL CHECK(type IN ('quiz','coding','both')),
      skill_type    TEXT,
      order_num     INTEGER NOT NULL DEFAULT 1,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  }

    studentAssignmentAccessTable() {
    return `
    CREATE TABLE IF NOT EXISTS student_assignment_access (
      access_id     TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL,
      assignment_id TEXT NOT NULL,
      is_unlocked   INTEGER NOT NULL DEFAULT 0 CHECK(is_unlocked IN (0,1)),
      unlocked_at   DATETIME,
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
      UNIQUE(student_id, assignment_id)
    );`
  }

  quizQuestionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS quiz_questions (
      question_id    TEXT PRIMARY KEY,
      assignment_id  TEXT NOT NULL,
      question_text  TEXT NOT NULL,
      option_a       TEXT NOT NULL,
      option_b       TEXT NOT NULL,
      option_c       TEXT NOT NULL,
      option_d       TEXT NOT NULL,
      correct_option TEXT NOT NULL CHECK(correct_option IN ('a','b','c','d')),
      explanation    TEXT,
      points         INTEGER DEFAULT 10 CHECK(points >= 0),
      order_num      INTEGER DEFAULT 1,
      FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
    );`
  }

  quizSubmissionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS quiz_submissions (
      submission_id   TEXT PRIMARY KEY,
      student_id      TEXT NOT NULL,
      question_id     TEXT NOT NULL,
      attempt_no      INTEGER NOT NULL CHECK(attempt_no >= 1),
      selected_option TEXT NOT NULL CHECK(selected_option IN ('a','b','c','d')),
      is_correct      INTEGER NOT NULL CHECK(is_correct IN (0,1)),
      points_earned   INTEGER DEFAULT 0,
      submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id),
      UNIQUE(student_id, question_id, attempt_no)
    );`
  }

  codingProblemsTable() {
    return `
    CREATE TABLE IF NOT EXISTS coding_problems (
      problem_id      TEXT PRIMARY KEY,
      assignment_id   TEXT NOT NULL,
      title           TEXT NOT NULL CHECK(length(title) <= 200),
      description     TEXT NOT NULL,
      language        TEXT DEFAULT 'javascript',
      difficulty      TEXT DEFAULT 'easy' CHECK(difficulty IN ('easy','medium','hard')),
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
    );`
  }

  codingProblemExamplesTable() {
    return `
    CREATE TABLE IF NOT EXISTS coding_problem_examples (
      example_id      TEXT PRIMARY KEY,
      problem_id      TEXT NOT NULL,
      example_input   TEXT,
      example_output  TEXT NOT NULL,
      explanation     TEXT,
      order_num       INTEGER DEFAULT 1,
      FOREIGN KEY (problem_id) REFERENCES coding_problems(problem_id)
    );`
  }

  codingProblemTestcasesTable() {
    return `
    CREATE TABLE IF NOT EXISTS coding_problem_testcases (
      testcase_id               TEXT PRIMARY KEY,
      problem_id                TEXT NOT NULL,
      testcase_input            TEXT,
      testcase_expected_output  TEXT NOT NULL,
      point                     INTEGER NOT NULL DEFAULT 1 CHECK(point IN (0,1)),
      is_hidden                 INTEGER NOT NULL DEFAULT 1 CHECK(is_hidden IN (0,1)),
      FOREIGN KEY (problem_id) REFERENCES coding_problems(problem_id)
    );`
  }

  codeSubmissionsTable() {
    return `
    CREATE TABLE IF NOT EXISTS code_submissions (
      submission_id         TEXT PRIMARY KEY,
      student_id            TEXT NOT NULL,
      problem_id            TEXT NOT NULL,
      attempt_no            INTEGER NOT NULL CHECK(attempt_no >= 1),
      code                  TEXT NOT NULL,
      language              TEXT NOT NULL DEFAULT 'javascript',
      total_testcase_pass   INTEGER NOT NULL DEFAULT 0,
      score                 INTEGER NOT NULL DEFAULT 0,
      submitted_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (problem_id) REFERENCES coding_problems(problem_id),
      UNIQUE(student_id, problem_id, attempt_no)
    );`
  }

  dailyScoresTable() {
    return `
    CREATE TABLE IF NOT EXISTS daily_scores (
      score_id      TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL,
      assignment_id TEXT NOT NULL,
      attempt_no    INTEGER NOT NULL CHECK(attempt_no >= 1),
      quiz_score    INTEGER DEFAULT 0 CHECK(quiz_score >= 0),
      coding_score  INTEGER DEFAULT 0 CHECK(coding_score >= 0),
      total_score   INTEGER DEFAULT 0
                   CHECK(total_score = quiz_score + coding_score),
      date          DATE NOT NULL,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
      UNIQUE(student_id, assignment_id, attempt_no)
    );`
  }

  adminTable() {
    return `
    CREATE TABLE IF NOT EXISTS admins (
      admin_id      TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  }

  announcementTable() {
    return `
    CREATE TABLE IF NOT EXISTS announcements (
      announcement_id  TEXT PRIMARY KEY,
      message          TEXT NOT NULL CHECK(length(message) <= 1000),
      sent_by          TEXT NOT NULL,
      type             TEXT DEFAULT 'general' CHECK(type IN ('general','warning','success','info')),
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sent_by) REFERENCES admins(admin_id)
    );`
  }

  index() {
    return `
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

    CREATE INDEX IF NOT EXISTS idx_code_student ON code_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_code_problem ON code_submissions(problem_id);
    CREATE INDEX IF NOT EXISTS idx_code_student_problem ON code_submissions(student_id, problem_id);

    CREATE INDEX IF NOT EXISTS idx_problem_assignment ON coding_problems(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_example_problem ON coding_problem_examples(problem_id);
    CREATE INDEX IF NOT EXISTS idx_testcase_problem ON coding_problem_testcases(problem_id);

    CREATE INDEX IF NOT EXISTS idx_quiz_student ON quiz_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_question ON quiz_submissions(question_id);

    CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);
    CREATE INDEX IF NOT EXISTS idx_access_student ON student_assignment_access(student_id);
    CREATE INDEX IF NOT EXISTS idx_access_assignment ON student_assignment_access(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_daily_student ON daily_scores(student_id);
    CREATE INDEX IF NOT EXISTS idx_daily_assignment ON daily_scores(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_daily_attempt ON daily_scores(student_id, assignment_id, attempt_no);
    `
  }
}

export default InitializeTables
