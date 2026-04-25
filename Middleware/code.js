import ErrorHandler from '../Error/ErrorHandler.js'

class CodeAssignmentValidation {
  static getProblem(req, res, next) {
    try {
      const { problem_id } = req.params  // was: problemId
      if (!problem_id || typeof problem_id !== 'string') return ErrorHandler.Error400(res, 'Invalid problem id')
      next()
    } catch (err) { return ErrorHandler.Error500(err, res) }
  }

  static runCode(req, res, next) {
    try {
      const { problem_id, code, language } = req.body
      if (!problem_id || typeof problem_id !== 'string') return ErrorHandler.Error400(res, 'Invalid problem id')
      if (!code || typeof code !== 'string' || !code.trim()) return ErrorHandler.Error400(res, 'Code is required')
      if (!language || typeof language !== 'string') return ErrorHandler.Error400(res, 'Language is required')
      if (!['javascript', 'python', 'java'].includes(language)) return ErrorHandler.Error400(res, 'Unsupported language')
      next()
    } catch (err) {return ErrorHandler.Error500(err, res)}
  }

  static submitCode(req, res, next) {
    try {
      const { problem_id, code, language } = req.body
      if (!problem_id || typeof problem_id !== 'string') return ErrorHandler.Error400(res, 'Invalid problem id')
      if (!code || typeof code !== 'string' || !code.trim()) return ErrorHandler.Error400(res, 'Code is required')
      if (code.length > 100000) return ErrorHandler.Error400(res, 'Code too large')
      if (!language || typeof language !== 'string') return ErrorHandler.Error400(res, 'Language is required')
      if (!['javascript', 'python', 'java'].includes(language)) return ErrorHandler.Error400(res, 'Unsupported language')
      next()
    } catch (err) {return ErrorHandler.Error500(err, res)}
  }

  static listProblems(req, res, next) {
    try {
      const { assignment_id, difficulty, page, limit } = req.query
      if (assignment_id && typeof assignment_id !== 'string') return ErrorHandler.Error400(res, 'Invalid assignment id')
      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty))return ErrorHandler.Error400(res, 'Invalid difficulty')
      if (page && (!Number.isInteger(Number(page)) || Number(page) < 1))return ErrorHandler.Error400(res, 'Invalid page')
      if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1))return ErrorHandler.Error400(res, 'Invalid limit')
      next()
    } catch (err) {return ErrorHandler.Error500(err, res)}
  }

  static submissionHistory(req, res, next) {
    try {
      const { problem_id } = req.params  // was: problemId
      const { page, limit } = req.query
      if (!problem_id || typeof problem_id !== 'string') return ErrorHandler.Error400(res, 'Invalid problem id')
      if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) return ErrorHandler.Error400(res, 'Invalid page')
      if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1)) return ErrorHandler.Error400(res, 'Invalid limit')
      next()
    } catch (err) { return ErrorHandler.Error500(err, res) }
  }
}

export default CodeAssignmentValidation
