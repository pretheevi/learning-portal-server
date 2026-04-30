import ErrorHandler from "../Error/ErrorHandler.js"

class AdminAuthValidator {
  static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  static nameRegex = /^[A-Za-z ]{2,50}$/
  static secretKey = process.env.ADMIN_SECRET_KEY  // ✅ extra protection

  static signInValidate(req, res, next) {
    try {
      if (!req.body || typeof req.body !== 'object')
        return ErrorHandler.Error400(res, 'Invalid request')
      const { email, password } = req.body
      if (!email || !AdminAuthValidator.emailRegex.test(email))
        return ErrorHandler.Error400(res, 'Invalid email')
      if (!password || password.length < 8)
        return ErrorHandler.Error400(res, 'Invalid password')
      next()
    } catch (err) {
      next(err)
    }
  }

  static signUpValidate(req, res, next) {
    try {
      if (!req.body || typeof req.body !== 'object')
        return ErrorHandler.Error400(res, 'Invalid request')
      const { name, email, password, secret_key } = req.body

      // ✅ prevent random people from creating admin accounts
      if (!secret_key || secret_key !== AdminAuthValidator.secretKey)
        return ErrorHandler.Error400(res, 'Unauthorized')
      if (!name || !AdminAuthValidator.nameRegex.test(name))
        return ErrorHandler.Error400(res, 'Invalid name')
      if (!email || !AdminAuthValidator.emailRegex.test(email))
        return ErrorHandler.Error400(res, 'Invalid email')
      if (!password || password.length < 8)
        return ErrorHandler.Error400(res, 'Password must be at least 8 characters')
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default AdminAuthValidator
