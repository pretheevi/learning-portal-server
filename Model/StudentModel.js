import connectDb from '../Database/connectDb.js'
import Abs from './Abs.js'
import crypto from 'crypto'

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

  static async getDb() {
    return await connectDb()
  }

  async create() {
    const db = await StudentModel.getDb()
    const student_id = crypto.randomUUID()
    const query = `
      INSERT INTO students
      (student_id, name, email, password_hash, avatar, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `
    await db.exec('BEGIN')
    try {
      const result = await db.run(query, [
        student_id,
        this.#name,
        this.#email,
        this.#password_hash,
        this.#avatar,
        this.#bio
      ])

      await db.exec('COMMIT')
      return result

    } catch (originalError) {
      try {
        await db.exec('ROLLBACK')
      } catch (rollbackError) {
        rollbackError.cause = originalError
        throw rollbackError
      }

      throw originalError
    }
  }

  setData(name, email, password_hash, avatar = null, bio = null) {
    this.#name = name
    this.#email = email
    this.#password_hash = password_hash
    this.#avatar = avatar
    this.#bio = bio
  }

static async read(id = null, email = null) {
  const db = await this.getDb()
  let query = 'SELECT student_id, email, password_hash FROM students'
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

  update() {}
  delete() {}
}

export default StudentModel
