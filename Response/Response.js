function ResponseHandler(res, statusCode=200, message, data) {
  return res.status(statusCode).json({
    success: true,
    message: message || 'success',
    data: data || null
  })
}

export default ResponseHandler
