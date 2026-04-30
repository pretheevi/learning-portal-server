import connectDb from '../Database/connectDb.js'
import crypto from 'crypto'

class AnnouncementModel {
  static async getDb() {
    return await connectDb()
  }

  // admin sends a message
  static async create(admin_id, message, type = 'general') {
    const db = await AnnouncementModel.getDb()
    const announcement_id = crypto.randomUUID()

    await db.run(`
      INSERT INTO announcements (announcement_id, message, sent_by, type, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [announcement_id, message, admin_id, type])

    return { announcement_id, message, type }
  }

  // students fetch all messages — latest first with limit/offset for pagination
  static async getAll(limit = 20, offset = 0) {
    const db = await AnnouncementModel.getDb()
    return await db.all(`
      SELECT 
        a.announcement_id,
        a.message,
        a.type,
        a.created_at,
        ad.name AS sent_by
      FROM announcements a
      JOIN admins ad ON ad.admin_id = a.sent_by
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])
  }

  // fetch only new messages after a given timestamp (for polling)
  static async getAfter(timestamp) {
    const db = await AnnouncementModel.getDb()
    return await db.all(`
      SELECT 
        a.announcement_id,
        a.message,
        a.type,
        a.created_at,
        ad.name AS sent_by
      FROM announcements a
      JOIN admins ad ON ad.admin_id = a.sent_by
      WHERE a.created_at > ?
      ORDER BY a.created_at ASC
    `, [timestamp])
  }

  static async delete(announcement_id) {
    const db = await AnnouncementModel.getDb()
    await db.run(`
      DELETE FROM announcements WHERE announcement_id = ?
    `, [announcement_id])
  }
}

export default AnnouncementModel
