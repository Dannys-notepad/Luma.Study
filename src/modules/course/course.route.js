import { Router } from 'express'
import * as validator from './course.validator.js'
import * as controller from './course.controller.js'
import asyncHandler from '#lib/asyncHandler.lib.js'
import authenticate from '#middlewares/auth.middleware.js'
import { validateBody, validateParams } from '#middlewares/validator.middleware.js'

const router = Router()

router.use(asyncHandler(authenticate))

router.get('/', asyncHandler(controller.handleFetchUserEnrolledCourses))
router.post('/', validateBody(validator.createCourseSchema), asyncHandler(controller.handleCreateCourse))
router.get('/:courseId', validateParams(validator.courseIdParamSchema), asyncHandler(controller.handleFetchAnEnrolledCourse))
router.patch('/:courseId', validateParams(validator.courseIdParamSchema), validateBody(validator.updateCourseSchema), asyncHandler(controller.handleUpdateCourse))
router.delete('/:courseId', validateParams(validator.courseIdParamSchema), asyncHandler(controller.handleDeleteCourse))


export default router