import BaseRepository from "./base.repository.js";
import { tokenConverter, tokenToUpdate } from '#database/models/token.model.js'

/**
 * Repository for managing token documents stored under users/{userId}/tokens/{tokenId}
 */
class TokenRepository extends BaseRepository {
    constructor () {
        super(['users', 'tokens'], tokenConverter, tokenToUpdate)
    }

    /**
     * @param {string} userId
     * @param {string} tokenId
     * @returns {Promise<import('#types/token.type.js').TokenDoc|null>}
     */
    findById (userId, tokenId) {
        return super.findById([userId], tokenId)
    }

    /**
     * @param {string} userId
     * @returns {Promise<import('#types/token.type.js').TokenDoc[]>}
     */
    list (userId) {
        return super.list([userId])
    }

    /**
     * @param {string} userId
     * @param {string|Partial<import('#types/token.type.js').TokenDoc>} tokenId
     * @param {Partial<import('#types/token.type.js').TokenDoc>} [data]
     * @returns {Promise<import('#types/token.type.js').TokenDoc>}
     */
    create (userId, tokenId, data) {
        if (typeof tokenId === 'object' && data === undefined) {
            data = tokenId
            tokenId = undefined
        }
        return super.create([userId], tokenId, data)
    }

    /**
     * @param {string} userId
     * @param {string} tokenId
     * @param {Partial<import('#types/token.type.js').TokenDoc>} partial
     * @returns {Promise<import('#types/token.type.js').TokenDoc>}
     */
    update (userId, tokenId, partial) {
        return super.update([userId], tokenId, partial)
    }

    /**
     * @param {string} userId
     * @param {string} tokenId
     * @returns {Promise<void>}
     */
    delete (userId, tokenId) {
        return super.delete([userId], tokenId)
    }
}

export default new TokenRepository()