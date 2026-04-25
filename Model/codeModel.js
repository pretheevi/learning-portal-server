import connectDb from '../Database/connectDb.js'
class CodeModel {
  static async getProblem(problemId) {
    const db = await connectDb()

    return await db.get(
      `
      SELECT
        problem_id,
        assignment_id,
        title,
        description,
        language,
        difficulty,
        created_at
      FROM coding_problems
      WHERE assignment_id = ?`,
      [problemId]
    )
  }

  static async getExamples(problemId) {
    const db = await connectDb()

    return await db.all(
      `
      SELECT
        example_id,
        example_input,
        example_output,
        explanation,
        order_num
      FROM coding_problem_examples
      WHERE problem_id = ?
      ORDER BY order_num ASC
      `,
      [problemId]
    )
  }

  static async getTestcases(problemId) {
    const db = await connectDb()

    return await db.all(
      `
      SELECT
        testcase_id,
        testcase_input,
        testcase_expected_output,
        point,
        is_hidden
      FROM coding_problem_testcases
      WHERE problem_id = ?
      ORDER BY rowid ASC
      `,
      [problemId]
    )
  }

  static async getTestcaseCount(problemId) {
    const db = await connectDb()

    return await db.get(
      `
      SELECT COUNT(*) AS total_cases
      FROM coding_problem_testcases
      WHERE problem_id = ?
      `,
      [problemId]
    )
  }

  static async getLastAttempt(studentId, problemId) {
    const db = await connectDb()

    return await db.get(
      `
      SELECT MAX(attempt_no) AS last_attempt
      FROM code_submissions
      WHERE student_id = ?
      AND problem_id = ?
      `,
      [studentId, problemId]
    )
  }

  static async createSubmission(data) {
    const db = await connectDb()

    return await db.run(
      `
      INSERT INTO code_submissions (
        submission_id,
        student_id,
        problem_id,
        attempt_no,
        code,
        language,
        total_testcase_pass,
        score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.submission_id,
        data.student_id,
        data.problem_id,
        data.attempt_no,
        data.code,
        data.language,
        data.total_testcase_pass,
        data.score,
      ]
    )
  }
}

export default CodeModel
