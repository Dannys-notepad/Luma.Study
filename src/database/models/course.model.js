import { FieldValue } from '#database/firebase.js';

const courseConverter = {
    toFirestore (course) {
        return {
            id: course.code ? course.code.replaceAll(' ', '-') : (course.id ?? null),
            title: course.title,
            code: course.code,
            creditUnit: course.creditUnit,
            lecturers: course.lecturers ?? [],
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

const ALLOWED = ['title', 'code', 'creditUnit', 'lecturers']

const courseToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}

export {
    courseToUpdate,
    courseConverter
}