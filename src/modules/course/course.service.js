import AppError from "#lib/AppError.lib.js";
import { courseRepository } from "#database/repositories/index.js"

/**
 * @param {string} message
 * @param {any} [details]
 * @returns {{ message: string, details: any }}
 */
function response (message, details = null) {
 return { message, details }
}

/**
 * Fetches all courses enrolled by a specific user.
 * @param {string} userId
 * @returns {Promise<{ message: string, details: import('#types/course.type.js').Course[] }>}
 */
export const fetchUserEnrolledCourses = async (userId) => {
    if (!userId) throw AppError.unauthorized('User id is required to proceed')
    try {
        const enrolledCourses = await courseRepository.list(userId)
        if (!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')
        if (enrolledCourses.length === 0) {
            return response('This user does not have any courses enrolled yet', [])
        }
        
        return response('User enrolled courses', enrolledCourses)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong fetching user enrolled courses', error)
    }
}

/**
 * Fetches a single enrolled course by ID for a user.
 * @param {string} userId
 * @param {string} courseId
 * @returns {Promise<{ message: string, details: import('#types/course.type.js').Course }>}
 */
export const fetchAnEnrolledCourse = async (userId, courseId) => {
    if (!userId) throw AppError.unauthorized('User id is required to proceed')
    if (!courseId) throw AppError.badRequest('Course id is required to proceed')
    try {
        const enrolledCourse = await courseRepository.findById(userId, courseId)
        if (!enrolledCourse) throw AppError.notFound('Enrolled course not found')
        
        return response('User enrolled course', enrolledCourse)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong fetching user enrolled course', error)
    }
}