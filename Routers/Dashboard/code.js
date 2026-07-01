import express from 'express'
import crypto from 'crypto'
import db from '../../Database/connectDb.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import CodeModel from '../../Model/codeModel.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import CodeAssignmentValidation from '../../Middleware/code.js'
const router = express.Router()

// NEW: list all problems under a coding assignment (feeds the problem-list page)
router.get('/coding-assignment/:assignment_id/problems', Jsonwebtoken.verify, async (req, res) => {
  try {
    const { assignment_id } = req.params

    const assignment = await db.get(
      `SELECT assignment_id, title, skill_type, type FROM assignments WHERE assignment_id = ?`,
      [assignment_id]
    )
    if (!assignment) return ErrorHandler.Error400(res, 'Assignment not found')

    const problems = await db.all(
      `SELECT problem_id, title, difficulty FROM coding_problems WHERE assignment_id = ?`,
      [assignment_id]
    )

    const data = { assignment, problems }
    return ResponseHandler(res, 200, 'success', data)
  } catch (err) {
    return ErrorHandler.Error500(err, res)
  }
})

router.get('/coding-problem/:problem_id', Jsonwebtoken.verify, CodeAssignmentValidation.getProblem, async (req, res) => {
  try {
    const { problem_id } = req.params
    const problem = await CodeModel.getProblem(problem_id)
    console.log('problem', problem)
    if (!problem) return ErrorHandler.Error400(res, 'Problem not found')
    console.log('problem', problem)
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

function buildPistonCode(language, code, functionName, testCaseParsed) {
  if (language === 'python') {
    // No leading whitespace on top-level lines — Python treats indentation
    // as syntax, unlike JS where it's cosmetic.
    return `
${code}
import json
testcase = ${JSON.stringify(testCaseParsed)}
results = {}
for testcase_id, input in testcase.items():
    try:
        output = ${functionName}(*input["args"])
        results[testcase_id] = output
    except Exception as e:
        results[testcase_id] = {"error": str(e)}
print(json.dumps(results))
`
  }

  // Default: javascript
  return `
    ${code}
          const testcase = ${JSON.stringify(testCaseParsed)}
          const results = {}
            for (const [testcase_id, input] of Object.entries(testcase)) {
              try {
                const output = ${functionName}(...input.args);
                results[testcase_id] = output === undefined ? null : output;
              } catch (err) {
                results[testcase_id] = {
                  error: err.message,
                };
              }
            }
            console.log(JSON.stringify(results));
          `
}

router.post('/code/run', Jsonwebtoken.verify, CodeAssignmentValidation.runCode, async (req, res) => {
  try {
    const { problem_id } = req.body
    const allTestcases = await CodeModel.getTestcases(problem_id)
    const testcases = allTestcases.slice(0, 2)
    const testCaseParsed = {}
    testcases.forEach((item) => {
      testCaseParsed[item.testcase_id] = JSON.parse(item.testcase_input)
    })

    const pistonCode = buildPistonCode(req.body.language, req.body.code, req.body.function_name, testCaseParsed)

    const response = await fetch('http://localhost:2000/api/v2/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: req.body.language,
        version: '*',
        files: [{ content: pistonCode }],
      }),
    })
    const data = await response.json()
    console.log('piston response', data)

    // Whole-program crash (syntax error etc) — nothing ran at all
    if (data.run?.code !== 0 && !data.run?.stdout) {
      const errMsg = data.run?.stderr || data.compile?.stderr || 'Execution failed'
      const results = testcases.map((item) => ({
        testcase_input: item.testcase_input,
        testcase_expected_output: item.testcase_expected_output,
        actual_output: errMsg,
        passed: false,
      }))
      return ResponseHandler(res, 200, 'success', results)
    }

    let pistonResults = {}
    try {
      pistonResults = JSON.parse(data.run.stdout)
    } catch {
      pistonResults = {}
    }

    const results = testcases.map((item) => {
      const raw = pistonResults[item.testcase_id]
      const hasError = raw && typeof raw === 'object' && 'error' in raw
      const missing = raw === undefined
      const actual_output = missing ? 'No output' : hasError ? raw.error : String(raw)
      const expected = String(item.testcase_expected_output).trim()
      const passed = !hasError && !missing && actual_output.trim() === expected

      return {
        testcase_input: item.testcase_input,
        testcase_expected_output: item.testcase_expected_output,
        actual_output,
        passed,
      }
    })

    return ResponseHandler(res, 200, 'success', results)
  } catch (err) {
    return ErrorHandler.Error500(err, res)
  }
}
)

router.post('/code/submit', Jsonwebtoken.verify, CodeAssignmentValidation.submitCode, async (req, res) => {
  try {
    const { problem_id, code, language } = req.body
    const student_id = req.user.student_id

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
    // Single write — no manual transaction needed. Raw BEGIN/COMMIT/ROLLBACK
    // isn't reliable over Turso's HTTP transport anyway (see jsCodeSeed.js notes).
    await CodeModel.createSubmission({
      submission_id,
      student_id,
      problem_id,
      attempt_no,
      code,
      language,
      total_testcase_pass,
      score,
    })

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
    return ErrorHandler.Error500(err, res)
  }
}
)

export default router




function solve(a, b){
  return a + b
}

const testcase = {"c0a33ade-53c1-4289-a7d3-2cd7f00230ee":{"args":["hello"]},"566c26c0-b6b2-441d-bfb3-1509fb52f139":{"args":["JavaScript"]},"59f3ac0d-8b2b-42f8-a69f-825583fa0275":{"args":["abc"]},"2291295d-e98e-479d-aed4-7bf1f2e9638d":{"args":["a"]},"490026a2-b24a-4cc2-ba1d-f681f3e74f70":{"args":["racecar"]},"1ebe9f66-5faa-44f2-b2ed-0c504e63b89e":{"args":["12345"]},"b40fe8f8-f420-4bda-bfd6-db07e46b2bf6":{"args":["Node"]},"eef4bd62-b7b4-4d30-8e09-42863e67f851":{"args":["x"]}}

const results = {}

for (const [testcase_id, input] of Object.entries(testcase)) {
  const args = input.args
  const result = solve(...args)
  results[testcase_id] = result
}
