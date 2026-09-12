import { fetchUserProfile, completeUserProfile } from "./user.service.js"
import AppError from "#lib/AppError.lib.js"
import AppResponse from "#lib/AppResponse.lib.js"

export const handleFetchUserProfile = async (req, res) => {
    const userProfile = await fetchUserProfile(req.user.id)
    if (!userProfile) throw AppError.server('Could not fetch user profile')

    const { message, details } = userProfile


    AppResponse.success(res, details, message)
}

export const handleCompleteUserProfile = async (req, res) => {
    const completeProfileResult = await completeUserProfile(req.user.id, req.body)
    if (!completeProfileResult) throw AppError.server('Could not complete user profile')

    const { message, details } = completeProfileResult

    AppResponse.success(res, details, message)
}