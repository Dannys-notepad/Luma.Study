import { describe, it, expect, beforeEach } from 'vitest'
import { tokenRepository } from '#database/repositories/index.js'
import env from '#config/env.js'

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

describe('tokenRepository', () => {
    beforeEach(() => {
        if (env.NODE_ENV !== 'development' && !env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('To run tests, this project must be in development environment, and NODE_ENV set to "development" and FIRESTORE_EMULATOR_HOS set to "127.0.0.1:8081"')
        }
    })

    it('creates and finds a token by id', async () => {
        const userId = makeId('user')
        const tokenId = makeId('token')

        const data = {
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            revoked: false
        }

        await tokenRepository.create(userId, tokenId, data)

        const found = await tokenRepository.findById(userId, tokenId)

        expect(found).not.toBeNull()
        expect(found.id).toBe(tokenId)
        expect(found.revoked).toBe(false)
    })

    it('lists tokens for a user', async () => {
        const userId = makeId('user')
        const tokenId1 = makeId('token')
        const tokenId2 = makeId('token')

        await tokenRepository.create(userId, tokenId1, {
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            revoked: false
        })

        await tokenRepository.create(userId, tokenId2, {
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            revoked: true
        })

        const tokens = await tokenRepository.list(userId)

        expect(Array.isArray(tokens)).toBe(true)
        expect(tokens.some((t) => t.id === tokenId1)).toBe(true)
        expect(tokens.some((t) => t.id === tokenId2)).toBe(true)
    })

    it('updates a token', async () => {
        const userId = makeId('user')
        const tokenId = makeId('token')

        await tokenRepository.create(userId, tokenId, {
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            revoked: false
        })

        const updated = await tokenRepository.update(userId, tokenId, {
            revoked: true
        })

        expect(updated).not.toBeNull()
        expect(updated.revoked).toBe(true)

        const found = await tokenRepository.findById(userId, tokenId)
        expect(found.revoked).toBe(true)
    })

    it('deletes a token', async () => {
        const userId = makeId('user')
        const tokenId = makeId('token')

        await tokenRepository.create(userId, tokenId, {
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            revoked: false
        })

        await tokenRepository.delete(userId, tokenId)

        const found = await tokenRepository.findById(userId, tokenId)
        expect(found).toBeNull()
    })
})