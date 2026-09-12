import { FieldValue } from '#database/firebase.js';


function defaultAvatarUrl (name) {
    let editedName = name.replaceAll(' ', '')
    let url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${editedName}`
    return url
}

const userConverter = {
    toFirestore (user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            hashedPassword: user.hashedPassword ?? null,
            avatarUrl: user.avatarUrl ?? defaultAvatarUrl(user.name),
            authProvider: user.authProvider,

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
            learningMode: user.learningMode ?? 'Standard',
            
            aiCredits: user.aiCredits ?? 20,
            aiCreditsResetsAt: user.aiCreditsResetsAt ?? null,
            totalAiCreditsUsed: user.totalAiCreditsUsed ?? 0,

            accountType: user.accountType ?? 'free',
            isActive: user.isActive ?? true,
            emailIsVerified: user.emailIsVerified ?? false,
            onBoardingCompleted: user.onBoardingCompleted ?? false,

            lastLoginAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        return {
            ...snapshot.data(),
            id: snapshot.id
        }
    }
}

const ALLOWED = [
    'name', 'email', 'googleId', 'avatarUrl', 'hashedPassword', 'authProvider',

    'level', 'department', 'faculty', 'university', 'academicSession', 'lectureTimeTable', 'currentSemester', 'examinationTimeTable',

    'timezone', 'storageUsedBytes', 'storageLimitBytes', 'fcmTokens', 'learningMode',

    'aiCredits', 'aiCreditsResetsAt', 'totalAiCreditsUsed',

    'accountType', 'isActive', 'emailIsVerified', 'onBoardingCompleted', 'lastLoginAt'
]

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