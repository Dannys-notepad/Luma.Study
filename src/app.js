import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();


// Request logger
app.use(logRequests)

// General Rate Limiter (Applied globally)
app.set('trust proxy', 1)
app.use(globalRateLimiter)

// Middlewares
app.use(express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'] 
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTION'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400
}))
app.options('*', cors())
app.use(helmet({
    contentSecurityPolicy: false // Allows inline Swagger UI scripts
}))

// Passport initialization
app.use(passport.initialize())

// root route for render calling
// this route is currently unreachable.
app.get('/', async (req, res) => {
    res.json({status: 'ok'})
})

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Custom health route
app.use('/health', health)

// API routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/courses', courseRoute)
app.use('/api/course', courseRoute)

// Custom error middlewares
app.use(err404)
app.use(errorHandler)

export default app