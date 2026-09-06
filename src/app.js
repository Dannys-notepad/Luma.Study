import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// custom middleware imports

import errorHandler from '#middlewares/errorHandler.middleware.js';
import err404 from '#middlewares/404.middleware.js';
import logRequests from '#middlewares/requestLogger.middleware.js'

// custom route imports

import health from '#modules/health/health.route.js'
import authRoute from '#modules/auth/auth.route.js'

const app = express();

app.use(logRequests)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))

app.use(cors())
app.use(helmet())

// custom health route
app.use('/health', health)

// api routes
app.use('/api/auth', authRoute)


// custom error middlewares

app.use(err404)
app.use(errorHandler)

export default app