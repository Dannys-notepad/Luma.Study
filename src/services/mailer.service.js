import nodemailer from 'nodemailer'
import env from '#config/env.js'

const transporter = nodemailer.createTransport({
    ...(env.SMTP_HOST
        ? {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE === 'true'
        }
        : { service: 'gmail' }),
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD
    }
})


/**
 * @param {{ to?: string, email?: string, subject?: string, text?: string }} recipient
 */
const mail = async (recipient) => {
    const toEmail = recipient?.to || recipient?.email
    try {
        if (!toEmail) {
            throw new Error('Recipient email is required')
        }

        const info = await transporter.sendMail({
            from: `"Luma.Study" <${env.SMTP_USERNAME}>`,
            to: toEmail,
            subject: recipient.subject || 'No subject',
            text: recipient.text || ''
        })

        console.log('Email sent', info.messageId)
        return info
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown mail error'
        console.error('Email failed to send:', toEmail, message)
        throw error
    }
}

export default mail