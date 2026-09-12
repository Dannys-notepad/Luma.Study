import { z } from "zod";

export const courseIdParamSchema = z.object({
    id: z.string().min(1, 'Course ID is required')
})

export const fetchCourseParamSchema = courseIdParamSchema