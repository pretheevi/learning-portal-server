import joi from 'joi';
import ErrorHandler from "../Error/ErrorHandler.js";

class AssignmentValidation {
  // Joi schemas
  static getAssignmentSchema = joi.object({
    assignmentType: joi.string()
      .valid('quiz', 'coding')
      .required()
      .messages({
        'any.only': 'Invalid Assignment Type',
        'any.required': 'Assignment type is required'
      }),
    skill_type: joi.string()
      .valid('html', 'css', 'javascript', 'linux', 'os', 'github', 'react', 'node', 'sqlite', 'aptitude')
      .required()
      .messages({
        'any.only': 'Invalid Skill Type',
        'any.required': 'Skill type is required'
      }),
    limit: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.positive': 'Limit must be greater than 0',
        'any.required': 'Limit is required'
      }),
    offset: joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Offset must be 0 or greater',
        'any.required': 'Offset is required'
      })
  });

  static assignmentIdSchema = joi.object({
    id: joi.string()
      .required()
      .messages({
        'any.required': 'Assignment id is required'
      })
  });

  static assignmentSubmitSchema = joi.object({
    assignment_id: joi.string()
      .required()
      .messages({
        'any.required': 'assignment_id is required'
      }),
    quiz_score: joi.number()
      .required()
      .messages({
        'any.required': 'quiz_score is required'
      })
  });

  static getAssignment(req, res, next) {
    try {
      const { error } = AssignmentValidation.getAssignmentSchema.validate(req.query, { abortEarly: true });
      if (error)
        return ErrorHandler.Error400(res, error.details[0].message);
      next();
    } catch (err) {
      next(err);
    }
  }

  static assignmentIdValidate(req, res, next) {
    try {
      const { error } = AssignmentValidation.assignmentIdSchema.validate(req.params, { abortEarly: true });
      if (error)
        return ErrorHandler.Error400(res, error.details[0].message);
      next();
    } catch (err) {
      next(err);
    }
  }

  static assignmentSubmitValidation(req, res, next) {
    try {
      const data = {
        assignment_id: req.params.assignment_id,
        quiz_score: req.body.quiz_score
      };
      const { error } = AssignmentValidation.assignmentSubmitSchema.validate(data, { abortEarly: true });
      if (error)
        return ErrorHandler.Error400(res, error.details[0].message);
      next();
    } catch (err) {
      next(err);
    }
  }
}

export default AssignmentValidation
