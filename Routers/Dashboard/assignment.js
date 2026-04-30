import express from 'express'
const router = express.Router()
import ResponseHandler from '../../Response/Response.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import Assignment from '../../Model/assignmentModel.js'
import AssignmentValidation from '../../Middleware/Assignment.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import QuizQuestionsModel from '../../Model/QuizQuestionsModel.js'
import AssignmentLimit from '../../rateLimiter/assignmentLimit.js'
router
  .get('/assignment', AssignmentLimit.getAssignment, Jsonwebtoken.verify, AssignmentValidation.getAssignment, async (req, res) => {
    try {
      const { student_id } = req.token
      const { assignmentType, skill_type, limit, offset } = req.query
      const result = await Assignment.getAssignment(
        student_id,
        assignmentType,
        skill_type,
        Number(limit) || 10,
        Number(offset) || 0
      )
      return ResponseHandler(res, 200, 'success', result)
    } catch (err) {
      ErrorHandler.Error500(res)
    }
  })
  .get('/assignment/:id/questions', AssignmentLimit.getAssignment, Jsonwebtoken.verify, AssignmentValidation.assignmentIdValidate, async (req, res) => {
    try{
      const {id} = req.params
      const result = await QuizQuestionsModel.getQuizQuestions(id)
      return ResponseHandler(res, 200, 'success', result)
    } catch (err) {
      ErrorHandler.Error500(err, res)
    }
  })
  .post('/assignment/:assignment_id/submission', AssignmentLimit.submitAssignment, Jsonwebtoken.verify, AssignmentValidation.assignmentSubmitValidation, async (req, res) => {
    try {
      const { student_id } = req.token
      const { assignment_id } = req.params
      const { quiz_score, total_possible_score } = req.body   // ✅ add total_possible_score
      await Assignment.assignmentSubmit(student_id, assignment_id, quiz_score, total_possible_score)
      return ResponseHandler(res, 200, 'success', student_id)
    } catch (err) {
      ErrorHandler.Error500(err, res)
    }
  })

export default router
