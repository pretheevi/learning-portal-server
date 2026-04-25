import express from 'express'
const router = express.Router()
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import StudentModel from '../../Model/StudentModel.js'
router  
  .get('/profile', Jsonwebtoken.verify, async (req, res) => {
    try{
      const {student_id} = req.token
      const result = await StudentModel.read(student_id)
      return ResponseHandler(res, 200, 'success', result)
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  })

  export default router
