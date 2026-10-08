import { describe, expect, it } from 'vitest';
import { createUserSchema, loginSchema } from './auth.schemas.js';

describe('validación de autenticación', () => {
  it('normaliza el correo del login', () => {
    const login = loginSchema.parse({
      email: 'ADMIN@FARMACIA.LOCAL',
      password: 'Farmacia2026!',
    });
    expect(login.email).toBe('admin@farmacia.local');
  });

  it('asigna el rol de cajero por defecto', () => {
    const user = createUserSchema.parse({
      name: 'Cajero',
      email: 'cajero@farmacia.local',
      password: 'ClaveSegura123',
    });
    expect(user.role).toBe('CASHIER');
  });
});
