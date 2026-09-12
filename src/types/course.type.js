/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} code
 * @property {number} creditUnit
 * @property {string[]} lecturers
 * @property {import('firebase-admin/firestore').Timestamp} [createdAt]
 */

/**
 * @typedef {Object} CourseInput
 * @property {string} title
 * @property {string} code
 * @property {number} [creditUnit]
 * @property {string[]} [lecturers]
 */

export {}
