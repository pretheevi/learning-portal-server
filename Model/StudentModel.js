import db from '../Database/connectDb.js'
import Abs from './Abs.js'
import crypto from 'crypto'
import Assignment from './assignmentModel.js'

class StudentModel extends Abs {
  #name
  #email
  #password_hash
  #avatar
  #bio

  constructor() {
    super()
    this.#name = null
    this.#email = null
    this.#password_hash = null
    this.#avatar = null
    this.#bio = null
  }

  async create() {
    const student_id = crypto.randomUUID()
    const result = await db.run(
      `INSERT INTO students (student_id, name, email, password_hash, avatar, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [student_id, this.#name, this.#email, this.#password_hash, this.#avatar, this.#bio]
    )
    await Assignment.seedAccessForStudent(student_id)
    return result
  }

  setData(name, email, password_hash, avatar = null, bio = null) {
    this.#name = name
    this.#email = email
    this.#password_hash = password_hash
    this.#avatar = avatar
    this.#bio = bio
  }

  static async read(id = null, email = null) {
    let query = 'SELECT student_id, name, email, password_hash, avatar, bio, created_at FROM students'
    const conditions = []
    const values = []
    if (id) {
      conditions.push('student_id = ?')
      values.push(id)
    }
    if (email) {
      conditions.push('email = ?')
      values.push(email)
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    return await db.get(query, values)
  }

  static async getStudentSkillStats(student_id) {
    const rows = await db.all(`
      WITH best_scores AS (
        SELECT 
          ds.assignment_id,
          MAX(ds.total_score) AS best_score
        FROM daily_scores ds
        WHERE ds.student_id = ?
        GROUP BY ds.assignment_id
      ),
      assignment_possible AS (
        SELECT assignment_id, SUM(points) AS possible_score
        FROM quiz_questions
        GROUP BY assignment_id

        UNION ALL

        SELECT cp.assignment_id, SUM(tc.point) AS possible_score
        FROM coding_problem_testcases tc
        JOIN coding_problems cp ON cp.problem_id = tc.problem_id
        GROUP BY cp.assignment_id
      )
      SELECT
        a.skill_type,
        a.type,
        SUM(bs.best_score)     AS earned,
        SUM(ap.possible_score) AS possible,
        ROUND(SUM(bs.best_score) * 100.0 / SUM(ap.possible_score), 1) AS percentage
      FROM best_scores bs
      JOIN assignments a ON a.assignment_id = bs.assignment_id
      JOIN assignment_possible ap ON ap.assignment_id = bs.assignment_id
      GROUP BY a.skill_type, a.type
      ORDER BY a.skill_type, a.type
    `, [student_id])

    const result = { quiz: {}, coding: {} }

    for (const row of rows) {
      const { type, skill_type, earned, possible, percentage } = row
      if (!result[type]) continue   // ignore unknown types

      result[type][skill_type] = { earned, possible, percentage }
    }

    return result
  }

  update() {}
  delete() {}
}

export default StudentModel
