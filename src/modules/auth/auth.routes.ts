import { Router } from 'express';
import { createUser, listUsers, login, me } from './auth.controller.js';
import { authenticate, authorize } from './auth.middleware.js';

export const authRouter = Router();
authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);

export const userRouter = Router();
userRouter.use(authenticate, authorize('ADMIN'));
userRouter.route('/').post(createUser).get(listUsers);
