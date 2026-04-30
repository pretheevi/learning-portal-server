import express from 'express'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import QuizQuestionsModel from '../../Model/QuizQuestionsModel.js'
import questionLimiter from '../../rateLimiter/questionLimiter.js'
const router = express.Router()

router
  .post('/quiz/:question_id/submission', questionLimiter.questionSubmit, Jsonwebtoken.verify, async (req, res) => {
      try{
        const { student_id } = req.token
        const { question_id } = req.params
        const { assignment_id, selected_option, is_correct, points_earned } = req.body
        await QuizQuestionsModel.quizSubmission(student_id, question_id, selected_option, is_correct, points_earned)
        return ResponseHandler(res, 200, 'success')
      } catch (err) {
        console.log(err.message)
        return ErrorHandler.Error500(err, res)
      }
  })

  export default router
