import QueueJob from "#queue/QueueJob.js";
import sendEmail from "#services/mailer.service.js";

const emailQueue = new QueueJob(5)

export const enqueueEmail = (payload) => {
    emailQueue.add({
        handler: async (data) => {
            await sendEmail({ to: data.payload.email, subject: data.payload.subject, text: data.payload.text })
        },
        data: { payload },
        maxAttempts: 3,
    })
}

export default emailQueue