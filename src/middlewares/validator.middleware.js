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

export const validateFiles = (schema, { required = true } = {}) => {
    return (req, res, next) => {
        const files = req.files || []
        if (files.length === 0 && required) {
            return next(AppError.badRequest('No uploaded file provided'))
        }

        for (const file of files) {
            const result = schema.safeParse(file)

            if (!result.success) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Failed to delete rejected upload', err)
                    })
                }

                return next(AppError.badRequest('Invalid file', result.error.flatten().fieldErrors))
            }
        }

        next()
    }
}