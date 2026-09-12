import rateLimit from 'express-rate-limit'
import AppError from '#lib/AppError.lib.js'

/**
 * General Rate Limiter Middleware
 * Restricts client IP addresses to 100 requests per 15 minutes window.
 */
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,               // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
        next(AppError.rateLimited('Too many requests, please try again later.'))
    }
})

export default globalRateLimiter
