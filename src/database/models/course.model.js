import { FieldValue } from '#database/firebase.js';

const courseConverter = {
    toFirestore (course) {
        return {
            courseTitle: course.courseTitle,
            courseCode: course.courseCode,
            lecturers: course.lecturers ?? [],
            createdAt: FieldValue.serverTimestamp()
        }
    },

    fromFirestore (snapshot) {
        return {
            id: snapshot.id,
            ...snapshot.data()
        }
    }
}

const ALLOWED = ['courseTitle', 'courseCode', 'lecturers']

const courseToUpdate = (partial) => {
    const shaped = {}
    for (const key of ALLOWED) if (partial[key] !== undefined) shaped[key] = partial[key]
    return shaped
}

export {
    courseToUpdate,
    courseConverter
}