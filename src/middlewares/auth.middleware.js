import jwt from 'jsonwebtoken'
import env from '#config/env.js'
import AppError from '#lib/AppError.lib.js'
import { tokenRepository } from '#database/repositories/index.js'

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization
        if (!authHeader?.startsWith('Bearer ')) {
            throw AppError.unauthorized('No token provided')
        }

        const token = authHeader.split(' ')[1]
        let decodedToken
        try {
            decodedToken = jwt.verify(token, env.SECRET_KEY)
        } catch (e) {
            if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
                throw AppError.unauthorized('Invalid or expired token')
            }
            throw e instanceof AppError ? e : AppError.unauthorized(e.message || 'Unauthorized')
        }

        const tokenDoc = await tokenRepository.findById(decodedToken.uid, decodedToken.tokenId)

        if (!tokenDoc || tokenDoc.revoked) throw AppError.unauthorized('Unauthorized')

        req.user = { 
            id: decodedToken.uid,
            tokenId: decodedToken.tokenId
        }
        next()
    } catch (err) {
        next(err)
    }
}

export default authenticate