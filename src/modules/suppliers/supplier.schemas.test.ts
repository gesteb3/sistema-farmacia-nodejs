import { describe, expect, it } from 'vitest';

import { createSupplierSchema } from './supplier.schemas.js';

describe('validación de proveedores', () => {
  it('normaliza el NIT y completa campos opcionales', () => {
    const supplier = createSupplierSchema.parse({
      nit: ' 1234567-8 ',
      name: 'Distribuidora Central',
    });

    expect(supplier.nit).toBe('1234567-8');
    expect(supplier.email).toBeNull();
    expect(supplier.phone).toBeNull();
  });

  it('rechaza un correo inválido', () => {
    const result = createSupplierSchema.safeParse({
      nit: '1234567-8',
      name: 'Distribuidora Central',
      email: 'correo-invalido',
    });

    expect(result.success).toBe(false);
  });
});
