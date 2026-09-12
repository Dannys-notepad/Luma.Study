import { z } from 'zod'

export const completeProfileSchema = z.object({
    level: z.number().int().min(1).max(1000),
    department: z.string().trim().min(3).max(100),
    faculty: z.string().trim().min(2).max(100).optional(),
    university: z.string().trim().min(3).max(200),
    academicSession: z.string().trim().regex(/^\d{4}\/\d{4}$/, 'Academic session format must be YYYY/YYYY (e.g. 2024/2025)').optional(),
    timezone: z.string().trim().optional(),
    learningMode: z.enum(['Exam Prep', 'Concept Understanding', 'Summary Only']).optional(),
    lectureTimeTable: z.array(
        z.object({
            day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], {
                errorMap: () => ({ message: 'Day must be a valid day of the week from Monday to Sunday' })
            }),
            courseCodes: z.array(z.string().trim().regex(/^[A-Z]{2,4}\d{3}$/, 'Invalid course code format')),
        })
    ),
    courseTitles: z.array(z.string().trim()),
    creditUnits: z.union([z.number().int(), z.array(z.number().int())]),
    currentSemester: z.enum(['First', 'Second'], {
        errorMap: () => ({ message: 'Current semester must be a valid semester from First or Second' })
    })
})