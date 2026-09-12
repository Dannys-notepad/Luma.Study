import AppError from "#lib/AppError.lib.js";
import { userRepository, courseRepository } from "#database/repositories/index.js";

/**
 * @param {string} message
 * @param {any} [details]
 * @returns {{ message: string, details: any }}
 */
function response (message, details = null) {
 return { message, details }
}

/**
 * Fetches profile for a given user ID.
 * @param {string} userId
 * @returns {Promise<{ message: string, details: import('#types/user.type.js').User }>}
 */
export const fetchUserProfile = async (userId) => {
    if (!userId) throw AppError.unauthorized('User is unauthorized')

    try {
        const userProfile = await userRepository.findById(userId)
        if (!userProfile) throw AppError.notFound('User not found')

        return response('User profile', userProfile)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Failed to fetch user profile', error)
    }
}

/**
 * Completes onboarding profile details for a user.
 * @param {string} userId
 * @param {import('#types/user.type.js').UserProfileInput} data
 * @returns {Promise<{ message: string, details: import('#types/user.type.js').User }>}
 */
export const completeUserProfile = async (userId, data) => {
    if (!userId) throw AppError.unauthorized('User id required')
    if (!data) throw AppError.badRequest('User data required')

    try {
        const userProfile = await userRepository.findById(userId)
        if (!userProfile) throw AppError.notFound('User not found')
        
        const { level, department, faculty, university, academicSession, timezone, learningMode, lectureTimeTable, courseTitles, creditUnits, currentSemester } = data
        
        const completeProfile = await userRepository.update(userId, {
            level,
            department,
            faculty,
            university,
            academicSession,
            timezone,
            learningMode,
            lectureTimeTable,
            currentSemester,
            onBoardingCompleted: true
        })
        if (!completeProfile) throw AppError.server('Could not complete user profile')

        if (Array.isArray(courseTitles) && courseTitles.length > 0) {
            // Flatten course codes from lecture timetable if present
            const flattenedCodes = Array.isArray(lectureTimeTable)
                ? lectureTimeTable.flatMap((t) => (Array.isArray(t.courseCodes) ? t.courseCodes : []))
                : []

            const courses = courseTitles.map((title, index) => {
                const fallbackCode = title.replaceAll(' ', '-').toUpperCase()
                const code = flattenedCodes[index] || fallbackCode
                const creditUnit = Array.isArray(creditUnits) ? (creditUnits[index] ?? 3) : (creditUnits ?? 3)
                return {
                    title,
                    code,
                    creditUnit
                }
            })
            const createCourses = await courseRepository.createMany(userId, courses)
            if (!createCourses) throw AppError.server('Could not create user courses')
        }

        return response('User profile completed', completeProfile)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Failed to complete user profile', error)
    }
}