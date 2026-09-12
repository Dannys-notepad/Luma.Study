import { Timestamp } from '#database/firebase.js'

const unitToMs = {
    milis: 1, 
    seconds: 1000, 
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000
}

/**
 * Adds time to the current date and returns a Firestore Timestamp.
 * @param {number} amount
 * @param {'milis'|'seconds'|'minutes'|'hours'|'days'} unit
 * @returns {Timestamp}
 */
export function addTimeFromNow (amount, unit) {
    const multiplier = unitToMs[unit] || 1000
    return Timestamp.fromMillis(Date.now() + amount * multiplier)
}

/**
 * Returns a Firestore Timestamp for midnight at the start of next day.
 * @returns {Timestamp}
 */
export function startOfNextDay () {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    return Timestamp.fromMillis(next.getTime())
}

/**
 * Safely checks if a given timestamp (Timestamp instance, Date, ISO string, or millis number) has expired.
 * @param {Timestamp|Date|string|number|null|undefined} timestamp
 * @returns {boolean}
 */
export function hasExpired (timestamp) {
    if (!timestamp) return true

    let millis = 0
    if (typeof timestamp === 'object' && typeof timestamp.toMillis === 'function') {
        millis = timestamp.toMillis()
    } else if (timestamp instanceof Date) {
        millis = timestamp.getTime()
    } else if (typeof timestamp === 'number') {
        millis = timestamp
    } else if (typeof timestamp === 'string') {
        millis = new Date(timestamp).getTime()
    } else {
        return true
    }

    return millis < Date.now()
}