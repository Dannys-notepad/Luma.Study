export const DEFAULT_ALLOWED_FIELDS = {
    user: [
        'id',
        'name',
        'email',
        'avatarUrl',
        'authProvider',
        'emailIsVerified',
        'onBoardingCompleted',
        'level',
        'department',
        'faculty',
        'university',
        'academicSession',
        'lectureTimeTable',
        'currentSemester',
        'timezone',
        'learningMode',
        'freeAiCredits',
        'paidAiCredits',
        'accountType',
        'isActive'
    ],
    course: [
        'id',
        'title',
        'code',
        'creditUnit',
        'lecturers'
    ]
}

export const DEFAULT_USER_FIELDS = DEFAULT_ALLOWED_FIELDS.user
export const DEFAULT_COURSE_FIELDS = DEFAULT_ALLOWED_FIELDS.course

export const sanitizeResponse = (response = null, options = {}) => {
    if (response === null || response === undefined) return null

    if (Array.isArray(response)) {
        return response.map((item) => sanitizeResponse(item, options))
    }

    if (typeof response !== 'object' || response instanceof Date) {
        return response
    }

    const {
        include = [],
        exclude = [],
        allowedFields = []
    } = options

    const keys = include.length > 0
        ? include
        : allowedFields.length > 0
            ? allowedFields
            : Object.keys(response)

    const forbidden = new Set(exclude)

    return keys.reduce((sanitized, field) => {
        if (forbidden.has(field)) return sanitized
        if (Object.prototype.hasOwnProperty.call(response, field)) {
            sanitized[field] = response[field]
        }
        return sanitized
    }, {})
}

export const sanitizeUserResponse = (user, extraFields = [], excludeFields = []) => {
    const include = [...new Set([...DEFAULT_USER_FIELDS, ...extraFields])]
    return sanitizeResponse(user, { include, exclude: excludeFields })
}

export const sanitizeCourseResponse = (course, extraFields = [], excludeFields = []) => {
    const include = [...new Set([...DEFAULT_COURSE_FIELDS, ...extraFields])]
    return sanitizeResponse(course, { include, exclude: excludeFields })
}

export const sanitizeByType = (response, type, allowedFields = [], excludeFields = []) => {
    const defaultFields = DEFAULT_ALLOWED_FIELDS[type] ?? []
    return sanitizeResponse(response, {
        include: allowedFields.length > 0 ? allowedFields : defaultFields,
        exclude: excludeFields
    })
}

export default sanitizeResponse
