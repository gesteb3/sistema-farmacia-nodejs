import { describe, expect, it } from 'vitest';
import { createCustomerSchema } from './customer.schemas.js';

describe('validación de clientes', () => {
  it('admite consumidor sin NIT', () => {
    const customer = createCustomerSchema.parse({ name: 'Consumidor Final' });
    expect(customer.nit).toBeNull();
    expect(customer.email).toBeNull();
  });

  it('normaliza el NIT', () => {
    const customer = createCustomerSchema.parse({
      name: 'Cliente',
      nit: ' cf-123 ',
    });
    expect(customer.nit).toBe('CF-123');
  });
});
