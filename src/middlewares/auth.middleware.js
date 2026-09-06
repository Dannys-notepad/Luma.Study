import jwt from 'jsonwebtoken'
import env from '#config/env.js'
import AppError from '#lib/AppError.lib.js'
import { tokenRepositry } from '#database/repositories/index.js'

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError.unauthorized('No token provided')
    }

    const token = authHeader.split(' ')[1]
    let decodedToken
    try {
        decodedToken = jwt.verify(token, env.SECRET_KEY)
    } catch (e) {

        if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
            throw new AppError.unauthorized('Invalid or expired token')
        }

        throw new AppError(e)
    }

    const tokenDoc = await tokenRepositry.findById(decodedToken.uid, decodedToken.tokenId)

    if (!tokenDoc || tokenDoc.revoked) throw new AppError.unauthorized('Unauthorized')

    req.user = { 
        id: decodedToken.uid,
        tokenId: decodedToken.tokenId
    }
    next()

}

export default authenticate