import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth'
import { userRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import AppError from '#lib/AppError.lib.js'
import env from './env.js'

passport.use(new GoogleStrategy(
    {
        consumerKey: env.GOOGLE_CLIENT_ID,
        consumerSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const aiCreditsResetsAt = startOfNextDay()
            const payload = {
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatarUrl: profile.photos?.[0]?.value ?? null,
                authProvider: 'google',

                emailIsVerified: true,
                aiCreditsResetsAt
            }

            let user = await userRepository.findById(payload.id)
            let isNewUser = false

            if (!user) {
                user = await userRepository.create(payload.id, payload)
                if (!user) throw AppError.server('Error creating/fetching user')
                isNewUser = true
            }
             
            done(null, { ...user, isNewUser })

        } catch (error) {
            done(error, null)
        }
    }
))

export default passport