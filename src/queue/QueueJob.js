import { EventEmitter } from "node:events";

class QueueJob extends EventEmitter {
    constructor (concurrency = 3) {
        super()
        this.jobs = []
        this.concurrency = concurrency
        this.active = 0
        this.isProcessing = false
    }

    add (job) {
        if (typeof job.handler !== 'function') {
            throw new Error('Job must have a handler function')
        }
        job.attempts = job.attempts ?? 0
        job.maxAttempts = job.maxAttempts ?? 3

        this.jobs.push(job)
        this._process()
    }

    async _process () {
        if (this.isProcessing) return
        this.isProcessing = true

        while (this.active < this.concurrency && this.jobs.length > 0) {
            const job = this.jobs.shift()
            this.active++

            this._executeJob(job)
        }

        this.isProcessing = false
    }

    async _executeJob (job) {
        try {
            await job.handler(job.data)
            this.emit('completed', job)
        } catch (error) {
            job.attempts++
            if (job.attempts < job.maxAttempts) {
                console.warn(`Job failed, retrying (${job.attempts}/${job.maxAttempts})`, error.message)

                this.jobs.unshift(job)
                this._process()
            } else {
                console.error('Job permanently failed:', error.message)
                this.emit('failed', job, error)
            }
        } finally {
            this.active--
            this._process()
        }
    }
}

export default QueueJob