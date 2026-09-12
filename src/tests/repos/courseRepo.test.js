import { describe, it, expect, beforeEach } from 'vitest'
import { courseRepository } from '#database/repositories/index.js'
import env from '#config/env.js'

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

describe('courseRepository', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment, and NODE_ENV set to "development" and FIRESTORE_EMULATOR_HOS set to "127.0.0.1:8081"')
        }
    })

    it('creates and finds a course by id', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')
        const data = {
            title: 'Introduction to Algorithms',
            code: 'CSC 201',
            creditUnit: 3,
            lecturers: ['Dr. Ada Lovelace']
        }

        await courseRepository.create(userId, courseId, data)

        const found = await courseRepository.findById(userId, courseId)

        expect(found).not.toBeNull()
        expect(found.id).toBe(courseId)
        expect(found.title).toBe(data.title)
        expect(found.code).toBe(data.code)
    })

    it('lists all courses for a user', async () => {
        const userId = makeId('user')
        const c1 = makeId('course')
        const c2 = makeId('course')

        await courseRepository.create(userId, c1, {
            title: 'Discrete Math',
            code: 'MATH 223',
            creditUnit: 3,
            lecturers: ['Dr. Smith']
        })

        await courseRepository.create(userId, c2, {
            title: 'Software Engineering',
            code: 'SWE 301',
            creditUnit: 4,
            lecturers: ['Dr. Jones']
        })

        const courses = await courseRepository.list(userId)

        expect(Array.isArray(courses)).toBe(true)
        expect(courses.some((c) => c.id === c1)).toBe(true)
        expect(courses.some((c) => c.id === c2)).toBe(true)
    })

    it('updates a course', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')

        await courseRepository.create(userId, courseId, {
            title: 'Old Title',
            code: 'PHY 101',
            creditUnit: 2,
            lecturers: ['Prof. White']
        })

        const updated = await courseRepository.update(userId, courseId, {
            title: 'New Title',
            creditUnit: 4
        })

        expect(updated).not.toBeNull()
        expect(updated.title).toBe('New Title')
        expect(updated.creditUnit).toBe(4)

        const found = await courseRepository.findById(userId, courseId)
        expect(found.title).toBe('New Title')
    })

    it('deletes a course', async () => {
        const userId = makeId('user')
        const courseId = makeId('course')

        await courseRepository.create(userId, courseId, {
            title: 'To Delete',
            code: 'CHEM 110',
            creditUnit: 3,
            lecturers: ['Prof. Black']
        })

        await courseRepository.delete(userId, courseId)

        const found = await courseRepository.findById(userId, courseId)
        expect(found).toBeNull()
    })
})