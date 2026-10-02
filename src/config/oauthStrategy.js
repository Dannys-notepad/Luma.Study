import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { userRepository } from '#database/repositories/index.js'
import { startOfNextDay } from '#lib/dateHelpers.js'
import AppError from '#lib/AppError.lib.js'
import { AuthProvider } from '#constants/model.constant.js'
import env from './env.js'

passport.use(new GoogleStrategy(
    {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.toLowerCase().trim()

            if (!email) {
                return done(AppError.badRequest('Google account has no email address'))
            }

            const userId = userRepository.emailToId(email)

            // 1. Look up by deterministic ID (email-derived).
            let user = await userRepository.findById(userId)
            let isNewUser = false

            // 2. Existing email/password account — reject Google login.
            if (user && user.authProvider === AuthProvider.EMAIL) {
                return done(AppError.conflict(
                    'An account with this email already exists. Please log in with email and password instead.'
                ))
            }

            // 3. Create only if missing. Concurrent callbacks race here,
            //    and createStrict rejects the loser with ALREADY_EXISTS → 409.
            if (!user) {
                const payload = {
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                    avatarUrl: profile.photos?.[0]?.value ?? null,
                    authProvider: AuthProvider.GOOGLE,
                    emailIsVerified: true,
                    freeAiCreditsResetsAt: startOfNextDay()
                }

                user = await userRepository.createStrict(userId, payload)
                isNewUser = true
            }

            return done(null, { ...user, isNewUser })
        } catch (error) {
            return done(error)
        }
    }
))

export default passport