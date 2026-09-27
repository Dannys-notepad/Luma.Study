import { db } from "#database/firebase.js";
import AppError from "#lib/AppError.lib.js";

const COLLECTION = 'idempotency_keys'
const TTL_MS = 24 * 60 * 60 * 1000

async function idempotency (req, res, next) {
    const key = req.header('Idempotency-Key')
    if (!key) return next()

    const docRef = db.collection(COLLECTION).doc(key)
    const now = Date.now()

    try {
        const result = await db.runTransaction(async (t) => {
            const snap = await t.get(docRef)

            if(snap.exists) {
                const data = snap.data()

                // Expired key -> treated as new
                if(data.expiresAt && data.expiresAt < now) {
                    t.set(docRef, {
                        status: 'processing',
                        createdAt: now,
                        expiresAt: now + TTL_MS,
                    })
                    return { cached: false }
                }

                if (data.status === 'complete') {
                    return { cached: true, response: data.response }
                }

                if (data.status === 'processing') {
                    return { conflict: true }
                }
            }

            // First time -> atomically claim key
            t.set(docRef, {
                status: 'processing',
                createdAt: now,
                expiresAt: now + TTL_MS,
            })
            return { cached: false }
        })

        if (result.conflict) {
            throw AppError.confilct('Request already in progress')
        }

        if (result.cached) {
            return res
            .status(result.response.status)
            .set('Idempotent-Replay', 'true')
            .json(result.response.body)
        }

        // A helper the route handler must call before responding
        res.completeIdempotent = async (status, body) => {
            await docRef.set(
                { status: 'complete', response: { status, body }, completedAt: Date.now() },
                { merge: true }
            )
        }

        // If the request crashes mid-flight, release the lock so retries can proceed
        res.on('close', async () => {
            if (!res.writableEnded) {
                try {
                    await docRef.delete()
                } catch (e) {
                    throw AppError.server()
                }
            }
        })

        next()
    } catch (error) {
        next(error)
    }
}

export default idempotency