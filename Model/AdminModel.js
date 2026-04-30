import connectDb from '../Database/connectDb.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

class AdminModel {
  static async getDb() {
    return await connectDb()
  }

  static async create(name, email, password) {
    const db = await AdminModel.getDb()
    const admin_id = crypto.randomUUID()
    const password_hash = await bcrypt.hash(password, 10)

    await db.exec('BEGIN')
    try {
      await db.run(`
        INSERT INTO admins (admin_id, name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [admin_id, name, email, password_hash])
      await db.exec('COMMIT')
      return { admin_id, name, email }
    } catch (err) {
      await db.exec('ROLLBACK')
      throw err
    }
  }

  static async read(email = null, admin_id = null) {
    const db = await AdminModel.getDb()
    let query = `SELECT admin_id, name, email, password_hash, created_at FROM admins`
    const conditions = []
    const values = []

    if (email) { conditions.push('email = ?'); values.push(email) }
    if (admin_id) { conditions.push('admin_id = ?'); values.push(admin_id) }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')

    return await db.get(query, values)
  }
}

export default AdminModel
