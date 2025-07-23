export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// errors/ValidationError.js
export class ValidationError extends AppError {
  constructor(message, field = null, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.field = field;
  }
}

// errors/AuthenticationError.js
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", details = null) {
    super(message, 401, "AUTH_ERROR", details);
  }
}

// errors/ConflictError.js
export class ConflictError extends AppError {
  constructor(message = "Resource conflict", details = null) {
    super(message, 409, "CONFLICT_ERROR", details);
  }
}

// errors/NotFoundError.js
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}
