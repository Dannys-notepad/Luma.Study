import env from '#config/env.js'
import Mailjet from 'node-mailjet'
import AppError from '#lib/AppError.lib.js'

const mailjet = Mailjet.apiConnect(
    env.MAILJET_API_KEY,
    env.MAILJET_API_SECRET
)

/**
 * @param {{ to?: string, email?: string, subject?: string, text?: string }} recipient
 */
const mail = async (recipient) => {
    const toEmail = recipient?.to || recipient?.email
    try {
        if (!toEmail) {
            throw AppError.server('Recipient email is required')
        }

        const result = await mailjet
        .post('send', { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: env.MAILJET_FROM_EMAIL,
                        Name: env.MAILJET_FROM_NAME
                    },
                    To: [
                        {
                            Email: toEmail
                        }
                    ],
                    Subject: recipient?.subject || 'No subject',
                    TextPart: recipient?.text || ''
                }
            ]
        })

        console.log('Email sent:', result)
        return result
    } catch (error) {
        console.error('Brevo email error', {
            error,
            name: error.name,
            message: error.message,
            stack: error.stack,
            body: error?.body
        })
        throw AppError.server(error.message, error)
    }
}

export default mail