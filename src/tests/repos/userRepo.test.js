import { describe, it, expect, beforeEach } from 'vitest'
import { userRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import env from '#config/env.js'

const makeId = (prefix = 'user') =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

describe('userRepository', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment, and NODE_ENV set to "development" and FIRESTORE_EMULATOR_HOS set to "127.0.0.1:8081"')
        }
    })

    it('creates and find a user by id (GOOGLE oauth mimic)', async () => {
        const userId = makeId()
        const aiCreditsResetsAt = startOfNextDay()
        const profile = {
            id: userId,
            name: 'Test user',
            email: 'test@gmail.com',
            avatarUrl: null,
            authProvider: 'google',
            emailIsVerified: true,
            aiCreditsResetsAt
        }

        await userRepository.create(userId, profile)

        const userFound = await userRepository.findById(userId)
        expect(userFound).not.toBeNull()
        expect(userFound.name).toBe(profile.name)
    })

    it('returns null for a non existent id', async () => {
        const user = await userRepository.findById('non-existent-user-id-123456')
        expect(user).toBeNull()
    })

    it('completes the user profile', async () => {
        const userId = makeId()
        const baseProfile = {
            id: userId,
            name: 'Profile User',
            email: 'profileuser@gmail.com',
            avatarUrl: null,
            authProvider: 'google',
            emailIsVerified: true,
            aiCreditsResetsAt: startOfNextDay()
        }

        await userRepository.create(userId, baseProfile)

        const data = {
            level: 300,
            department: 'Industrial Chemistry',
            university: 'Oxford University',
            lectureTimeTable: [
                {
                    day: 'Monday',
                    courses: ['CSC 101', 'MATH 101', 'SWE 101']
                },
                {
                    day: 'Wednesday',
                    courses: ['IBM 111', 'PHY 101']
                },
                {
                    day: 'Friday',
                    courses: ['SWE 108']
                }
            ],
            currentSemester: 'First'
        }

        const completeProfile = await userRepository.update(userId, {
            ...data,
            onBoardingCompleted: true
        })

        expect(completeProfile).not.toBeNull()
        expect(completeProfile.onBoardingCompleted).toBe(true)

        const userFound = await userRepository.findById(userId)
        expect(userFound.onBoardingCompleted).toBe(true)
        expect(userFound.level).toBe(300)
    })
})