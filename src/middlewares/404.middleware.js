import AppError from "#lib/AppError.lib.js";

const err404 = (req, res, next) => {
    next( new AppError().notFound(`Route not found: ${req.originalUrl}`) )
}

export default err404;