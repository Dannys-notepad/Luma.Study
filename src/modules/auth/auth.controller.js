import AppResponse from "#lib/AppResponse.lib.js"
import * as authService from "./auth.service.js"

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const handleGoogleCallback = async (req, res) => {
    const authUser = req.user
    const handleAuth = await authService.googleCallback(authUser)
    const { message, details, code } = handleAuth
    return AppResponse.success(res, details, message, code)
}

export const handleRegister = async (req, res) => {
    const { name, email, password } = req.body
    const result = await authService.registerUser(name, email, password)
    AppResponse.success(res, result.details, result.message, 201)
}

export const handleVerifyEmail = async (req, res) => {
    const { email, code } = req.body
    const result = await authService.verifyUserEmail(email, code)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleResendVerification = async (req, res) => {
    const { email } = req.body
    const result = await authService.resendVerificationCode(email)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleLogin = async (req, res) => {
    const { email, password } = req.body
    const result = await authService.loginUser(email, password)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleForgotPassword = async (req, res) => {
    const { email } = req.body
    const result = await authService.requestPasswordReset(email)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleResetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body
    const result = await authService.resetPassword(email, code, newPassword)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleRefresh = async (req, res) => {
    const { refreshToken } = req.body
    const result = await authService.refreshUserToken(refreshToken)
    AppResponse.success(res, result.details, result.message, 200)
}

export const handleLogout = async (req, res) => {
    const result = await authService.logoutUser(req.user.id, req.user.tokenId)
    AppResponse.success(res, result.details, result.message, 200)
}
