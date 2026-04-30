import joi from 'joi';
import bcrypt from 'bcrypt';
import ErrorHandler from '../Error/ErrorHandler.js';

class Bcrypt {
  static passwordSchema = joi.object({
    password: joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
      })
  });

  static async hashPassword(req, res, next) {
    try {
      const { error } = Bcrypt.passwordSchema.validate(req.body, { abortEarly: true });
      if (error) return ErrorHandler.Error400(res, error.details[0].message);
      const { password } = req.body;
      const salt = 10;
      const password_hash = await bcrypt.hash(password, salt);
      delete req.body.password;
      req.body.password_hash = password_hash;
      next();
    } catch (err) {
      next(err);
    }
  }
}

export default Bcrypt
