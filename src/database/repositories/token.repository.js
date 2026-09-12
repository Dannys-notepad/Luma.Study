import { FieldValue } from "#database/firebase.js";
import BaseRepository from "./base.repository.js";
import { tokenConverter, tokenToUpdate } from '#database/models/token.model.js'

class TokenRepository extends BaseRepository {
    constructor () {
        super(['users', 'tokens'], tokenConverter, tokenToUpdate)
    }

    findById (userId, tokenId) {
        return super.findById([userId], tokenId)
    }

    list (userId) {
        return super.list([userId])
    }

    create (userId, tokenId, data) {
        if (typeof tokenId === 'object' && data === undefined) {
            data = tokenId
            tokenId = undefined
        }
        return super.create([userId], tokenId, data)
    }

    update (userId, tokenId, partial) {
        return super.update([userId], tokenId, partial)
    }

    delete (userId, tokenId) {
        return super.delete([userId], tokenId)
    }
}

export default new TokenRepository()