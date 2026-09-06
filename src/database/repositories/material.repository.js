import BaseRepository from "./base.repository";
import { materialConverter, materialToUpdate } from '#database/models/material.model.js'

class MaterialRepository extends BaseRepository {
    constructor () {
        super(['users', 'courses', 'materials'], materialConverter, materialToUpdate)
    }

    findById (userId, courseId, materialId) {
            return super.findById([userId, courseId], materialId)
        }
    
        list (userId, courseId) {
            return super.list([userId, courseId])
        }
    
        create (userId, courseId, materialId, data) {
            return super.create([userId, courseId], materialId, data)
        }
    
        update (userId, courseId, materialId, partial) {
            return super.update([userId, courseId], materialId, partial)
        }
    
        delete (userId, courseId, materialId) {
            return super.delete([userId, courseId], materialId)
        }
    
        findByCategory (userId, courseId, category) {
            return this.findWhere([userId, courseId], 'category', '==', category)
        }
}

export default new MaterialRepository()