import db from "../Database/connectDb.js";
import crypto from 'crypto'

class QuizQuestionsModel{
  static async getQuizQuestions(id) {
    const query = `
      SELECT *
      FROM quiz_questions
      WHERE assignment_id = ?
      ORDER BY order_num ASC;
    `
    try{
        const result = await db.all(query, [id])
        return result
    } catch (err) {
      throw err
    }
  }

  static async quizSubmission(student_id, question_id, selected_option, is_correct, points_earned) {
    const submission_id = crypto.randomUUID()
    const query = `
      INSERT INTO quiz_submissions(submission_id, student_id, question_id, attempt_no, selected_option, is_correct, points_earned, submitted_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `
    let attempt_no
    try{
      const row = await db.get(
        'SELECT attempt_no FROM quiz_submissions WHERE student_id = ? AND question_id = ? ORDER BY attempt_no DESC LIMIT 1',
        [student_id, question_id]
      )
      attempt_no = row ? row.attempt_no + 1: 1
    } catch (err) {
      throw err
    }

    try {
      await db.run(query, [submission_id, student_id, question_id, attempt_no, selected_option, is_correct, points_earned])
    } catch (err) {
      throw err
    }
  }

}

export default QuizQuestionsModel
