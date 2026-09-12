import AppError from "#lib/AppError.lib.js";

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            console.error('Validation failed', result)
            return next(AppError.badRequest('Validation failed', result.error.flatten().fieldErrors))
        }

        req.body = result.data
        next()
    }
}

export const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params)

        if (!result.success) {
            console.error('Route params validation failed', result)
            return next(AppError.badRequest('Invalid route parameters', result.error.flatten().fieldErrors))
        }

        req.params = result.data
        next()
    }
}

export const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query)

        if (!result.success) {
            console.error('Query params validation failed', result)
            return next(AppError.badRequest('Invalid query parameters', result.error.flatten().fieldErrors))
        }

        req.query = result.data
        next()
    }
}