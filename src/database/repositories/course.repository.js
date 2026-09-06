import { FieldValue } from "#database/firebase.js";
import BaseRepository from "./base.repository";
import { courseConverter, courseToUpdate } from '#database/models/course.model.js'

class CourseRepository extends BaseRepository {
    constructor () {
        super(['users', 'courses'], courseConverter, courseToUpdate)
    }

    findById (userId, courseId) {
        return super.findById([userId], courseId)
    }

    list (userId) {
        return super.list([userId])
    }

    create (userId, courseId, data) {
        return super.create([userId], courseId, data)
    }

    update (userId, courseId, partial) {
        return super.update([userId], courseId, partial)
    }

    delete (userId, courseId) {
        return super.delete([userId], courseId)
    }

    async addLecturerIfMissing (userId, courseId, lecturerName) {
        if (!lecturerName) {
            const ref = this.rawRef([userId], courseId)
            await ref.update({
                lecturers: FieldValue.arrayUnion(lecturerName)
            })
        }
    }
}

export default new CourseRepository()