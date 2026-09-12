import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Passport oauth import
import passport from '#config/oauthStrategy.js'

// Custom middleware imports
import errorHandler from '#middlewares/errorHandler.middleware.js';
import err404 from '#middlewares/404.middleware.js';
import logRequests from '#middlewares/requestLogger.middleware.js'

// Custom route imports
import health from '#modules/health/health.route.js'
import authRoute from '#modules/auth/auth.route.js'
import userRoute from '#modules/user/user.route.js'

const app = express();

// Request logger
app.use(logRequests)

// Middlewares
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())

// Passport initialization
app.use(passport.initialize())

// Custom health route
app.use('/health', health)

// API routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)


// Custom error middlewares
app.use(err404)
app.use(errorHandler)

export default app