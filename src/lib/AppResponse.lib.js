class AppResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({ success: true, message, data })
    }
    static error(res, message, statusCode, code, details) {
        return res.status(statusCode).json({ success: false, error: { code, message, details } })
    }
}

export default AppResponse