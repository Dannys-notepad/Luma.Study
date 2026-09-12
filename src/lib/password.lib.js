import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Hashes a plain-text password securely using Node.js scrypt algorithm with a random salt.
 * @param {string} password
 * @returns {Promise<string>} Format: "salt:hash"
 */
export async function hashPassword (password) {
    return new Promise((resolve, reject) => {
        try {
            const salt = randomBytes(16).toString('hex')
            const hash = scryptSync(password, salt, 64).toString('hex')
            resolve(`${salt}:${hash}`)
        } catch (err) {
            reject(err)
        }
    })
}

/**
 * Compares a plain-text password with a stored "salt:hash" string using timing-safe evaluation.
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function comparePassword (password, storedHash) {
    return new Promise((resolve) => {
        try {
            if (!storedHash || !storedHash.includes(':')) {
                return resolve(false)
            }
            const [salt, key] = storedHash.split(':')
            const keyBuffer = Buffer.from(key, 'hex')
            const derivedKey = scryptSync(password, salt, 64)
            
            if (keyBuffer.length !== derivedKey.length) {
                return resolve(false)
            }

            resolve(timingSafeEqual(keyBuffer, derivedKey))
        } catch {
            resolve(false)
        }
    })
}

/**
 * Generates a random 6-digit numeric OTP string for email verification or password resets.
 * @returns {string} e.g. "482910"
 */
export function generateOtp () {
    const num = Math.floor(100000 + Math.random() * 900000)
    return num.toString()
}
