import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SECRET_KEY: z.string().min(1, 'SECRET_KEY is required'),
    REFRESH_SECRET_KEY: z.string().optional(),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    FIRESTORE_EMULATOR_HOST: z.string().default('localhost:8080').optional(),
    FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
    FIREBASE_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_CLIENT_EMAIL is required'),
    FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    GOOGLE_CALLBACK_URL: z.string().min(1, 'GOOGLE_CALLBACK_URL is required'),
    MAILJET_API_KEY: z.string().min(1, 'MAILJET_API_KEY is required'),
    MAILJET_API_SECRET: z.string().min(1, 'MAILJET_API_SECRET is required'),
    MAILJET_FROM_EMAIL: z.string().min(1, 'MAILJET_FROM_EMAIL is required'),
    MAILJET_FROM_NAME: z.string().default('Luma.Study')
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
    const formattedErrors = result.error.issues
        .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')
    console.error('Environment validation failed:\n' + formattedErrors)
    throw new Error(`Environment validation error:\n${formattedErrors}`)
}

const env = {
    ...result.data,
    REFRESH_SECRET_KEY: result.data.SECRET_KEY,
}

export default env