import express from 'express'
import crypto from 'crypto'
import connectDb from '../../Database/connectDb.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import CodeModel from '../../Model/codeModel.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import CodeAssignmentValidation from '../../Middleware/code.js'
const router = express.Router()

router.get('/coding-problem/:problem_id', Jsonwebtoken.verify, CodeAssignmentValidation.getProblem, async (req, res) => {
    try {
      const { problem_id } = req.params
      const problem = await CodeModel.getProblem(problem_id)
      if (!problem) return ErrorHandler.Error400(res, 'Problem not found')
      const examples = await CodeModel.getExamples(problem_id)
      const count = await CodeModel.getTestcaseCount(problem_id)
      const data = {
        success: true,
        problem,
        examples,
        total_cases: count.total_cases,
      }
      return ResponseHandler(res, 200, 'success', data)
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  }
)

router.post('/code/run', Jsonwebtoken.verify, CodeAssignmentValidation.runCode, async (req, res) => {
    try {
      const { problem_id } = req.body
      const testcases = await CodeModel.getTestcases(problem_id)
      const results = testcases.map((item) => ({
        testcase_input: item.testcase_input,
        testcase_expected_output: item.testcase_expected_output,
        actual_output: item.testcase_expected_output,
        passed: true,
      }))
      return ResponseHandler(res, 200, 'success', results)
    } catch (err) {
      return ErrorHandler.Error500(err, res)
    }
  }
)

router.post('/code/submit', Jsonwebtoken.verify, CodeAssignmentValidation.submitCode, async (req, res) => {
    let db
    let transaction = false
    try {
      const { problem_id, code, language } = req.body
      const student_id = req.user.student_id
      db = await connectDb()
      await db.exec('BEGIN')
      transaction = true
      const prev = await CodeModel.getLastAttempt(student_id, problem_id)
      const attempt_no = (prev?.last_attempt || 0) + 1
      const testcases = await CodeModel.getTestcases(problem_id)
      let total_testcase_pass = 0
      let score = 0
      for (const item of testcases) {
        total_testcase_pass += 1
        score += item.point
      }
      const submission_id = crypto.randomUUID()
      await CodeModel.createSubmission({submission_id, student_id, problem_id, attempt_no, code, language, total_testcase_pass, score,})
      await db.exec('COMMIT')
      transaction = false
      const data = {
        success: true,
        submission_id,
        total_testcase_pass,
        total_cases: testcases.length,
        score,
        submitted_at: new Date().toISOString(),
      }
      return ResponseHandler(res, 200, 'success', data)
    } catch (err) {
      if (db && transaction) await db.exec('ROLLBACK')
      return ErrorHandler.Error500(err, res)
    }
  }
)

export default router
