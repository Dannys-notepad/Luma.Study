import { z } from 'zod'

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long').max(100, 'Password cannot exceed 100 characters')
})

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

export const verifyEmailSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    code: z.string().trim().length(6, 'Verification code must be exactly 6 digits')
})

export const resendVerificationSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address')
})

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address')
})

export const resetPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    code: z.string().trim().length(6, 'Reset code must be exactly 6 digits'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(100, 'New password cannot exceed 100 characters')
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1, 'Refresh token is required')
})
