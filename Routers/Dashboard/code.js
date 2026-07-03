import express from 'express'
import crypto from 'crypto'
import db from '../../Database/connectDb.js'
import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import CodeModel from '../../Model/codeModel.js'
import ErrorHandler from '../../Error/ErrorHandler.js'
import ResponseHandler from '../../Response/Response.js'
import CodeAssignmentValidation from '../../Middleware/code.js'
const router = express.Router()

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

// Shared by /code/run and /code/submit — runs the given code against the
// given testcases using the problem's own language/function_name from the DB
// (never trusted from the client), returns per-testcase pass/fail results.
// async function runTestcasesForProblem(problem, code, testcases) {
//   const testCaseParsed = {}
//   testcases.forEach((item) => {
//     testCaseParsed[item.testcase_id] = JSON.parse(item.testcase_input)
//   })

//   const pistonCode = buildPistonCode(problem.language, code, problem.function_name, testCaseParsed)

//   const response = await fetch('http://localhost:2000/api/v2/execute', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       language: problem.language,
//       version: '*',
//       files: [{ content: pistonCode }],
//     }),
//   })
//   const data = await response.json()

//   // Whole-program crash (syntax error etc) — nothing ran at all
//   if (data.run?.code !== 0 && !data.run?.stdout) {
//     const errMsg = data.run?.stderr || data.compile?.stderr || 'Execution failed'
//     return testcases.map((item) => ({
//       testcase_id: item.testcase_id,
//       testcase_input: item.testcase_input,
//       testcase_expected_output: item.testcase_expected_output,
//       actual_output: errMsg,
//       passed: false,
//       point: item.point,
//     }))
//   }

//   let pistonResults = {}
//   try {
//     pistonResults = JSON.parse(data.run.stdout)
//   } catch {
//     pistonResults = {}
//   }

//   return testcases.map((item) => {
//     const raw = pistonResults[item.testcase_id]
//     const hasError = raw && typeof raw === 'object' && 'error' in raw
//     const missing = raw === undefined
//     const actual_output = missing ? 'No output' : hasError ? raw.error : String(raw)
//     const expected = String(item.testcase_expected_output).trim()
//     const passed = !hasError && !missing && actual_output.trim() === expected

//     return {
//       testcase_id: item.testcase_id,
//       testcase_input: item.testcase_input,
//       testcase_expected_output: item.testcase_expected_output,
//       actual_output,
//       passed,
//       point: item.point,
//     }
//   })
// }

import { runJavaScript } from "./lib/jsExecutor.js"
import { runPython } from './lib/pyExecutor.js'

async function runTestcasesForProblem(problem, code, testcases, language) {
  const testCaseParsed = {}
  testcases.forEach((item) => {
    testCaseParsed[item.testcase_id] = JSON.parse(item.testcase_input)
  })

  let runResult

  if (language === 'javascript') {
    runResult = await runJavaScript(code, problem.function_name, testCaseParsed)
  } else if (language === 'python') {
    runResult = await runPython(code, problem.function_name, testCaseParsed)
  } else {
    // still Piston for Python etc, until that executor is built
    const pistonCode = buildPistonCode(problem.language, code, problem.function_name, testCaseParsed)
    const response = await fetch('http://localhost:2000/api/v2/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: problem.language, version: '*', files: [{ content: pistonCode }] }),
    })
    const data = await response.json()
    runResult = data.run
  }

  if (runResult?.code !== 0 && !runResult?.stdout) {
    const errMsg = runResult?.stderr || 'Execution failed'
    return testcases.map((item) => ({
      testcase_id: item.testcase_id,
      testcase_input: item.testcase_input,
      testcase_expected_output: item.testcase_expected_output,
      actual_output: errMsg,
      passed: false,
      point: item.point,
    }))
  }

  let results = {}
  try {
    results = JSON.parse(runResult.stdout)
  } catch {
    results = {}
  }

  return testcases.map((item) => {
    const raw = results[item.testcase_id]
    const hasError = raw && typeof raw === 'object' && 'error' in raw
    const missing = raw === undefined
    const actual_output = missing ? 'No output' : hasError ? raw.error : String(raw)
    const expected = String(item.testcase_expected_output).trim()
    const passed = !hasError && !missing && actual_output.trim() === expected
    return {
      testcase_id: item.testcase_id,
      testcase_input: item.testcase_input,
      testcase_expected_output: item.testcase_expected_output,
      actual_output,
      passed,
      point: item.point,
    }
  })
}


router.post('/code/run', Jsonwebtoken.verify, CodeAssignmentValidation.runCode, async (req, res) => {
  try {
    const { problem_id, code, language } = req.body
    console.log(req.body)
    const problem = await CodeModel.getProblem(problem_id)
    if (!problem) return ErrorHandler.Error400(res, 'Problem not found')

    const allTestcases = await CodeModel.getTestcases(problem_id)
    const testcases = allTestcases.slice(0, 2) // Run uses a sample subset

    const results = await runTestcasesForProblem(problem, code, testcases, language)
    console.log(results)
    return ResponseHandler(res, 200, 'success', results)
  } catch (err) {
    return ErrorHandler.Error500(err, res)
  }
}
)

router.post('/code/submit', Jsonwebtoken.verify, CodeAssignmentValidation.submitCode, async (req, res) => {
  try {
    const { problem_id, code } = req.body
    const student_id = req.token.student_id

    const problem = await CodeModel.getProblem(problem_id)
    if (!problem) return ErrorHandler.Error400(res, 'Problem not found')

    const prev = await CodeModel.getLastAttempt(student_id, problem_id)
    const attempt_no = (prev?.last_attempt || 0) + 1

    // Submit always runs the FULL testcase set, not the Run subset
    const testcases = await CodeModel.getTestcases(problem_id)
    const results = await runTestcasesForProblem(problem, code, testcases)

    let total_testcase_pass = 0
    let score = 0
    for (const r of results) {
      if (r.passed) {
        total_testcase_pass += 1
        score += r.point
      }
    }

    const submission_id = crypto.randomUUID()
    // Single write — no manual transaction needed. Raw BEGIN/COMMIT/ROLLBACK
    // isn't reliable over Turso's HTTP transport anyway.
    await CodeModel.createSubmission({
      submission_id,
      student_id,
      problem_id,
      attempt_no,
      code,
      language: problem.language,
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
      results, // full per-testcase breakdown, for the frontend Results tab
    }
    return ResponseHandler(res, 200, 'success', data)
  } catch (err) {
    return ErrorHandler.Error500(err, res)
  }
}
)

export default router
