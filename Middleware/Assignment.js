import ErrorHandler from "../Error/ErrorHandler.js";

class AssignmentValidation{
  static getAssignment(req, res, next) {
      const validTypes = ['quiz', 'coding']
      const validLanguages = ['html', 'css', 'javascript', 'linux', 'os', 'github', 'react', 'node', 'sqlite', 'aptitude']
      const { assignmentType, language, limit, offset } = req.query

      if (!assignmentType || !validTypes.includes(assignmentType))
        return ErrorHandler.Error400(res, 'Invalid Assignment Type')

      if (!language || !validLanguages.includes(language))
        return ErrorHandler.Error400(res, 'Invalid Language')

      if (!limit || !offset || Number(limit) <= 0 || Number(offset) < 0)
        return ErrorHandler.Error400(res, 'Invalid Pagination Values')

      next()
  }

  static assignmentIdValidate(req, res, next) {
    const { id } = req.params
    if (!id) return ErrorHandler.Error400(res, 'Assignment id is required')
    next()
  }

  static assignmentSubmitValidation(req, res, next) {
    if (!req.body || !(typeof req.body === 'object'))
      return ErrorHandler.Error400(res, 'Invalid Credentials')
    const { assignment_id } = req.params
    const { quiz_score } = req.body
    if (!assignment_id || !quiz_score && quiz_score !== 0)
      return ErrorHandler.Error400(res, 'assignment_id and quiz_score are required')

    next()
  }
}

export default AssignmentValidation
