import  { Timestamp } from '#database/firebase.js'

const unitToMs = {
    milis: 1, 
    seconds: 1000, 
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000
}

export function addTimeFromNow (amount, unit) {
    const multiplier = unitToMs[unit]
    return Timestamp.fromMillis(Date.now() + amount * multiplier)
}

export function startOfNextDay () {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    return Timestamp.fromMillis(next.getTime())
}

export function hasExpired (timestamp) {
    if (!timestamp) return true
    return timestamp.toMillis() < Date.now()
}