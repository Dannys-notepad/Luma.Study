import { EventEmitter } from "node:events";

class QueueJob {
    constructor (concurrency = 3) {
        super()
        this.jobs = []
        this.concurrency = concurrency
        this.active = 0
    }

    add (job) {
        this.jobs.push(job)
        this._process()
    }

    async _process () {
        if (this.active >= this.concurrency || this.jobs.length === 0) return

        const job = this.jobs.shift()
        this.active++

        try {
            await job.handler(job.data)
            this.emit('completed', job)
        } catch (error) {
            job.attempts = (job.attempts ?? 0) + 1
            if (job.attempts < (job.maxAttempts ?? 3)) {
                console.warn(`Job failed, retrying (${job.attempts}/${this.job.maxAttempts ?? 3})`)
                this.jobs.push(job)
            } else {
                console.error('Job permanently failed:', error.message)
                this.emit('Failed', job, error)
            }
        } finally {
            this.active--
            this._process()
        }
    }
}

export default QueueJob