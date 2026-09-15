import jwt from 'jsonwebtoken'
import env from '#config/env.js'
import AppError from '#lib/AppError.lib.js'
import { sanitizeUserResponse } from '#lib/responseSanitizer.lib.js'
import { addTimeFromNow, hasExpired } from '#lib/dateHelpers.js'
import { hashPassword, comparePassword, generateOtp } from '#lib/password.lib.js'
import { userRepository, tokenRepository } from '#database/repositories/index.js'
import { TokenType, AuthProvider } from '#constants/model.constant.js'
import { enqueueEmail } from '#queue/queues/mailer.queue.js'

/**
 * @param {string} message
 * @param {any} [details]
 * @param {number} [code]
 * @returns {{ message: string, details: any, code?: number }}
 */
function response (message, details = null, code = 200) {
    return { message, details, code }
}

/**
 * @param {unknown} err
 * @returns {null | Error | { message: string }}
 */
function unwrapErrorDetails (err) {
    if (err instanceof Error) {
        return err
    }
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        return { message: err.message }
    }
    return { message: String(err) }
}

/**
 * @param {string} email
 * @param {string} name
 */
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

export const googleCallback = async (user) => {
    try {
        if (!user?.id) {
            throw AppError.unauthorized('Authentication failed')
        }

        const tokenId = tokenRepository._collection([user.id]).doc().id

        const accessToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.ACCESS },
            env.SECRET_KEY,
            { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
        )

        const refreshToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.REFRESH },
            env.REFRESH_SECRET_KEY,
            { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
        )

        const expiresAt = addTimeFromNow(7, 'days')
        const addTokenToDb = await tokenRepository.create(user.id, tokenId, {
            expiresAt,
            revoked: false
        })

        if (!addTokenToDb) throw AppError.server('Could not save token session')

        let statusCode = 200
        let message = 'User authenticated successfully'

        if (user.isNewUser) {
            statusCode = 201
            message = 'User registered successfully'
            const payload = onBoardingEmailTemp(user.email, user.name)
            enqueueEmail(payload)
        }

        return response(message, { accessToken, refreshToken, user: sanitizeUserResponse(user) }, statusCode)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong signing user in with Google Oauth method', unwrapErrorDetails(error))
    }
}

/**
 * Registers a new local user with email & password.
 * Generates 6-digit verification OTP and enqueues confirmation email.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const registerUser = async (name, email, password) => {
    try {
        const existingUser = await userRepository.findByEmail(email)
        if (existingUser) {
            if (existingUser.authProvider === AuthProvider.GOOGLE && !existingUser.hashedPassword) {
                throw AppError.conflict('An account with this email exists via Google Sign-In. Please log in with Google.')
            }
            throw AppError.conflict('An account with this email address already exists.')
        }

        const hashedPassword = await hashPassword(password)
        const verificationCode = generateOtp()
        const expiresAt = addTimeFromNow(24, 'hours')

        const newUser = await userRepository.create({
            name,
            email,
            hashedPassword,
            authProvider: AuthProvider.EMAIL,
            emailIsVerified: false,
            emailVerificationToken: verificationCode,
            emailVerificationExpiresAt: expiresAt,
            onBoardingCompleted: false
        })

        if (!newUser) throw AppError.server('Could not create user account')

        enqueueEmail({
            to: email,
            subject: 'Verify your Luma.Study account',
            text: `Hi ${name},\n\nWelcome to Luma.Study! Your email verification code is: ${verificationCode}\n\nThis code will expire in 24 hours.\n\n- The Luma.Study Team`
        })

        return response('Registration successful. Please check your email for your verification code.', { userId: newUser.id })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong during registration', unwrapErrorDetails(error))
    }
}

/**
 * Verifies email using 6-digit OTP code and returns dual JWT tokens.
 *
 * @param {string} email
 * @param {string} code
 */
export const verifyUserEmail = async (email, code) => {
    try {
        const user = await userRepository.findByEmail(email)
        if (!user) throw AppError.notFound('User account not found')

        if (user.emailIsVerified) {
            return response('Email address is already verified', { isVerified: true })
        }

        if (user.emailVerificationToken !== code || hasExpired(user.emailVerificationExpiresAt)) {
            throw AppError.badRequest('Invalid or expired verification code')
        }

        const updatedUser = await userRepository.update(user.id, {
            emailIsVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiresAt: null
        })

        if (!updatedUser) throw AppError.server('Failed to update email verification status')

        const tokenId = tokenRepository._collection([user.id]).doc().id
        const accessToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.ACCESS },
            env.SECRET_KEY,
            { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
        )
        const refreshToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.REFRESH },
            env.REFRESH_SECRET_KEY,
            { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
        )

        const sessionExpiresAt = addTimeFromNow(7, 'days')
        await tokenRepository.create(user.id, tokenId, {
            expiresAt: sessionExpiresAt,
            revoked: false
        })

        return response('Email address verified successfully', {
            accessToken,
            refreshToken,
            user: sanitizeUserResponse(updatedUser)
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong verifying email', unwrapErrorDetails(error))
    }
}

/**
 * Resends email verification code to user.
 *
 * @param {string} email
 */
export const resendVerificationCode = async (email) => {
    try {
        const user = await userRepository.findByEmail(email)
        if (!user || user.emailIsVerified) {
            return response('If an unverified account exists for this email, a new verification code has been sent.')
        }

        const verificationCode = generateOtp()
        const expiresAt = addTimeFromNow(24, 'hours')

        await userRepository.update(user.id, {
            emailVerificationToken: verificationCode,
            emailVerificationExpiresAt: expiresAt
        })

        enqueueEmail({
            to: email,
            subject: 'Verify your Luma.Study account',
            text: `Hi ${user.name},\n\nYour new email verification code is: ${verificationCode}\n\nThis code will expire in 24 hours.\n\n- The Luma.Study Team`
        })

        return response('Verification code sent successfully')
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong resending verification code', unwrapErrorDetails(error))
    }
}

/**
 * Authenticates user with email & password and returns dual tokens.
 *
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
    try {
        const user = await userRepository.findByEmail(email)
        if (!user || !user.hashedPassword) {
            throw AppError.unauthorized('Invalid email or password')
        }

        const passwordMatches = await comparePassword(password, user.hashedPassword)
        if (!passwordMatches) {
            throw AppError.unauthorized('Invalid email or password')
        }

        if (!user.emailIsVerified) {
            throw AppError.forbidden('Please verify your email address before logging in')
        }

        const tokenId = tokenRepository._collection([user.id]).doc().id
        const accessToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.ACCESS },
            env.SECRET_KEY,
            { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
        )
        const refreshToken = jwt.sign(
            { uid: user.id, tokenId, type: TokenType.REFRESH },
            env.REFRESH_SECRET_KEY,
            { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
        )

        const sessionExpiresAt = addTimeFromNow(7, 'days')
        await tokenRepository.create(user.id, tokenId, {
            expiresAt: sessionExpiresAt,
            revoked: false
        })

        return response('Login successful', {
            accessToken,
            refreshToken,
            user: sanitizeUserResponse(user)
        })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong during login', unwrapErrorDetails(error))
    }
}

/**
 * Initiates password reset by generating a 6-digit OTP code.
 *
 * @param {string} email
 */
export const requestPasswordReset = async (email) => {
    try {
        const user = await userRepository.findByEmail(email)
        if (user && user.hashedPassword) {
            const resetCode = generateOtp()
            const expiresAt = addTimeFromNow(1, 'hours')

            await userRepository.update(user.id, {
                passwordResetToken: resetCode,
                passwordResetExpiresAt: expiresAt
            })

            enqueueEmail({
                to: email,
                subject: 'Reset your Luma.Study password',
                text: `Hi ${user.name},\n\nYou requested a password reset. Your password reset code is: ${resetCode}\n\nThis code will expire in 1 hour. If you did not request this, please ignore this email.\n\n- The Luma.Study Team`
            })
        }

        return response('If an account exists for this email, password reset instructions have been sent.')
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong requesting a password reset', unwrapErrorDetails(error))
    }
}

/**
 * Resets user password using 6-digit reset OTP code.
 *
 * @param {string} email
 * @param {string} code
 * @param {string} newPassword
 */
export const resetPassword = async (email, code, newPassword) => {
    try {
        const user = await userRepository.findByEmail(email)
        if (!user || !user.passwordResetToken) {
            throw AppError.badRequest('Invalid or expired password reset code')
        }

        if (user.passwordResetToken !== code || hasExpired(user.passwordResetExpiresAt)) {
            throw AppError.badRequest('Invalid or expired password reset code')
        }

        const hashedPassword = await hashPassword(newPassword)
        const updatedUser = await userRepository.update(user.id, {
            hashedPassword,
            passwordResetToken: null,
            passwordResetExpiresAt: null
        })

        if (!updatedUser) throw AppError.server('Could not update password')

        return response('Password reset successfully. You can now log in with your new password.')
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong resetting password', unwrapErrorDetails(error))
    }
}

/**
 * Refreshes an expired access token using a valid refresh token.
 *
 * @param {string} refreshToken
 */
export const refreshUserToken = async (refreshToken) => {
    try {
        if (!refreshToken) throw AppError.badRequest('Refresh token is required')

        /** @type {{ uid?: string, tokenId?: string, type?: string } & import('jsonwebtoken').JwtPayload} */
        let decoded
        try {
            decoded = jwt.verify(refreshToken, env.REFRESH_SECRET_KEY)
        } catch (e) {
            if (e instanceof Error && e.name === 'TokenExpiredError') {
                throw AppError.unauthorized('Refresh token has expired')
            }
            throw AppError.unauthorized('Invalid refresh token')
        }

        if (decoded && decoded.type && decoded.type !== TokenType.REFRESH) {
            throw AppError.unauthorized('Invalid token type provided for refresh')
        }

        if (!decoded || !decoded.uid || !decoded.tokenId) {
            throw AppError.unauthorized('Invalid refresh token payload')
        }

        const tokenDoc = await tokenRepository.findById(decoded.uid, decoded.tokenId)
        if (!tokenDoc) throw AppError.unauthorized('Token session not found')
        if (tokenDoc.revoked) throw AppError.unauthorized('Token session has been revoked')
        if (hasExpired(tokenDoc.expiresAt)) throw AppError.unauthorized('Token session has expired')

        const accessToken = jwt.sign(
            { uid: decoded.uid, tokenId: decoded.tokenId, type: TokenType.ACCESS },
            env.SECRET_KEY,
            { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
        )

        return response('Access token refreshed successfully', { accessToken })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong refreshing access token', unwrapErrorDetails(error))
    }
}

/**
 * Revokes token session on logout.
 *
 * @param {string} userId
 * @param {string} tokenId
 */
export const logoutUser = async (userId, tokenId) => {
    try {
        const revokeToken = await tokenRepository.update(userId, tokenId, { revoked: true })
        if (!revokeToken) throw AppError.server('Could not revoke token session')

        return response('Token successfully revoked')
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong revoking session', unwrapErrorDetails(error))
    }
}
