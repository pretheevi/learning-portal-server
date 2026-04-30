import rateLimit from 'express-rate-limit';
import ErrorHandler from '../Error/ErrorHandler.js';
class AuthLimiter {
  static signin = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, options) => {
      return ErrorHandler.Error429(req, res, options);
    },
  })
  
  static signup = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, options) => {
      return ErrorHandler.Error429(req, res, options);
    },
  })
}

export default AuthLimiter
