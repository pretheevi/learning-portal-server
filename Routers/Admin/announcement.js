import express from 'express'
const router = express.Router()
import AnnouncementModel from '../../Model/AnnouncementModel.js'
import ResponseHandler from '../../Response/Response.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'

// admin sends announcement
router.post('/announcement', Jsonwebtoken.verifyAdmin, async (req, res) => {
  try {
    const { message, type } = req.body
    const announcement = await AnnouncementModel.create(req.admin.admin_id, message, type)
    req.app.locals.broadCast(announcement)
    return ResponseHandler(res, 201, 'success', announcement)
  } catch (err) {
    ErrorHandler.Error500(err, res)
  }
})

// students fetch history (fallback if WS missed)
router.get('/announcement', Jsonwebtoken.verify, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const result = await AnnouncementModel.getAll(Number(limit), Number(offset))
    return ResponseHandler(res, 200, 'success', result)
  } catch (err) {
    ErrorHandler.Error500(err, res)
  }
})

export default router
