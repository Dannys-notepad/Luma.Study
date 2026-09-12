import BaseRepository from "./base.repository.js";
import { userConverter, userToUpdate } from '#database/models/user.model.js'

class UserRepository extends BaseRepository {
    constructor () {
        super(['users'], userConverter, userToUpdate)
    }

    findById (id) {
        return super.findById([], id)
    }

    create (id, data) {
        if (typeof id === 'object' && data === undefined) {
            data = id
            id = undefined
        }
        return super.create([], id, data)
    }

    update (id, partial) {
        return super.update([], id, partial)
    }

    delete (id) {
        return super.delete([], id)
    }

    async findByEmail (email) {
        const results = await this.findWhere([], 'email', '==', email)
        return results[0] ?? null
    }

    async findByGoogleId (googleId) {
        const results = await this.findWhere([], 'googleId', '==', googleId)
        return results[0] ?? null
    }

    async findByGoolgeId (googleId) {
        return this.findByGoogleId(googleId)
    }
}

export default new UserRepository()