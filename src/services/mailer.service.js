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
            textContent: recipient?.text || ''
        })

        console.log('Email sent:', result.messageId)
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