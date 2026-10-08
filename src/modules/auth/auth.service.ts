import { compare, hash } from 'bcryptjs';
import { SignJWT } from 'jose';

import { database } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { CreateUserInput } from './auth.schemas.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);
const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

export const authService = {
  async login(email: string, password: string) {
    const user = await database.user.findUnique({ where: { email } });
    if (
      !user ||
      !user.isActive ||
      !(await compare(password, user.passwordHash))
    ) {
      throw new AppError(401, 'Correo o contraseña incorrectos.');
    }

    const token = await new SignJWT({ role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  },

  findPublicUser: (id: string) =>
    database.user.findUnique({ where: { id }, select: publicUser }),

  listUsers: () =>
    database.user.findMany({ select: publicUser, orderBy: { name: 'asc' } }),

  async createUser(input: CreateUserInput) {
    if (await database.user.findUnique({ where: { email: input.email } })) {
      throw new AppError(409, 'Ya existe un usuario con ese correo.');
    }
    return database.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, 12),
        role: input.role,
      },
      select: publicUser,
    });
  },
};
