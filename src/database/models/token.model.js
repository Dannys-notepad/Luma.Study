import { FieldValue } from '#database/firebase.js';

/**
 * @type {import('firebase-admin/firestore').FirestoreDataConverter<import('#types/token.type.js').TokenDoc>}
 */
const tokenConverter = {
    toFirestore (t) {
        return {
            expiresAt: t.expiresAt,
            revoked: t.revoked ?? false,
            createdAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        const data = snapshot.data()
        return {
            ...data,
            id: snapshot.id
        }
    }
}

const ALLOWED = ['expiresAt', 'revoked']

/**
 * Shapes partial token data for update operations.
 * @param {Partial<import('#types/token.type.js').TokenDoc>} partial
 * @returns {Record<string, any>}
 */
const tokenToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}

export {
    tokenToUpdate,
    tokenConverter
}