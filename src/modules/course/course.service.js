import AppError from "#lib/AppError.lib.js";
import { courseRepository } from "#database/repositories/index.js"

function response (message, details = null) {
 return { message, details }
}

export const fetchUserEnrolledCourses = async (userId) => {
    if (!userId) throw AppError.unauthorized('User id is required to proceed')
    try {
        const enrolledCourses = await courseRepository.list(userId)
        if (!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')
        if (enrolledCourses.length === 0) response('This user do not have any courses enrolled yet', enrolledCourses)
        
        response('User enrolled courses', enrolledCourses)
    } catch (error) {
        throw new AppError('Something went wrong fetching user enrolled courses', 500, 'SERVER_ERROR', error)
    }
}

export const fetchAnEnrolledCourse = async (userId, courseId) => {
    if (!userId) throw AppError.unauthorized('User id is required to proceed')
    if (!courseId) throw AppError.unauthorized('Course id is required to proceed')
    try {
        const enrolledCourse = await courseRepository.findById(userId, courseId)
        if (!enrolledCourse) throw AppError.server('Could not fetch user enrolled course')
        
        response('User enrolled course', enrolledCourse)
    } catch (error) {
        throw new AppError('Something went wrong fetching user enrolled course', 500, 'SERVER_ERROR', error)
    }
}