import { FieldValue } from '#database/firebase.js';


/**
 * @type {import('firebase-admin/firestore').FirestoreDataConverter<import('#types/course.type.js').Course>}
 */
const courseConverter = {
    toFirestore (course) {
        return {
            id: course.code ? course.code.replaceAll(' ', '-') : (course.id ?? null),
            title: course.title,
            code: course.code,
            creditUnit: course.creditUnit ?? 3,
            lecturers: course.lecturers ?? [],
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

const ALLOWED = ['title', 'code', 'creditUnit', 'lecturers']

/**
 * Shapes partial course payload for update.
 * @param {Partial<import('#types/course.type.js').Course>} partial
 * @returns {Record<string, any>}
 */
const courseToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}

export {
    courseToUpdate,
    courseConverter
}