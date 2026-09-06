import { Router } from "express";
import * as controller from './user.controller.js';
import * as validator from './user.validator.js'
import asyncHandler from "#lib/asyncHandler.lib.js";
import authenticate from "#middlewares/auth.middleware.js";
import { validateBody } from "#middlewares/validator.middleware.js";

const router = Router()

router.use(authenticate)

router.get('/profile', asyncHandler(controller.handleFetchUserProfile))
router.post('/profile/complete', asyncHandler(validateBody(validator.completeProfileSchema)), asyncHandler(controller.handleCompleteUserProfile))

export default router