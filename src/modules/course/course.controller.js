import AppError from "#lib/AppError.lib.js"
import AppResponse from "#lib/AppResponse.lib.js"
import { fetchUserEnrolledCourses } from "./course.service.js"

export const handleFetchUserEnrolledCourses = async (req, res) => {
    const enrolledCourses = await fetchUserEnrolledCourses(req.user.id)
    if(!enrolledCourses) throw AppError.server('Could not fetch user enrolled courses')

    const { message, details } = enrolledCourses

    AppResponse.success(res, details, message)
}