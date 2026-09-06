import { userRepositry } from "#database/repositories/index.js";

function response (message, statusCode, code = '', details = null) {
 return { message, details, statusCode, code }
}

export const fetchUserProfile = async (userId) => {
    if (!userId) response('User id required', 401, 'UNAUTHORIZED')

    try {
        const userProfile = await userRepositry.findById(userId)
        if (!userProfile) response('User does not exist', 404, 'USER NOT FOUND', userProfile)

        response('User profile', 200, '', userProfile)

    } catch (error) {
        throw new Error(error)
    }
}

export const completeUserProfile = async (userId, data) => {
    if (!userId) response('User id required', 401, 'UNAUTHORIZED')
    if (!data) response('data for profile completion is required', 400, 'BAD_REQUEST')

    try {
        const userProfile = await userRepositry.findById(userId)
        if (!userProfile) response('User does not exist', 404, 'USER NOT FOUND', userProfile)
        
        const { level, department, university, lectureTimeTable } = data

        const completeProfile = await userRepositry.update(userId, {
            level,
            department,
            university,
            lectureTimeTable
        })

    } catch (error) {
        throw new Error(error)
    }
}