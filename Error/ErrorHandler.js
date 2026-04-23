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
}

export default ErrorHandler
