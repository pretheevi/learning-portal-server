import express from 'express'
const router = express.Router()
import ResponseHandler from '../../Response/Response.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import Assignment from '../../Model/assignmentModel.js'
import AssignmentValidation from '../../Middleware/Assignment.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import QuizQuestionsModel from '../../Model/QuizQuestionsModel.js'
router
  .get('/assignment', Jsonwebtoken.verify,  AssignmentValidation.getAssignment, async (req, res) => {
    try{
      const {type, limit, offset} = req.query
      const result = await Assignment.getAssignment(type, Number(limit), Number(offset))
      return ResponseHandler(res, 200, 'success', result)
    } catch (err) {
      ErrorHandler.Error500(res)
    }
  })
  .get('/assignment/:id/questions', Jsonwebtoken.verify, AssignmentValidation.assignmentIdValidate, async (req, res) => {
    try{
      const {id} = req.params
      const result = await QuizQuestionsModel.getQuizQuestions(id)
      return ResponseHandler(res, 200, 'success', result)
    } catch (err) {
      ErrorHandler.Error500(err, res)
    }
  })
  .post('/assignment/:assignment_id/submission', Jsonwebtoken.verify, AssignmentValidation.assignmentSubmitValidation, async (req, res) => {
    try {
      const {student_id} = req.token
      const { assignment_id } = req.params
      const { quiz_score } = req.body
      await Assignment.assignmentSubmit(student_id, assignment_id, quiz_score)
      return ResponseHandler(res, 200, 'success', student_id)
    } catch (err) {
      ErrorHandler.Error500(err, res)
    }
  })

export default router
