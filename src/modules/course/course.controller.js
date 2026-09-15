import AppError from "#lib/AppError.lib.js"
import AppResponse from "#lib/AppResponse.lib.js"
import { fetchUserEnrolledCourses, fetchAnEnrolledCourse, createCourse, updateCourse, deleteCourse } from "./course.service.js"

export const handleFetchUserEnrolledCourses = async (req, res) => {
    const enrolledCourses = await fetchUserEnrolledCourses(req.user.id)
    if (!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')

    const { message, details } = enrolledCourses
    AppResponse.success(res, details, message)
}

export const handleFetchAnEnrolledCourse = async (req, res) => {
    const courseId = req.params.courseId
    const enrolledCourse = await fetchAnEnrolledCourse(req.user.id, courseId)
    if (!enrolledCourse) throw AppError.server('Could not fetch user enrolled course')

    const { message, details } = enrolledCourse
    AppResponse.success(res, details, message)
}

export const handleCreateCourse = async (req, res) => {
    const createUCourse = await createCourse(req.user.id, req.body)
    if (!createUCourse) throw AppError.server('Could not create course')

    const { message, details } = createUCourse
    AppResponse.success(res, details, message, 201)
}

export const handleUpdateCourse = async (req, res) => {
    const updatedCourse = await updateCourse(req.user.id, req.params.courseId, req.body)
    if (!updatedCourse) throw AppError.server('Could not update course')

    const { message, details } = updatedCourse
    AppResponse.success(res, details, message)
}

export const handleDeleteCourse = async (req, res) => {
    const deletedCourse = await deleteCourse(req.user.id, req.params.courseId)
    if (!deletedCourse) throw AppError.server('Could not delete course')

    const { message, details } = deletedCourse
    AppResponse.success(res, details, message)
}