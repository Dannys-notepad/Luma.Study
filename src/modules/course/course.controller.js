import AppError from "#lib/AppError.lib.js"
import AppResponse from "#lib/AppResponse.lib.js"
import { fetchUserEnrolledCourses, fetchAnEnrolledCourse } from "./course.service.js"

/**
 * Handles fetching all enrolled courses for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const handleFetchUserEnrolledCourses = async (req, res) => {
    const enrolledCourses = await fetchUserEnrolledCourses(req.user.id)
    if (!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')

    const { message, details } = enrolledCourses

    AppResponse.success(res, details, message)
}

/**
 * Handles fetching a specific enrolled course by ID for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const handleFetchAnEnrolledCourse = async (req, res) => {
    const courseId = req.params.id
    const enrolledCourse = await fetchAnEnrolledCourse(req.user.id, courseId)
    if (!enrolledCourse) throw AppError.server('Could not fetch user enrolled course')

    const { message, details } = enrolledCourse

    AppResponse.success(res, details, message)
}