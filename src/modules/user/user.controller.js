import { fetchUserProfile } from "./user.service.js"
import AppError from "#lib/AppError.lib.js"
import AppResponse from "#lib/AppResponse.lib.js"

export const handleFetchUserProfile = async (req, res) => {
    const userProfile = await fetchUserProfile(req.user.id)
    const {message, details, statusCode, code } = userProfile

    if (!userProfile) throw new AppError.server('Could not fetch user profile')
    if (statusCode >= 400) throw new AppError(message, statusCode, code, details)

    AppResponse.success(res, details, message)
}

export const handleCompleteUserProfile = async (req, res) => {
    const completeProfile = await fetchUserProfile(req.user.id, req.body)

    const {message, details, statusCode, code } = completeProfile

    if (!completeProfile) throw new AppError.server('Could not complete user profile')
    if (statusCode >= 400) throw new AppError(message, statusCode, code, details)

    AppResponse.success(res, details, message)
}