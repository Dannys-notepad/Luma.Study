import env from '#config/env.js'
import { Resend } from 'resend'
import AppError from '#lib/AppError.lib.js'

const resend = new Resend(env.RESEND_API_KEY)

/**
 * @param {{ to?: string, email?: string, subject?: string, text?: string }} recipient
 */
const mail = async (recipient) => {
    const toEmail = recipient?.to || recipient?.email
    try {
        if (!toEmail) {
            throw AppError.server('Recipient email is required')
        }

        const { data, error } = await resend.emails.send({
            from: `"Luma.Study" <${env.RESEND_FROM_EMAIL}>`,
            to: [toEmail],
            subject: recipient?.subject || 'No subject',
            text: recipient?.text || ''
        })

        if (error) {
            console.error('Resend email failed:', {
                to: toEmail,
                error
            })
            throw AppError.server(error.message, error)
         }

        console.log('Email sent:', data.id)
        return data
    } catch (error) {
        const message = error instanceof AppError ? error.message : 'Unknown mail error'
        console.error('Email failed to send:', toEmail, message)
        throw AppError.server(message, error)
    }
}

export default mail