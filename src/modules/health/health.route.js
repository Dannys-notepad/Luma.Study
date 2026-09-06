import { Router } from 'express';
import AppResponse from '#lib/AppResponse.lib.js';
import asyncHandler from '#lib/asyncHandler.lib.js';

const router = Router();

router.get('/', asyncHandler((req, res) => {
    AppResponse.success(res)
}))

export default router;