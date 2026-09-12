import jwt from 'jsonwebtoken'
import env from '#config/env.js'
import AppError from '#lib/AppError.lib.js'
import { hasExpired } from '#lib/dateHelpers.js'
import { tokenRepository } from '#database/repositories/index.js'
import { TokenType } from '#constants/model.constant.js'

/**
 * Authentication middleware for verifying short-lived Access Tokens.
 * Checks JWT signature, token type, and Firestore session status (revocation & expiration).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
    try {
        const rawAuthHeader = req.headers.authorization || req.headers.Authorization
        const authHeader = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader

        if (!authHeader?.startsWith('Bearer ')) {
            throw AppError.unauthorized('No token provided')
        }

        const token = authHeader.split(' ')[1]
        let decodedToken
        try {
            decodedToken = jwt.verify(token, env.SECRET_KEY)
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                throw AppError.unauthorized('Access token has expired')
            }
            if (e.name === 'JsonWebTokenError') {
                throw AppError.unauthorized('Invalid access token')
            }
            throw e instanceof AppError ? e : AppError.unauthorized(e.message || 'Unauthorized')
        }

        // Prevent refresh tokens from being used as access tokens
        if (decodedToken.type && decodedToken.type === TokenType.REFRESH) {
            throw AppError.unauthorized('Refresh token cannot be used for resource access')
        }

        const tokenDoc = await tokenRepository.findById(decodedToken.uid, decodedToken.tokenId)

        if (!tokenDoc) {
            throw AppError.unauthorized('Session not found')
        }
        if (tokenDoc.revoked) {
            throw AppError.unauthorized('Token has been revoked')
        }
        if (hasExpired(tokenDoc.expiresAt)) {
            throw AppError.unauthorized('Session has expired')
        }

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