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
      await db.exec(this.quizQuestionsTable())
      await db.exec(this.quizSubmissionsTable())

      await db.exec(this.codingProblemsTable())
      await db.exec(this.codingProblemExamplesTable())
      await db.exec(this.codingProblemTestcasesTable())
      await db.exec(this.codeSubmissionsTable())

      await db.exec(this.dailyScoresTable())

      // Lock/unlock system
      await db.exec(this.studentAssignmentAccessTable())
      await db.exec(this.triggerUnlockFirstAssignment())
      await db.exec(this.triggerUnlockNextAssignment())

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
      order_num     INTEGER NOT NULL UNIQUE,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
    // order_num defines the sequence (1 = first, 2 = second, ...)
    // UNIQUE ensures no two assignments share the same position
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

  // ─── Lock / Unlock System ────────────────────────────────────────────────────

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
    /*
      Every (student, assignment) pair gets a row here.
      Rows are seeded by the trigger below when a student registers.
      is_unlocked = 0 → locked
      is_unlocked = 1 → accessible
    */
  }

  triggerUnlockFirstAssignment() {
    return `
    CREATE TRIGGER IF NOT EXISTS trg_seed_access_on_register
    AFTER INSERT ON students
    BEGIN
      -- Insert one locked row per assignment for this new student
      INSERT INTO student_assignment_access (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
      SELECT
        lower(hex(randomblob(16))),
        NEW.student_id,
        a.assignment_id,
        CASE WHEN a.order_num = 1 THEN 1 ELSE 0 END,
        CASE WHEN a.order_num = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
      FROM assignments a;
    END;`
    /*
      Fires once per student signup.
      Assignment with order_num = 1 → is_unlocked = 1 (open from day one).
      All others → is_unlocked = 0 (locked until earned).

      NOTE: This only seeds assignments that exist at signup time.
      If you add new assignments later, run a one-time backfill:
        INSERT OR IGNORE INTO student_assignment_access
          (access_id, student_id, assignment_id, is_unlocked)
        SELECT lower(hex(randomblob(16))), s.student_id, a.assignment_id, 0
        FROM students s, assignments a;
    */
  }

  triggerUnlockNextAssignment() {
    return `
    CREATE TRIGGER IF NOT EXISTS trg_unlock_next_on_completion
    AFTER INSERT ON daily_scores
    BEGIN
      -- Find the order_num of the assignment just completed
      -- then unlock the assignment whose order_num is one higher, for this student
      UPDATE student_assignment_access
      SET
        is_unlocked = 1,
        unlocked_at = CURRENT_TIMESTAMP
      WHERE
        student_id    = NEW.student_id
        AND is_unlocked = 0
        AND assignment_id = (
          SELECT a_next.assignment_id
          FROM assignments a_curr
          JOIN assignments a_next
            ON a_next.order_num = a_curr.order_num + 1
          WHERE a_curr.assignment_id = NEW.assignment_id
          LIMIT 1
        );
    END;`
    /*
      Fires every time a row lands in daily_scores.
      "Completed" = a daily_scores row exists (student submitted the assignment).

      If you want a stricter completion rule (e.g. total_score >= 50),
      add a WHEN clause:
        CREATE TRIGGER ... AFTER INSERT ON daily_scores
        WHEN NEW.total_score >= 50
        BEGIN ...
    */
  }

  // ─────────────────────────────────────────────────────────────────────────────

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
    CREATE INDEX IF NOT EXISTS idx_assignments_order ON assignments(order_num);

    CREATE INDEX IF NOT EXISTS idx_daily_student ON daily_scores(student_id);
    CREATE INDEX IF NOT EXISTS idx_daily_assignment ON daily_scores(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_daily_attempt ON daily_scores(student_id, assignment_id, attempt_no);

    CREATE INDEX IF NOT EXISTS idx_access_student ON student_assignment_access(student_id);
    CREATE INDEX IF NOT EXISTS idx_access_student_assignment ON student_assignment_access(student_id, assignment_id);
    `
  }
}

export default InitializeTables
