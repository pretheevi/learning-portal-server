import connectDb from './connectDb.js'

async function migrate() {
  let db
  let transaction = false

  try {
    db = await connectDb()
    await db.exec('PRAGMA foreign_keys = ON')
    await db.exec('BEGIN')
    transaction = true

    // ── Step 1: Add order_num to assignments (only if it doesn't exist) ────────
    // SQLite has no IF NOT EXISTS for ALTER TABLE, so we check pragma first
    const columns = await db.all('PRAGMA table_info(assignments)')
    const hasOrderNum = columns.some(c => c.name === 'order_num')

    if (!hasOrderNum) {
      await db.exec(`ALTER TABLE assignments ADD COLUMN order_num INTEGER`)
      console.log('✓ Added order_num column to assignments')
    } else {
      console.log('· order_num already exists, skipping ALTER')
    }

    // ── Step 2: Backfill order_num for existing assignments ────────────────────
    // Assigns order by date ascending (oldest = 1, next = 2, ...)
    // Change the ORDER BY if you want a different sequence
    await db.exec(`
      UPDATE assignments
      SET order_num = (
        SELECT COUNT(*) + 1
        FROM assignments a2
        WHERE a2.date < assignments.date
           OR (a2.date = assignments.date AND a2.created_at < assignments.created_at)
      )
      WHERE order_num IS NULL
    `)
    console.log('✓ Backfilled order_num for existing assignments')

    // ── Step 3: Add UNIQUE constraint workaround ───────────────────────────────
    // SQLite can't ADD CONSTRAINT after the fact, but a unique index works the same
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_order_num ON assignments(order_num)
    `)
    console.log('✓ Created unique index on order_num')

    // ── Step 4: Create student_assignment_access table ─────────────────────────
    await db.exec(`
      CREATE TABLE IF NOT EXISTS student_assignment_access (
        access_id     TEXT PRIMARY KEY,
        student_id    TEXT NOT NULL,
        assignment_id TEXT NOT NULL,
        is_unlocked   INTEGER NOT NULL DEFAULT 0 CHECK(is_unlocked IN (0,1)),
        unlocked_at   DATETIME,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
        UNIQUE(student_id, assignment_id)
      )
    `)
    console.log('✓ Created student_assignment_access table')

    // ── Step 5: Backfill access rows for ALL existing students ─────────────────
    // For each student, create one row per assignment.
    // Unlock logic: unlock assignment #1 always.
    //               For assignments #2+, unlock if the student already has
    //               a daily_scores row for the PREVIOUS assignment.
    await db.exec(`
      INSERT OR IGNORE INTO student_assignment_access
        (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
      SELECT
        lower(hex(randomblob(16))),
        s.student_id,
        a.assignment_id,
        CASE
          -- First assignment: always unlocked
          WHEN a.order_num = 1 THEN 1
          -- Later assignments: unlocked if student completed the previous one
          WHEN EXISTS (
            SELECT 1 FROM daily_scores ds
            JOIN assignments a_prev ON a_prev.assignment_id = ds.assignment_id
            WHERE ds.student_id = s.student_id
              AND a_prev.order_num = a.order_num - 1
          ) THEN 1
          ELSE 0
        END,
        CASE
          WHEN a.order_num = 1 THEN s.created_at
          WHEN EXISTS (
            SELECT 1 FROM daily_scores ds
            JOIN assignments a_prev ON a_prev.assignment_id = ds.assignment_id
            WHERE ds.student_id = s.student_id
              AND a_prev.order_num = a.order_num - 1
          ) THEN (
            SELECT ds.updated_at FROM daily_scores ds
            JOIN assignments a_prev ON a_prev.assignment_id = ds.assignment_id
            WHERE ds.student_id = s.student_id
              AND a_prev.order_num = a.order_num - 1
            ORDER BY ds.updated_at DESC LIMIT 1
          )
          ELSE NULL
        END
      FROM students s
      CROSS JOIN assignments a
    `)
    console.log('✓ Backfilled access rows for all existing students')

    // ── Step 6: Create triggers for future signups and completions ─────────────
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_seed_access_on_register
      AFTER INSERT ON students
      BEGIN
        INSERT INTO student_assignment_access (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
        SELECT
          lower(hex(randomblob(16))),
          NEW.student_id,
          a.assignment_id,
          CASE WHEN a.order_num = 1 THEN 1 ELSE 0 END,
          CASE WHEN a.order_num = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
        FROM assignments a;
      END
    `)

    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_unlock_next_on_completion
      AFTER INSERT ON daily_scores
      BEGIN
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
            JOIN assignments a_next ON a_next.order_num = a_curr.order_num + 1
            WHERE a_curr.assignment_id = NEW.assignment_id
            LIMIT 1
          );
      END
    `)
    console.log('✓ Created triggers')

    // ── Step 7: Add indexes ────────────────────────────────────────────────────
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_order ON assignments(order_num)`)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_access_student ON student_assignment_access(student_id)`)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_access_student_assignment ON student_assignment_access(student_id, assignment_id)`)
    console.log('✓ Created indexes')

    await db.exec('COMMIT')
    transaction = false
    console.log('\n✅ Migration complete')

  } catch (err) {
    if (db && transaction) await db.exec('ROLLBACK')
    console.error('❌ Migration failed, rolled back:', err.message)
    throw err
  }
}

migrate()
