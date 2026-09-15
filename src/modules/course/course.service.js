import AppError from "#lib/AppError.lib.js";
import { sanitizeCourseResponse } from "#lib/responseSanitizer.lib.js"
import { courseRepository } from "#database/repositories/index.js"

/**
 * @param {string} message
 * @param {any} [details]
 * @returns {{ message: string, details: any }}
 */
function response (message, details = null) {
 return { message, details }
}

export const fetchUserEnrolledCourses = async (userId) => {
    try {
        if (!userId) throw AppError.unauthorized('User id is required to proceed')

        const enrolledCourses = await courseRepository.list(userId)
        if (!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')
        if (enrolledCourses.length === 0) {
            return response('This user does not have any courses enrolled yet', [])
        }

        const sanitizedCourses = enrolledCourses.map((course) => sanitizeCourseResponse(course))
        return response('User enrolled courses', sanitizedCourses)
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong fetching user enrolled courses', { message: error instanceof Error ? error.message : String(error) })
    }
}

export const fetchAnEnrolledCourse = async (userId, courseId) => {
    try {
        if (!userId) throw AppError.unauthorized('User id is required to proceed')
        if (!courseId) throw AppError.badRequest('Course id is required to proceed')

        const enrolledCourse = await courseRepository.findById(userId, courseId)
        if (!enrolledCourse) throw AppError.notFound('Enrolled course not found')

        return response('User enrolled course', sanitizeCourseResponse(enrolledCourse))
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong fetching user enrolled course', { message: error instanceof Error ? error.message : String(error) })
    }
}

export const createCourse = async (userId, data) => {
    try {
        if (!userId) throw AppError.unauthorized('User id is required to proceed')
        if (!data) throw AppError.badRequest('Data for course creation is required to proceed')

        const { courseTitle, courseCode, creditUnit, lecturers } = data
        if (!courseTitle || !courseCode) {
            throw AppError.badRequest('Course title and course code are required')
        }

        const normalizedCourseCode = String(courseCode).trim()
        const courseId = normalizedCourseCode.replaceAll(' ', '-')
        let course = await courseRepository.findById(userId, courseId)

        if (course) throw AppError.conflict(`${courseTitle} already exists`)

        course = await courseRepository.create(userId, courseId, {
            id: courseId,
            title: courseTitle,
            code: normalizedCourseCode,
            creditUnit: creditUnit ?? 3,
            lecturers: lecturers ?? []
        })

        if (!course) throw AppError.server('Could not create user course')

        return response('Course created', sanitizeCourseResponse(course))
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong creating course', { message: error instanceof Error ? error.message : String(error) })
    }
}

export const updateCourse = async (userId, courseId, data) => {
    try {
        if (!userId) throw AppError.unauthorized('User id is required to proceed')
        if (!courseId) throw AppError.badRequest('Course id is required to proceed')
        if (!data || Object.keys(data).length === 0) {
            throw AppError.badRequest('Course update payload is required')
        }

        const existingCourse = await courseRepository.findById(userId, courseId)
        if (!existingCourse) throw AppError.notFound('Enrolled course not found')

        const allowedUpdates = {}
        if (data.title !== undefined) allowedUpdates.title = data.title
        if (data.code !== undefined) allowedUpdates.code = String(data.code).trim()
        if (data.creditUnit !== undefined) allowedUpdates.creditUnit = data.creditUnit
        if (data.lecturers !== undefined) allowedUpdates.lecturers = data.lecturers

        const updatedCourse = await courseRepository.update(userId, courseId, allowedUpdates)
        if (!updatedCourse) throw AppError.server('Could not update user course')

        return response('Course updated', sanitizeCourseResponse(updatedCourse))
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong updating course', { message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteCourse = async (userId, courseId) => {
    try {
        if (!userId) throw AppError.unauthorized('User id is required to proceed')
        if (!courseId) throw AppError.badRequest('Course id is required to proceed')

        const existingCourse = await courseRepository.findById(userId, courseId)
        if (!existingCourse) throw AppError.notFound('Enrolled course not found')

        await courseRepository.delete(userId, courseId)
        return response('Course deleted', { id: courseId })
    } catch (error) {
        if (error instanceof AppError) throw error
        throw AppError.server('Something went wrong deleting course', { message: error instanceof Error ? error.message : String(error) })
    }
}