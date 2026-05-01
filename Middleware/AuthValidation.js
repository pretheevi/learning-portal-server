import joi from "joi"
import ErrorHandler from "../Error/ErrorHandler.js"

class AuthValidator {
  // Joi schemas
  static signInSchema = joi.object({
    email: joi.string().email().required().messages({
      'string.email': 'Invalid email',
      'any.required': 'Email is required'
    }),
    password: joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  })

  static signUpSchema = joi.object({
    name: joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: joi.string().email().required().messages({
      'string.email': 'Invalid email',
      'any.required': 'Email is required'
    }),
    password: joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  })

  static signInValidate(req, res, next) {
    try {
      const { error } = AuthValidator.signInSchema.validate(req.body, { abortEarly: true })
      if (error) return ErrorHandler.Error400(res, error.details[0].message);
      next()
    } catch (err) {
      next(err)
    }
  }

  static signUpValidate(req, res, next) {
    try {
      const { error } = AuthValidator.signUpSchema.validate(req.body, { abortEarly: true })
      if (error) return ErrorHandler.Error400(res, error.details[0].message)
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default AuthValidator
