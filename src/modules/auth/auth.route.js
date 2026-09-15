import { Router } from 'express'
import passport from '#config/oauthStrategy.js'
import authenticate from '#middlewares/auth.middleware.js'
import { validateBody } from '#middlewares/validator.middleware.js'
import asyncHandler from '#lib/asyncHandler.lib.js'
import * as validator from './auth.validator.js'
import * as controller from './auth.controller.js'

const router = Router()

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

router.get('/google/callback', passport.authenticate('google', { session: false }),
    asyncHandler(controller.handleGoogleCallback)
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

export default router