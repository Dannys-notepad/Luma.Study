import { db } from "#database/firebase.js";
import AppError from "#lib/AppError.lib.js";

const COLLECTION = 'idempotency_keys';
const COMPLETE_TTL_MS = 24 * 60 * 60 * 1000;   // 24 hours
const PROCESSING_TTL_MS = 30 * 1000;           // 30 seconds

async function idempotency(req, res, next) {
    const key = req.header('Idempotency-Key');
    if (!key) return next();

    const docRef = db.collection(COLLECTION).doc(key);
    const now = Date.now();

    let result;
    try {
        result = await db.runTransaction(async (t) => {
            const snap = await t.get(docRef);

            if (snap.exists) {
                const data = snap.data();

                // Completed → replay cached response
                if (data.status === 'complete') {
                    if (data.expiresAt && data.expiresAt < now) {
                        // Too old; treat as new
                        t.set(docRef, {
                            status: 'processing',
                            createdAt: now,
                            expiresAt: now + PROCESSING_TTL_MS,
                        });
                        return { cached: false };
                    }
                    return { cached: true, response: data.response };
                }

                // Processing → is the lock still fresh?
                if (data.status === 'processing') {
                    if (data.expiresAt && data.expiresAt < now) {
                        // Stale lock; take it over
                        t.set(docRef, {
                            status: 'processing',
                            createdAt: now,
                            expiresAt: now + PROCESSING_TTL_MS,
                        });
                        return { cached: false };
                    }
                    return { conflict: true };
                }
            }

            // First time
            t.set(docRef, {
                status: 'processing',
                createdAt: now,
                expiresAt: now + PROCESSING_TTL_MS,
            });
            return { cached: false };
        });
    } catch (err) {
        return next(err);
    }

    if (result.conflict) {
        return next(AppError.conflict('Request already in progress'));
    }

    if (result.cached) {
        return res
            .status(result.response.status)
            .set('Idempotent-Replay', 'true')
            .json(result.response.body);
    }

    // Wrap res.json so completion is recorded automatically.
    // Route handlers just call res.status(...).json(...) as normal.
    const originalJson = res.json.bind(res);
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
            );
        } catch (err) {
            // Log but don't fail the response — the client already got their data.
            console.error('Failed to persist idempotency result:', err);
        }
        return originalJson(body);
    };

    next();
}

export default idempotency;