export class ResponseHandler {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res,
    message = "Error",
    statusCode = 500,
    errorCode = null,
    details = null
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: errorCode,
        timestamp: new Date().toISOString(),
        ...(details && { details }),
      },
    });
  }
}
