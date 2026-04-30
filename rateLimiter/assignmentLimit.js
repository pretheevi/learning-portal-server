import limiter from 'express-rate-limit'
import ErrorHandler from '../Error/ErrorHandler.js'

class AssignmentLimit {
  static getAssignment = limiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, options) => {
      return ErrorHandler.Error429(req, res, options);
    },
  })

  static submitAssignment = limiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, options) => {
      return ErrorHandler.Error429(req, res, options);
    },
  })  
}


export default AssignmentLimit
