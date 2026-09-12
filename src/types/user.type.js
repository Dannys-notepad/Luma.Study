/**
 * @typedef {'free' | 'pro'} UserAccountTypeVal
 * @typedef {'Standard' | 'Strict'} LearningModeTypeVal
 * @typedef {'google' | 'email'} AuthProviderTypeVal
 * @typedef {'First' | 'Second'} SemesterTypeVal
 */

/**
 * @typedef {Object} LectureTimeSlot
 * @property {string} day
 * @property {string[]} courseCodes
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} [hashedPassword]
 * @property {string} avatarUrl
 * @property {AuthProviderTypeVal} authProvider
 * @property {number|null} [level]
 * @property {string|null} [department]
 * @property {string|null} [faculty]
 * @property {string|null} [university]
 * @property {string|null} [academicSession]
 * @property {LectureTimeSlot[]} [lectureTimeTable]
 * @property {SemesterTypeVal|null} [currentSemester]
 * @property {any|null} [examinationTimeTable]
 * @property {string} timezone
 * @property {number} storageUsedBytes
 * @property {number} storageLimitBytes
 * @property {string[]} fcmTokens
 * @property {LearningModeTypeVal} learningMode
 * @property {number} freeAiCredits
 * @property {number} paidAiCredits
 * @property {import('firebase-admin/firestore').Timestamp|string|null} [freeAiCreditsResetsAt]
 * @property {number} totalAiCreditsUsed
 * @property {UserAccountTypeVal} accountType
 * @property {boolean} isActive
 * @property {boolean} emailIsVerified
 * @property {string|null} [emailVerificationToken]
 * @property {import('firebase-admin/firestore').Timestamp|string|null} [emailVerificationExpiresAt]
 * @property {string|null} [passwordResetToken]
 * @property {import('firebase-admin/firestore').Timestamp|string|null} [passwordResetExpiresAt]
 * @property {boolean} onBoardingCompleted
 * @property {import('firebase-admin/firestore').Timestamp} [lastLoginAt]
 * @property {import('firebase-admin/firestore').Timestamp} [createdAt]
 * @property {import('firebase-admin/firestore').Timestamp} [updatedAt]
 */

/**
 * @typedef {Object} UserProfileInput
 * @property {number} level
 * @property {string} department
 * @property {string} [faculty]
 * @property {string} university
 * @property {string} [academicSession]
 * @property {string} [timezone]
 * @property {LearningModeTypeVal} [learningMode]
 * @property {LectureTimeSlot[]} [lectureTimeTable]
 * @property {string[]} [courseTitles]
 * @property {number|number[]} [creditUnits]
 * @property {SemesterTypeVal} [currentSemester]
 */

export {}
