import { FieldValue } from '#database/firebase.js';
import { LearningMode, UserAccountType, AuthProvider } from '#constants/model.constant.js'

function defaultAvatarUrl (name) {
    let editedName = (name || 'user').replaceAll(' ', '')
    let url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${editedName}`
    return url
}

/**
 * @type {import('firebase-admin/firestore').FirestoreDataConverter<import('#types/user.type.js').User>}
 */
const userConverter = {
    toFirestore (user) {
        return {
            id: user.id ?? null,
            name: user.name,
            email: user.email,
            hashedPassword: user.hashedPassword ?? null,
            avatarUrl: user.avatarUrl ?? defaultAvatarUrl(user.name),
            authProvider: user.authProvider ?? AuthProvider.GOOGLE,

            level: user.level ?? null,
            department: user.department ?? null,
            faculty: user.faculty ?? null,
            university: user.university ?? null,
            academicSession: user.academicSession ?? null,
            lectureTimeTable: user.lectureTimeTable ?? [],
            currentSemester: user.currentSemester ?? null,
            examinationTimeTable: user.examinationTimeTable ?? null,
            
            timezone: user.timezone ?? 'UTC',
            storageUsedBytes: user.storageUsedBytes ?? 0,
            storageLimitBytes: user.storageLimitBytes ?? 1073741824, // 1GB default limit
            fcmTokens: user.fcmTokens ?? [],
            learningMode: user.learningMode ?? LearningMode.STANDARD,
            
            freeAiCredits: user.freeAiCredits ?? 20,
            paidAiCredits: user.paidAiCredits ?? 0,
            freeAiCreditsResetsAt: user.freeAiCreditsResetsAt ?? null,
            totalAiCreditsUsed: user.totalAiCreditsUsed ?? 0,

            accountType: user.accountType ?? UserAccountType.FREE,
            isActive: user.isActive ?? true,
            emailIsVerified: user.emailIsVerified ?? false,
            emailVerificationToken: user.emailVerificationToken ?? null,
            emailVerificationExpiresAt: user.emailVerificationExpiresAt ?? null,
            passwordResetToken: user.passwordResetToken ?? null,
            passwordResetExpiresAt: user.passwordResetExpiresAt ?? null,
            onBoardingCompleted: user.onBoardingCompleted ?? false,

            lastLoginAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        const data = snapshot.data()
        return {
            ...data,
            id: snapshot.id
        }
    }
}

const ALLOWED = [
    'name', 'email', 'googleId', 'avatarUrl', 'hashedPassword', 'authProvider',

    'level', 'department', 'faculty', 'university', 'academicSession', 'lectureTimeTable', 'currentSemester', 'examinationTimeTable',

    'timezone', 'storageUsedBytes', 'storageLimitBytes', 'fcmTokens', 'learningMode',

    'aiCredits', 'aiCreditsResetsAt', 'totalAiCreditsUsed',

    'accountType', 'isActive', 'emailIsVerified', 
    'emailVerificationToken', 'emailVerificationExpiresAt', 
    'passwordResetToken', 'passwordResetExpiresAt', 
    'onBoardingCompleted', 'lastLoginAt'
]

/**
 * Shapes partial user update payload.
 * @param {Partial<import('#types/user.type.js').User>} partial
 * @returns {Record<string, any>}
 */
const userToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    shaped.updatedAt = FieldValue.serverTimestamp()
    return shaped
}

export {
    userToUpdate,
    userConverter
}