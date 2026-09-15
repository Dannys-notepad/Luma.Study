import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '#app.js'
import env from '#config/env.js'
import { userRepository, tokenRepository, courseRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import { TokenType } from '#constants/model.constant.js'

const makeId = (prefix = 'user') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

async function createTestUserAndCourse() {
    const userId = makeId('user')
    const tokenId = makeId('token')
    const user = {
        id: userId,
        name: 'Course Route Test User',
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

    const course = {
        code: 'CSC201',
        title: 'Data Structures and Algorithms',
        creditUnit: 3,
        lecturers: ['Dr. Smith']
    }
    const createdCourse = await courseRepository.create(userId, course.code, course)

    const token = jwt.sign({ uid: userId, tokenId, type: TokenType.ACCESS }, env.SECRET_KEY, { expiresIn: '1h' })
    return { userId, tokenId, token, user, course: createdCourse }
}

describe('Course Route (/api/course)', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment')
        }
    })

    describe('GET /api/course/enrolledCourses', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/course/enrolledCourses')
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('returns 200 and list of enrolled courses for valid user', async () => {
            const { token, course } = await createTestUserAndCourse()

            const res = await request(app)
                .get('/api/course/enrolledCourses')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThan(0)
            expect(res.body.data[0].code).toBe(course.code)
        })
    })

    describe('POST /api/course', () => {
        it('creates a course for the authenticated user', async () => {
            const { token } = await createTestUserAndCourse()

            const res = await request(app)
                .post('/api/course')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    courseTitle: 'Operating Systems',
                    courseCode: 'CSC301',
                    creditUnit: 4,
                    lecturers: ['Dr. Brown']
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data.title).toBe('Operating Systems')
            expect(res.body.data.code).toBe('CSC301')
        })
    })

    describe('PATCH /api/course/:courseId', () => {
        it('updates a course for the authenticated user', async () => {
            const { token, course } = await createTestUserAndCourse()

            const res = await request(app)
                .patch(`/api/course/${course.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Advanced Data Structures',
                    creditUnit: 5
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.title).toBe('Advanced Data Structures')
            expect(res.body.data.creditUnit).toBe(5)
        })
    })

    describe('DELETE /api/course/:courseId', () => {
        it('deletes a course for the authenticated user', async () => {
            const { token, course } = await createTestUserAndCourse()

            const res = await request(app)
                .delete(`/api/course/${course.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.id).toBe(course.id)
        })
    })

    describe('GET /api/course/enrolledCourses/:id', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/course/enrolledCourses/CSC201')
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
        })

        it('returns 200 and details of specific course when valid course ID is passed', async () => {
            const { token, course } = await createTestUserAndCourse()

            const res = await request(app)
                .get(`/api/course/enrolledCourses/${course.id}`)
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.id).toBe(course.id)
            expect(res.body.data.title).toBe(course.title)
        })

        it('returns 404 when requested course ID does not exist', async () => {
            const { token } = await createTestUserAndCourse()

            const res = await request(app)
                .get('/api/course/enrolledCourses/NONEXISTENT999')
                .set('Authorization', `Bearer ${token}`)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
        })
    })
})
