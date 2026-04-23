import express from 'express'
import bcrypt from 'bcrypt'
const router = express.Router()
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import AuthValidator from '../../Middleware/AuthValidation.js'
import Bcrypt from '../../Middleware/bcrypt.js'
import StudentModel from '../../Model/StudentModel.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'

router
  .post('/signin', AuthValidator.signInValidate, async (req, res) => {
    try{
        const { email, password } =  req.body
        const isStudentExist = await StudentModel.read(null, email)
        if(!isStudentExist) return ErrorHandler.Error400(res, 'Account does not exists')
        const passwordMatch = await bcrypt.compare(password, isStudentExist.password_hash)
        if (!passwordMatch) return ErrorHandler.Error400(res, 'Invalid credentials')
        const payload = {student_id: isStudentExist.student_id}
        const token = Jsonwebtoken.generate(payload)
        return ResponseHandler(res, 200, 'sig in successful', token)
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  })
  .post('/signup', AuthValidator.signUpValidate, Bcrypt.hashPassword, async (req, res) => {
    try{
        const { name, email, password_hash, avatar=null, bio=null } = req.body
        if(await StudentModel.read(null, email)) return ErrorHandler.Error400(res, 'Account Exists')
        const newStudent = new StudentModel()
        newStudent.setData(name, email, password_hash, avatar, bio)
        const result = await newStudent.create()
        return ResponseHandler(res, 200, 'sign up successful', {email: result.email})
    } catch (err) {
        return ErrorHandler.Error500(err, res)
    }
  })

  export default router
