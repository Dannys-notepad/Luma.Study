import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from '#config/oauthStrategy.js'
import env from '#config/env.js'
import { Timestamp } from '#database/firebase.js'
import { tokenRepository } from '#database/repositories/index.js'
import authenticate from '#middlewares/auth.middleware.js'
import AppError from '#lib/AppError.lib.js'
import AppResponse from '#lib/AppResponse.lib.js'
import asyncHandler from '#lib/asyncHandler.lib.js'
import { enqueueEmail } from '#queue/queues/mailer.queue.js'
import { addTimeFromNow } from '#lib/dateHelpers.js'

const router = Router()

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {

        const tokenId = tokenRepository._collection([req.user.id]).doc().id

        const token = jwt.sign(
            { uid: req.user.id, tokenId },
            env.SECRET_KEY,
            { expiresIn: '7d' }
        )

        const expiresAt = addTimeFromNow(7, 'days')
        const addTokenToDb = await tokenRepository.create(req.user.id, tokenId, {
            //token,    //no need to save token to db since it won't be used for db lookups
            expiresAt,
            revoked: false
        })

        if (!addTokenToDb) throw AppError.server('Could not save token')

        let statusCode = 200
        let message = 'User token created'

        if (req.user.isNewUser) {
            statusCode = 201
            message = 'User registered'
            const payload = onBoardingEmailTemp(req.user.email, req.user.name)
            enqueueEmail(payload)
        }

        AppResponse.success(res, { token }, message, statusCode)
    })
)

router.post('/logout', authenticate, asyncHandler( async (req, res) => {
    const revokeToken = await tokenRepository.update(req.user.id, req.user.tokenId, { revoked: true })
    if (!revokeToken) throw AppError.server('Could not revoke token')

    AppResponse.success(res, {}, 'Token successfully revoked', 200)
} ))

function onBoardingEmailTemp (email, name) {
    const mailMsg = `
    Hi ${name},

    Welcome to Luma.Study 👋

    Here's the idea: instead of scattered notes across your phone, drive, and Whatsapp chats, Luma.Study becomes your one lecture vault for the semester and an AI that actually knows what you were taught.

    How it works:

    1. Set Your Timetable: Add your lecture schedule so Luma knows which course you're in and when.

    2. Upload After Each Lecture: PDFs, docs, audio recordings, or even photos of the whiteboard. Add the lecture's name, topic, and any extra info. Luma reads and organizes it in the background.

    3. Ask Luma Anything: Before a test, open the chat and ask: "Generate possible questions from my Elementary Process notes, weeks 1-4" or "Summarize what Dr. Adeyemi covered on redox reactions". Luma answers strictly from what you've uploaded, no random internet guesses, just what you were actually taught. You could also make research with Luma on a particular topic, Luma has access to verified sources based on what you want to study or make research on.

    4. Upload Past Questions Too: Feed in old exam papers so Luma can spot patterns and generate realistic practice questions.

    By the end of the semester, you won't just have a pile of files, you'll have a study partner that has read everything you've read.

    [Set up your timetable ->]

    Let's make this semester easier.

    - The Luma.Study Team
    `

    return {
        to: email,
        subject: `Let's get your semester into Luma.Study`,
        text: mailMsg
    }
}

export default router