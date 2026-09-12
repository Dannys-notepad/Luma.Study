import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '#app.js'
import env from '#config/env.js'
import { userRepository } from '#database/repositories/index.js'

const makeId = (prefix = 'localuser') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

describe('Local Auth Routes (/api/auth)', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment')
        }
    })

    describe('POST /api/auth/register & verify-email & login', () => {
        it('handles complete local signup, email verification, and login flow', async () => {
            const uid = makeId('user')
            const email = `${uid}@testluma.com`
            const password = 'StrongPassword123!'

            // 1. Register User
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Local User',
                    email,
                    password
                })

            expect(regRes.status).toBe(201)
            expect(regRes.body.success).toBe(true)
            expect(regRes.body.message).toContain('Registration successful')

            // 2. Fetch created user from DB to get the generated OTP code
            const userInDb = await userRepository.findByEmail(email)
            expect(userInDb).toBeDefined()
            expect(userInDb.emailIsVerified).toBe(false)
            expect(userInDb.emailVerificationToken).toBeDefined()

            const otpCode = userInDb.emailVerificationToken

            // 3. Attempt login before email verification -> Should fail (403)
            const preVerifyLoginRes = await request(app)
                .post('/api/auth/login')
                .send({ email, password })

            expect(preVerifyLoginRes.status).toBe(403)
            expect(preVerifyLoginRes.body.success).toBe(false)

            // 4. Verify Email with valid OTP code
            const verifyRes = await request(app)
                .post('/api/auth/verify-email')
                .send({ email, code: otpCode })

            expect(verifyRes.status).toBe(200)
            expect(verifyRes.body.success).toBe(true)
            expect(verifyRes.body.data.accessToken).toBeDefined()
            expect(verifyRes.body.data.refreshToken).toBeDefined()

            // 5. Login after email verification -> Should succeed (200)
            const postVerifyLoginRes = await request(app)
                .post('/api/auth/login')
                .send({ email, password })

            expect(postVerifyLoginRes.status).toBe(200)
            expect(postVerifyLoginRes.body.success).toBe(true)
            expect(postVerifyLoginRes.body.data.accessToken).toBeDefined()
        })
    })

    describe('POST /api/auth/forgot-password & reset-password', () => {
        it('handles forgot password and reset password flow', async () => {
            const uid = makeId('resetuser')
            const email = `${uid}@testluma.com`
            const oldPassword = 'OldPassword123!'
            const newPassword = 'NewPassword456!'

            // Register & Verify User
            await request(app).post('/api/auth/register').send({ name: 'Reset User', email, password: oldPassword })
            const user = await userRepository.findByEmail(email)
            await request(app).post('/api/auth/verify-email').send({ email, code: user.emailVerificationToken })

            // 1. Request Password Reset
            const forgotRes = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email })

            expect(forgotRes.status).toBe(200)
            expect(forgotRes.body.success).toBe(true)

            // 2. Fetch reset token from DB
            const userForReset = await userRepository.findByEmail(email)
            expect(userForReset.passwordResetToken).toBeDefined()
            const resetCode = userForReset.passwordResetToken

            // 3. Reset Password with code
            const resetRes = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    email,
                    code: resetCode,
                    newPassword
                })

            expect(resetRes.status).toBe(200)
            expect(resetRes.body.success).toBe(true)

            // 4. Verify login with old password fails (401)
            const oldLoginRes = await request(app).post('/api/auth/login').send({ email, password: oldPassword })
            expect(oldLoginRes.status).toBe(401)

            // 5. Verify login with new password succeeds (200)
            const newLoginRes = await request(app).post('/api/auth/login').send({ email, password: newPassword })
            expect(newLoginRes.status).toBe(200)
            expect(newLoginRes.body.success).toBe(true)
        })
    })
})
