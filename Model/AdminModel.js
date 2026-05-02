import db from '../Database/connectDb.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

class AdminModel {
  static async create(name, email, password) {
    const admin_id = crypto.randomUUID()
    const password_hash = await bcrypt.hash(password, 10)
    try {
      await db.run(`
        INSERT INTO admins (admin_id, name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [admin_id, name, email, password_hash])
      return { admin_id, name, email }
    } catch (err) {
      throw err
    }
  }

  static async read(email = null, admin_id = null) {
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
