import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '#app.js'
import env from '#config/env.js'
import { userRepository, tokenRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import { TokenType } from '#constants/model.constant.js'

const makeId = (prefix = 'user') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

async function createTestUserAndTokens() {
    const userId = makeId('user')
    const tokenId = makeId('token')
    const user = {
        id: userId,
        name: 'Auth Route Test User',
        email: `${userId}@gmail.com`,
        avatarUrl: null,
        authProvider: 'google',
        emailIsVerified: true,
        aiCreditsResetsAt: startOfNextDay()
    }

    await userRepository.create(userId, user)
    await tokenRepository.create(userId, tokenId, {
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        revoked: false
    })

    const accessToken = jwt.sign({ uid: userId, tokenId, type: TokenType.ACCESS }, env.SECRET_KEY, { expiresIn: '1h' })
    const refreshToken = jwt.sign({ uid: userId, tokenId, type: TokenType.REFRESH }, env.REFRESH_SECRET_KEY, { expiresIn: '7d' })
    return { userId, tokenId, accessToken, refreshToken, token: accessToken, user }
}

describe('Auth Route (/api/auth)', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment')
        }
    })

    describe('POST /api/auth/refresh', () => {
        it('returns 400 when no refresh token is provided', async () => {
            const res = await request(app).post('/api/auth/refresh').send({})
            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
        })

        it('returns 401 when invalid refresh token is provided', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('returns 200 and a new access token when valid refresh token is provided', async () => {
            const { refreshToken, userId } = await createTestUserAndTokens()

            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.accessToken).toBeDefined()

            // Verify new access token works for authenticated requests
            const profileRes = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${res.body.data.accessToken}`)

            expect(profileRes.status).toBe(200)
            expect(profileRes.body.data.id).toBe(userId)
        })
    })

    describe('POST /api/auth/logout', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).post('/api/auth/logout')
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('revokes token and returns 200 on logout, blocking subsequent requests', async () => {
            const { accessToken, userId, tokenId } = await createTestUserAndTokens()

            // 1. Logout
            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(logoutRes.status).toBe(200)
            expect(logoutRes.body.success).toBe(true)
            expect(logoutRes.body.message).toBe('Token successfully revoked')

            // 2. Verify token is marked revoked in Firestore
            const tokenDoc = await tokenRepository.findById(userId, tokenId)
            expect(tokenDoc.revoked).toBe(true)

            // 3. Subsequent request with revoked token should fail (401)
            const subsequentRes = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${accessToken}`)

            expect(subsequentRes.status).toBe(401)
            expect(subsequentRes.body.success).toBe(false)
        })
    })
})
