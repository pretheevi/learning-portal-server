import ErrorHandler from "../Error/ErrorHandler.js";

class AuthValidator {
  static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static nameRegex = /^[A-Za-z ]{2,50}$/;

  static signInValidate(req, res, next) {
    try {
      console.log('sig in ',req.body)
      if (!req.body || typeof req.body !== 'object')
        return ErrorHandler.Error400(res, 'Invalid Credentials')
      const { email, password } = req.body
      if (!email || !AuthValidator.emailRegex.test(email))
        return ErrorHandler.Error400(res, "Invalid email")
      if (!password || password.length < 6) 
        return ErrorHandler.Error400(res, "Invalid password")
      next()
    } catch (err) {
      next(err)
    }
  }

  static signUpValidate(req, res, next) {
    try {
      console.log(req.body)
      if (!req.body || typeof req.body !== 'object')
        return ErrorHandler.Error400(res, "Invalid Credentials")
      const { name, email, password } = req.body
      if (!name || !AuthValidator.nameRegex.test(name)) 
        return ErrorHandler.Error400(res, "Invalid name")
      if (!email || !AuthValidator.emailRegex.test(email)) 
        return ErrorHandler.Error400(res, "Invalid email")
      if (!password || password.length < 6) 
        return ErrorHandler.Error400(res, "Password too short")
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default AuthValidator
