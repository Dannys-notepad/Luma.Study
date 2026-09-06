const ErrorCodes = {
    1: 'BAD_REQUEST',
    2: 'UNAUTHORIZED',
    3: 'FORBIDDEN',
    4: 'NOT_FOUND',
    5: 'CONFLICT',
    6: 'VALIDATION_ERROR',
    7: 'RATE_LIMITED',
    8: 'SERVER_ERROR'
}

class AppError extends Error {
    constructor (message, statusCode = 500, code = ErrorCodes[8], details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest (message, details) {
        return new AppError(message, 400, ErrorCodes[1], details)
    }

    static unauthorized (message = 'Unauthorized') {
        return new AppError(message, 401, ErrorCodes[2])
    }

    static forbidden (message = 'Forbidden') {
        return new AppError(message, 403, ErrorCodes[3])
    }

    static notFound (message = 'Resource not found') {
        return new AppError(message, 404, ErrorCodes[4])
    }

    static confilct (message = 'Resource already exists') {
        return new AppError(message, 409, ErrorCodes[5])
    }

    static validation (message = 'Validation failed') {
        return new AppError(message, 422, ErrorCodes[6])
    }

    static rateLimited (message = 'Too many requests') {
        return new AppError(message, 429, ErrorCodes[7])
    }

    static server (message = 'Internal server error', details = null) {
        return new AppError(message, 500, ErrorCodes[8], details)
    }
}

export default AppError;