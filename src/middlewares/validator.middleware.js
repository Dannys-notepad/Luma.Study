import AppError from "#lib/AppError.lib.js";

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            console.error('Validation failed', result)
            return next(new AppError.badRequest('Validation failed', result.error.flatten().fieldErrors))
        }

        req.body = result.data
        next()
    }
}