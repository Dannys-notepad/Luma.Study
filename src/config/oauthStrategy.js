import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth'
import { userRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import AppError from '#lib/AppError.lib.js'
import env from './env.js'

passport.use(new GoogleStrategy(
    {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const aiCreditsResetsAt = startOfNextDay()
            const payload = {
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value ?? null,

                emailIsVerified: true,
                aiCreditsResetsAt
            }

            let user = await userRepository.findById(payload.googleId)
            let isNewUser = false

            if (!user) {
                user = await userRepository.create(payload.googleId, payload)
                if (!user) throw new AppError.server('Error creating/fecthing user')
                isNewUser = true
            }
             
            done(null, { ...user, isNewUser })

        } catch (error) {
            done(error, null)
        }
    }
))

export default passport