import crypto from 'node:crypto'
import BaseRepository from "./base.repository.js";
import { userConverter, userToUpdate } from '#database/models/user.model.js'

class UserRepository extends BaseRepository {
    constructor () {
        super(['users'], userConverter, userToUpdate)
    }

    /**
     * Deterministic user ID derived from email.
     * Same email (case-insensitive) → same ID → Firestore rejects the second create.
     */
    emailToId (email) {
        return crypto
            .createHash('sha256')
            .update(email.toLowerCase().trim())
            .digest('hex')
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

    createStrict (id, data) {
        return super.createStrict([], id, data)
    }

    update (id, partial) {
        return super.update([], id, partial)
    }

    delete (id) {
        return super.delete([], id)
    }

    async findByEmail (email) {
        const normalized = email.toLowerCase().trim()
        const results = await this.findWhere([], 'email', '==', normalized)
        return results[0] ?? null
    }

    async findByGoogleId (googleId) {
        const results = await this.findWhere([], 'googleId', '==', googleId)
        return results[0] ?? null
    }
}

export default new UserRepository()