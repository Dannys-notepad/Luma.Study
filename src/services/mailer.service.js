import env from '#config/env.js'
import { BrevoClient } from '@getbrevo/brevo'
import AppError from '#lib/AppError.lib.js'

const brevo = new BrevoClient({
    apiKey: env.BREVO_API_KEY
})

/**
 * @param {{ to?: string, email?: string, subject?: string, text?: string }} recipient
 */
const mail = async (recipient) => {
    const toEmail = recipient?.to || recipient?.email
    try {
        if (!toEmail) {
            throw AppError.server('Recipient email is required')
        }

        const result = await brevo.transactionalEmails.sendTransacEmail({

            sender: {
                name: env.BREVO_FROM_NAME,
                email: env.BREVO_FROM_EMAIL
            },
            to: [
                {
                    email: toEmail
                }
            ],

            //from: `"Luma.Study" <${env.RESEND_FROM_EMAIL}>`,
            subject: recipient?.subject || 'No subject',
            text: recipient?.text || ''
        })

        console.log('Email sent:', result.messageId)
        return result
    } catch (error) {
        const message = error instanceof AppError ? error.message : 'Unknown mail error'
        console.error('Email failed to send:', toEmail, message)
        throw AppError.server(message, error)
    }
}

export default mail