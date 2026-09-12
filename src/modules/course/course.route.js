import { Router } from 'express'
import * as validator from './course.validator.js'
import * as controller from './course.controller.js'
import asyncHandler from '#lib/asyncHandler.lib.js'
import authenticate from '#middlewares/auth.middleware.js'
import { validateBody } from '#middlewares/validator.middleware.js'

const router = Router()

router.use(asyncHandler(authenticate))

router.get('/enrolledCourses', asyncHandler(controller.handleFetchUserEnrolledCourses))
router.get('/enrolledCourses/:id', asyncHandler())

export default router