import connectDb from "../Database/connectDb.js"

class Assignment{
  static async getDb() {
    return await connectDb()
  }
  static async getAssignment(assignmentType, language, limit=10, offset=0) {
    if(!assignmentType) return false
    let query = `
      SELECT *
      FROM assignments
      WHERE type = ? AND title LIKE ?
      ORDER BY created_at DESC
      LIMIT ? 
      OFFSET ?
    `
    try{
      const db = await Assignment.getDb()
      const likePattern = `%${language}%`
      const result = await db.all(query, [assignmentType, likePattern, limit, offset])
      return result
    } catch(err) {
      throw err
    }
  }

  static async assignmentSubmit(student_id, assignment_id, quiz_score) {
    const db = await Assignment.getDb()
    const score_id = crypto.randomUUID()

    let attempt_no
    try {
      // ✅ get returns { attempt_no: N } or undefined on first attempt
      const row = await db.get(
        `SELECT attempt_no FROM daily_scores WHERE assignment_id = ? ORDER BY attempt_no DESC LIMIT 1`,
        [assignment_id]
      )
      // ✅ if no row, first attempt
      attempt_no = row ? row.attempt_no + 1 : 1
    } catch (err) {
      throw err
    }

    const coding_score = 0
    const total_score = quiz_score + coding_score

    const query = `INSERT INTO daily_scores (
      score_id, student_id, assignment_id, attempt_no,
      quiz_score, coding_score, total_score, date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

    try {
      // ✅ db.run() for INSERT/UPDATE/DELETE, not db.exec()
      await db.run(query, [score_id, student_id, assignment_id, attempt_no, quiz_score, coding_score, total_score])
    } catch (err) {
      throw err
    }
  }
}

export default Assignment
