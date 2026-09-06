import nodemailer from 'nodemailer'
import env from '#config/env.js'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD
    }
})


const mail = async (recipient) => {
    try {
        if (!recipient?.email) {
            throw new Error('Recipient email is required')
        }

        const info = await transporter.sendMail({
            from: `"Luma.Study" <${env.SMTP_USERNAME}>`,
            to: recipient.email,
            subject: recipient.subject || 'No subject',
            text: recipient.text || ''
        })

        console.log('Email sent', info.messageId)
        return info
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown mail error'
        console.error('Email failed to send:', recipient.email, message)
        return null
    }
}

export default mail