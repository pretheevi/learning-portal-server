// Routers/Admin/profile.js
import express from 'express'
const router = express.Router()
import AdminModel from '../../Model/AdminModel.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import ResponseHandler from '../../Response/Response.js'
import ErrorHandler from '../../Error/ErrorHandler.js'

router.get('/profile', Jsonwebtoken.verify, async (req, res) => {
  try {
    const { admin_id } = req.token
    const admin = await AdminModel.read(null, admin_id)
    if (!admin) return ErrorHandler.Error400(res, 'Admin not found')

    // ✅ never send password_hash to client
    const { password_hash, ...safeAdmin } = admin
    return ResponseHandler(res, 200, 'success', safeAdmin)
  } catch (err) {
    ErrorHandler.Error500(err, res)
  }
})

export default router
