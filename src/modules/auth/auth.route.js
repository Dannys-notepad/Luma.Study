import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from '#config/oauthStrategy.js'
import env from '#config/env.js'
import { tokenRepository } from '#database/repositories/index.js'
import authenticate from '#middlewares/auth.middleware.js'
import { validateBody } from '#middlewares/validator.middleware.js'
import AppError from '#lib/AppError.lib.js'
import AppResponse from '#lib/AppResponse.lib.js'
import asyncHandler from '#lib/asyncHandler.lib.js'
import { enqueueEmail } from '#queue/queues/mailer.queue.js'
import { addTimeFromNow } from '#lib/dateHelpers.js'
import { TokenType } from '#constants/model.constant.js'
import * as validator from './auth.validator.js'
import * as controller from './auth.controller.js'

const router = Router()

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw AppError.unauthorized('Authentication failed')
        }

        const tokenId = tokenRepository._collection([req.user.id]).doc().id

        const accessToken = jwt.sign(
            { uid: req.user.id, tokenId, type: TokenType.ACCESS },
            env.SECRET_KEY,
            { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
        )

        const refreshToken = jwt.sign(
            { uid: req.user.id, tokenId, type: TokenType.REFRESH },
            env.REFRESH_SECRET_KEY,
            { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
        )

        const expiresAt = addTimeFromNow(7, 'days')
        const addTokenToDb = await tokenRepository.create(req.user.id, tokenId, {
            expiresAt,
            revoked: false
        })

        if (!addTokenToDb) throw AppError.server('Could not save token session')

        let statusCode = 200
        let message = 'User authenticated successfully'

        if (req.user.isNewUser) {
            statusCode = 201
            message = 'User registered successfully'
            const payload = onBoardingEmailTemp(req.user.email, req.user.name)
            enqueueEmail(payload)
        }

        AppResponse.success(res, { accessToken, refreshToken, token: accessToken }, message, statusCode)
    })
)

// Local authentication endpoints
router.post('/register', validateBody(validator.registerSchema), asyncHandler(controller.handleRegister))
router.post('/verify-email', validateBody(validator.verifyEmailSchema), asyncHandler(controller.handleVerifyEmail))
router.post('/resend-verification', validateBody(validator.resendVerificationSchema), asyncHandler(controller.handleResendVerification))
router.post('/login', validateBody(validator.loginSchema), asyncHandler(controller.handleLogin))
router.post('/forgot-password', validateBody(validator.forgotPasswordSchema), asyncHandler(controller.handleForgotPassword))
router.post('/reset-password', validateBody(validator.resetPasswordSchema), asyncHandler(controller.handleResetPassword))

// Session management endpoints
router.post('/refresh', validateBody(validator.refreshTokenSchema), asyncHandler(controller.handleRefresh))
router.post('/logout', authenticate, asyncHandler(controller.handleLogout))

function onBoardingEmailTemp (email, name) {
    const mailMsg = `
    Hi ${name},

    Welcome to Luma.Study 👋

    Here's the idea: instead of scattered notes across your phone, drive, and Whatsapp chats, Luma.Study becomes your one lecture vault for the semester and an AI that actually knows what you were taught.

    How it works:

    1. Set Your Timetable: Add your lecture schedule so Luma knows which course you're in and when.

    2. Upload After Each Lecture: PDFs, docs, audio recordings, or even photos of the whiteboard. Add the lecture's name, topic, and any extra info. Luma reads and organizes it in the background.

    3. Ask Luma Anything: Before a test, open the chat and ask: "Generate possible questions from my Elementary Process notes, weeks 1-4" or "Summarize what Dr. Adeyemi covered on redox reactions". Luma answers strictly from what you've uploaded, no random internet guesses, just what you were actually taught. You could also make research with Luma on a particular topic, Luma has access to verified sources based on what you want to study or make research on.

    4. Upload Past Questions Too: Feed in old exam papers so Luma can spot patterns and generate realistic practice questions.

    By the end of the semester, you won't just have a pile of files, you'll have a study partner that has read everything you've read.

    [Set up your timetable ->]

    Let's make this semester easier.

    - The Luma.Study Team
    `

    return {
        to: email,
        subject: `Let's get your semester into Luma.Study`,
        text: mailMsg
    }
}

export default router