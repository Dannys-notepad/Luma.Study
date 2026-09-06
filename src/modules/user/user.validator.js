import { z } from 'zod'

export const completeProfileSchema = z.object({
    level: z.number().int().max(3),
    department: z.string().trim().min(3).max(100),
    university: z.string().trim().min(3).max(200),
    lectureTimeTable: z.array(
        z.object({
            courseCode: z.string().trim().regex(/^[A-Z]{2,4}\d{3}$/, 'Invalid course code format'),
            day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], {
                errorMap: () => ({ message: 'Day must be a valid day of the week from Monday to Sunday' })
            })
        })
    ),
})

