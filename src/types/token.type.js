/**
 * @typedef {'access' | 'refresh'} TokenTypeVal
 */

/**
 * @typedef {Object} TokenPayload
 * @property {string} uid
 * @property {string} tokenId
 * @property {TokenTypeVal} [type]
 */

/**
 * @typedef {Object} TokenDoc
 * @property {string} id
 * @property {import('firebase-admin/firestore').Timestamp|string} expiresAt
 * @property {boolean} revoked
 * @property {import('firebase-admin/firestore').Timestamp} [createdAt]
 */

/**
 * @typedef {Object} TokensResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 */

export {}
