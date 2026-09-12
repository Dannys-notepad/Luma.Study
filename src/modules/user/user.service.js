import AppError from "#lib/AppError.lib.js";
import { userRepository, courseRepository } from "#database/repositories/index.js";

function response (message, details = null) {
 return { message, details }
}

export const fetchUserProfile = async (userId) => {
    if (!userId) throw AppError.unauthorized('User is unauthorized')

    try {
        const userProfile = await userRepository.findById(userId)
        if (!userProfile) throw AppError.notFound('User not found')

        return response('User profile', userProfile)
    } catch (error) {
        throw error
    }
}

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
            const courses = courseTitles.map((title, index) => ({
                title,
                code: lectureTimeTable?.[index]?.courseCodes?.[index] ?? title.replaceAll(' ', '-').toUpperCase(),
                creditUnit: Array.isArray(creditUnits) ? creditUnits[index] : (creditUnits ?? 3)
            }))
            const createCourses = await courseRepository.createMany(userId, courses)
            if (!createCourses) throw AppError.server('Could not create user courses')
        }

        return response('User profile completed', completeProfile)
    } catch (error) {
        throw error
    }
}