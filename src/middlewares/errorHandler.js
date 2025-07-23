import { AppError } from "../utils/errors/errors.js";
import { ErrorHandler } from "../utils/errors/ErrorHandler.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;
  console.log(error);

  // Handle Mongoose errors
  if (
    err.name === "MongoError" ||
    err.name === "MongoServerError" ||
    err.code === 11000
  ) {
    error = ErrorHandler.handleMongoError(err);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    error = ErrorHandler.handleMongoError(err);
  }

  // Ensure we have an AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      "Something went wrong",
      500,
      "SERVER_ERROR",
      process.env.NODE_ENV === "development"
        ? { originalError: err.message, stack: err.stack }
        : null
    );
  }

  // Log error (in production, use proper logging service)
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      details: error.details,
      stack: error.stack,
    });
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      code: error.errorCode,
      timestamp: error.timestamp,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  });
};

// middleware/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
