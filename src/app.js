import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Passport oauth import
import passport from '#config/oauthStrategy.js'

// Swagger documentation import
import { swaggerUi, swaggerSpec } from '#config/swagger.js'

// Custom middleware imports
import errorHandler from '#middlewares/errorHandler.middleware.js';
import err404 from '#middlewares/404.middleware.js';
import logRequests from '#middlewares/requestLogger.middleware.js'
import globalRateLimiter from '#middlewares/rateLimiter.middleware.js'

// Custom route imports
import health from '#modules/health/health.route.js'
import authRoute from '#modules/auth/auth.route.js'
import userRoute from '#modules/user/user.route.js'
import courseRoute from '#modules/course/course.route.js'

const app = express();

// Request logger
app.use(logRequests)

// General Rate Limiter (Applied globally)
app.use(globalRateLimiter)

// Middlewares
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet({
    contentSecurityPolicy: false // Allows inline Swagger UI scripts
}))

// Passport initialization
app.use(passport.initialize())

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Custom health route
app.use('/health', health)

// API routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/course', courseRoute)

// Custom error middlewares
app.use(err404)
app.use(errorHandler)

export default app