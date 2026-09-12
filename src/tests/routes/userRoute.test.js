import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '#app.js'
import env from '#config/env.js'
import { userRepository, tokenRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'

const makeId = (prefix = 'user') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

async function createTestUserAndToken() {
    const userId = makeId('user')
    const tokenId = makeId('token')
    const user = {
        id: userId,
        name: 'Route Test User',
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

    const token = jwt.sign({ uid: userId, tokenId }, env.SECRET_KEY, { expiresIn: '1h' })
    return { userId, tokenId, token, user }
}

describe('User Route (/api/user)', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment')
        }
    })

    describe('GET /api/user/profile', () => {
        it('returns 401 when no authorization header is provided', async () => {
            const res = await request(app).get('/api/user/profile')
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('returns 401 when invalid token is provided', async () => {
            const res = await request(app)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalid-token-123')

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('returns 200 and user profile data when valid token is provided', async () => {
            const { token, userId, user } = await createTestUserAndToken()

            const res = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.id).toBe(userId)
            expect(res.body.data.name).toBe(user.name)
            expect(res.body.data.email).toBe(user.email)
        })

        it('returns 404 when token belongs to a non-existent user', async () => {
            const nonExistentUserId = makeId('non-user')
            const tokenId = makeId('token')

            await tokenRepository.create(nonExistentUserId, tokenId, {
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                revoked: false
            })

            const token = jwt.sign({ uid: nonExistentUserId, tokenId }, env.SECRET_KEY, { expiresIn: '1h' })

            const res = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
        })
    })

    describe('POST /api/user/profile/complete', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).post('/api/user/profile/complete').send({})
            expect(res.status).toBe(401)
        }, 15000)

        it('returns 400 validation error when body has missing or invalid fields', async () => {
            const { token } = await createTestUserAndToken()

            const res = await request(app)
                .post('/api/user/profile/complete')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    level: 300
                    // Missing required department, university, lectureTimeTable, etc.
                })

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error.code).toBe('BAD_REQUEST')
        })

        it('returns 200 and completes profile when valid body is submitted', async () => {
            const { token, userId } = await createTestUserAndToken()

            const payload = {
                level: 300,
                department: 'Computer Science',
                university: 'Harvard University',
                lectureTimeTable: [
                    {
                        day: 'Monday',
                        courseCodes: ['CSC101', 'MAT101']
                    },
                    {
                        day: 'Wednesday',
                        courseCodes: ['PHY101']
                    }
                ],
                courseTitles: ['Introduction to CS', 'Calculus I'],
                creditUnits: 3,
                currentSemester: 'First'
            }

            const res = await request(app)
                .post('/api/user/profile/complete')
                .set('Authorization', `Bearer ${token}`)
                .send(payload)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.onBoardingCompleted).toBe(true)
            expect(res.body.data.level).toBe(300)
            expect(res.body.data.department).toBe('Computer Science')

            // Verify in database
            const userInDb = await userRepository.findById(userId)
            expect(userInDb.onBoardingCompleted).toBe(true)
            expect(userInDb.university).toBe('Harvard University')
        })
    })
})
