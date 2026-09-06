import { FieldValue } from '#database/firebase.js';

const userConverter = {
    toFirestore (user) {
        return {
            name: user.name,
            email: user.email,
            googleId: user.googleId,
            avatarUrl: user.avatarUrl,

            level: user.level ?? null,
            department: user.department ?? null,
            university: user.university ?? null,
            lectureTimeTable: user.lectureTimeTable ?? [],
            
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
            id: snapshot.id,
            ...snapshot.data()
        }
    }
}

const ALLOWED = ['name', 'email', 'googleId', 'level', 'accountType', 'lectureTimeTable', 'aiCredits']

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