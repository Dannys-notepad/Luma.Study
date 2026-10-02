import { db } from "#database/firebase.js";
import AppError from "#lib/AppError.lib.js";

const COLLECTION = 'idempotency_keys'
const COMPLETE_TTL_MS = 24 * 60 * 60 * 1000   // 24 hours
const PROCESSING_TTL_MS = 30 * 1000           // 30 seconds

async function idempotency (req, res, next) {
    const key = req.header('Idempotency-Key')
    if (!key) return next()

    const docRef = db.collection(COLLECTION).doc(key)
    const now = Date.now()

    let result
    try {
        result = await db.runTransaction(async (t) => {
            const snap = await t.get(docRef)

            if (snap.exists) {
                const data = snap.data()

                if (data.status === 'complete') {
                    if (data.expiresAt && data.expiresAt < now) {
                        t.set(docRef, {
                            status: 'processing',
                            createdAt: now,
                            expiresAt: now + PROCESSING_TTL_MS,
                        })
                        return { cached: false }
                    }
                    return { cached: true, response: data.response }
                }

                if (data.status === 'processing') {
                    if (data.expiresAt && data.expiresAt < now) {
                        t.set(docRef, {
                            status: 'processing',
                            createdAt: now,
                            expiresAt: now + PROCESSING_TTL_MS,
                        })
                        return { cached: false }
                    }
                    return { conflict: true }
                }
            }

            t.set(docRef, {
                status: 'processing',
                createdAt: now,
                expiresAt: now + PROCESSING_TTL_MS,
            })
            return { cached: false }
        })
    } catch (err) {
        return next(err)
    }

    if (result.conflict) {
        return next(AppError.conflict('Request already in progress'))
    }

    if (result.cached) {
        return res
            .status(result.response.status)
            .set('Idempotent-Replay', 'true')
            .json(result.response.body)
    }

    // Auto-record completion when res.json is called.
    const originalJson = res.json.bind(res)
    res.json = async (body) => {
        try {
            await docRef.set(
                {
                    status: 'complete',
                    response: { status: res.statusCode, body },
                    completedAt: Date.now(),
                    expiresAt: Date.now() + COMPLETE_TTL_MS,
                },
                { merge: true }
            )
        } catch (err) {
            console.error('Failed to persist idempotency result:', err)
        }
        return originalJson(body)
    }

    next()
}

export default idempotency