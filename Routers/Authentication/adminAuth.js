import express from 'express'
import bcrypt from 'bcrypt'
const router = express.Router()
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import AuthValidator from '../../Middleware/AuthValidation.js'
import Bcrypt from '../../Middleware/bcrypt.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import AdminModel from '../../Model/AdminModel.js'
import AdminAuthValidator from '../../Middleware/AdminAuthValidation.js'
import AuthLimiter from '../../rateLimiter/authLimiter.js'
router
  .post('/auth/signin', AuthLimiter.signin, AdminAuthValidator.signInValidate, async (req, res) => {
    try {
      const { email, password } = req.body
      const admin = await AdminModel.read(email)
      if (!admin) return ErrorHandler.Error400(res, 'Account does not exist')
      const passwordMatch = await bcrypt.compare(password, admin.password_hash)
      if (!passwordMatch) return ErrorHandler.Error400(res, 'Invalid credentials')
      const payload = { admin_id: admin.admin_id, name: admin.name, role: 'admin' }
      const token = Jsonwebtoken.generate(payload)
      return ResponseHandler(res, 200, 'sign in successful', token)
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  })

  .post('/auth/signup', AuthLimiter.signup, AdminAuthValidator.signUpValidate, async (req, res) => {
    try {
      const { name, email, password } = req.body
      const existing = await AdminModel.read(email)
      if (existing) return ErrorHandler.Error400(res, 'Account already exists')
      const result = await AdminModel.create(name, email, password)
      return ResponseHandler(res, 200, 'sign up successful', { email: result.email })
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  })

  export default router
