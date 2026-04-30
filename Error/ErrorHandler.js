class ErrorHandler{
  static Error500(err, res) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

  static Error400(res, message=null) {
    return res.status(400).json({
      success: false,
      message: message || 'Invalid Credentials'
    })
  }

  static Error429(req, res, options) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      retryAfter: req.rateLimit?.resetTime
    })
  }
}

export default ErrorHandler
