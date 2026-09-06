//import AppError from "#lib/AppError.lib.js";
import AppResponse from "#lib/AppResponse.lib.js";

const errorHandler = (err, req, res, next) => {

    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    const message = err.isOperational ? err.message : 'Internal Server Error';
    const details = err.details || null;

    console.log({err, path: req.originalUrl, method: req.method}, 'Request error')

    AppResponse.error(res, message, statusCode, code, details)
}

export default errorHandler