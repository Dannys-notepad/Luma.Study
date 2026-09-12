import { FieldValue, Timestamp } from '#database/firebase.js';

const tokenConverter = {
    toFirestore (t) {
        return {
            //token: t.token,       //no need to save token to db since it won't be used for db lookups
            expiresAt: t.expiresAt,
            revoked: t.revoked ?? false,
            createdAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        return {
            ...snapshot.data(),
            id: snapshot.id
        }
    }
}

const ALLOWED = [/*'token',*/ 'expiresAt', 'revoked']

const tokenToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}

export {
    tokenToUpdate,
    tokenConverter
}