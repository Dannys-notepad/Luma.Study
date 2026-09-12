export const MaterialCategory = Object.freeze({
    LECTURE: 'lecture',
    COURSE_OUTLINE: 'courseOutline',
    PAST_QUESTION: 'pastQuestion',
    AREA_OF_CONCENTRATION: 'areaOfConcentration',
})

export const MaterialType = Object.freeze({
    IMAGE: 'image',
    DOCX: 'docx',
    PDF: 'pdf',
    AUDIO: 'audio',
    SLIDES: 'slides'
})

export const StorageProvider = Object.freeze({
    CLOUDINARY: 'cloudinary',
    FIREBASE: 'firebase'
})

export const AiPipelineStatus = Object.freeze({
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
})

export const TokenType = Object.freeze({
    ACCESS: 'access',
    REFRESH: 'refresh'
})

export const UserAccountType = Object.freeze({
    FREE: 'free',
    PRO: 'pro'
})

export const LearningMode = Object.freeze({
    STANDARD: 'Standard',
    STRICT: 'Strict'
})

export const AuthProvider = Object.freeze({
    GOOGLE: 'google',
    EMAIL: 'email'
})

export const CourseSemester = Object.freeze({
    FIRST: 'First',
    SECOND: 'Second'
})
