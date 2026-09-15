import { z } from "zod";

export const courseIdParamSchema = z.object({
    courseId: z.string().trim().min(1, 'Course ID is required')
})

export const createCourseSchema = z.object({
    courseTitle: z.string().trim().min(1, 'Course title is required').max(120, 'Course title is too long'),
    courseCode: z.string().trim().min(2, 'Course code is required').regex(/^[A-Za-z0-9\s-]{2,20}$/, 'Invalid course code format'),
    creditUnit: z.number().int().min(1).max(12).optional(),
    lecturers: z.array(z.string().trim().min(1)).optional()
})

export const updateCourseSchema = z.object({
    title: z.string().trim().min(1, 'Course title is required').max(120, 'Course title is too long').optional(),
    code: z.string().trim().min(2, 'Course code is required').regex(/^[A-Za-z0-9\s-]{2,20}$/, 'Invalid course code format').optional(),
    creditUnit: z.number().int().min(1).max(12).optional(),
    lecturers: z.array(z.string().trim().min(1)).optional()
})