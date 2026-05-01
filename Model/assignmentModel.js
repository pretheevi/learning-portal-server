import db from "../Database/connectDb.js"
class Assignment{
  static async getAssignment(student_id, assignmentType, skill_type, limit=10, offset=0) {
    if(!assignmentType || !skill_type) return false
    const query = `
      SELECT 
        a.*,
        saa.is_unlocked,
        saa.unlocked_at,
        saa.access_id
      FROM assignments a
      LEFT JOIN student_assignment_access saa 
        ON saa.assignment_id = a.assignment_id 
        AND saa.student_id = ?
      WHERE a.type = ? AND a.skill_type = ?
      ORDER BY a.order_num ASC
      LIMIT ? OFFSET ?
    `
    try {
      const result = await db.all(query, [student_id, assignmentType, skill_type, limit, offset])
      return result
    } catch(err) {
      throw err
    }
  }

  static async seedAccessForStudent(student_id) {
    // get all assignments ordered by order_num per skill_type
    const assignments = await db.all(`
      SELECT * FROM assignments ORDER BY skill_type, order_num ASC
    `)
    // group by skill_type, first one per group gets unlocked
    const seenSkillType = new Set()
    for (const a of assignments) {
      const isFirst = !seenSkillType.has(a.skill_type)
      seenSkillType.add(a.skill_type)

      await db.run(`
        INSERT OR IGNORE INTO student_assignment_access 
          (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        student_id,
        a.assignment_id,
        isFirst ? 1 : 0,
        isFirst ? new Date().toISOString() : null
      ])
    }
  }

  static async seedAccessForNewAssignment(assignment_id, skill_type) {
    const students = await db.all(`SELECT student_id FROM students`)
    // check if this is the first assignment for this skill_type
    const existingCount = await db.get(`
      SELECT COUNT(*) as count FROM assignments 
      WHERE skill_type = ? AND assignment_id != ?
    `, [skill_type, assignment_id])
    const isFirst = existingCount.count === 0
    for (const s of students) {
      await db.run(`
        INSERT OR IGNORE INTO student_assignment_access
          (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        s.student_id,
        assignment_id,
        isFirst ? 1 : 0,
        isFirst ? new Date().toISOString() : null
      ])
    }
  }
  static async assignmentSubmit(student_id, assignment_id, quiz_score, total_possible_score) {
    const score_id = crypto.randomUUID()
    // ✅ fixed: filter by student_id too
    const row = await db.get(`
      SELECT attempt_no FROM daily_scores 
      WHERE assignment_id = ? AND student_id = ? 
      ORDER BY attempt_no DESC LIMIT 1
    `, [assignment_id, student_id])
    const attempt_no = row ? row.attempt_no + 1 : 1
    const coding_score = 0
    const total_score = quiz_score + coding_score
    await db.run(`
      INSERT INTO daily_scores (
        score_id, student_id, assignment_id, attempt_no,
        quiz_score, coding_score, total_score, date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [score_id, student_id, assignment_id, attempt_no, quiz_score, coding_score, total_score])
    // ✅ unlock next assignment if score >= 80% 
    const percentage = (quiz_score / total_possible_score) * 100
    if (percentage >= 80) {
      await Assignment.unlockNextAssignment(db, student_id, assignment_id)
    }
  }

  static async unlockNextAssignment(db, student_id, assignment_id) {
    // get current assignment's skill_type and order_num
    const current = await db.get(`
      SELECT skill_type, order_num FROM assignments WHERE assignment_id = ?
    `, [assignment_id])
    if (!current) return
    // find the next assignment in same skill_type
    const next = await db.get(`
      SELECT assignment_id FROM assignments
      WHERE skill_type = ? AND order_num > ?
      ORDER BY order_num ASC
      LIMIT 1
    `, [current.skill_type, current.order_num])
    if (!next) return // no next assignment exists
    await db.run(`
      UPDATE student_assignment_access
      SET is_unlocked = 1, unlocked_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND assignment_id = ?
    `, [student_id, next.assignment_id])
  }
}

export default Assignment
