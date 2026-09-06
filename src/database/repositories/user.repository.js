import BaseRepository from "./base.repository";
import { userConverter, userToUpdate } from '#database/models/user.model.js'

class UserRepository extends BaseRepository {
    constructor () {
        super(['users'], userConverter, userToUpdate)
    }

    findById (id) {
        return super.findById([], id)
    }

    create (id, data) {
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
}

export default new UserRepository()