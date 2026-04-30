
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import connectDb from './Database/connectDb.js';

async function insertUser() {
  const db = await connectDb();

  try {
    await db.exec('BEGIN');

    const name = 'Nivetha';
    const email = 'nivethainst@gmail.com';
    const plainPassword = 'nivetha';

    let studentId;

    // Check existing student
    const existingStudent = await db.get(
      `SELECT student_id FROM students WHERE email = ?`,
      [email]
    );

    if (existingStudent) {
      studentId = existingStudent.student_id;
      console.log('Student already exists');
    } else {
      studentId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await db.run(
        `INSERT INTO students
        (student_id, name, email, password_hash)
        VALUES (?, ?, ?, ?)`,
        [studentId, name, email, hashedPassword]
      );

      console.log('Student inserted');
    }

    // Get all assignments
    const assignments = await db.all(
      `SELECT assignment_id FROM assignments`
    );

    // Insert access rows safely
    for (const item of assignments) {
      await db.run(
        `INSERT OR IGNORE INTO student_assignment_access
        (access_id, student_id, assignment_id, is_unlocked)
        VALUES (?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          studentId,
          item.assignment_id,
          0
        ]
      );
    }

    await db.exec('COMMIT');
    console.log('Access records created successfully');

  } catch (err) {
    await db.exec('ROLLBACK');
    console.error('Error:', err);
  }
}

insertUser();

