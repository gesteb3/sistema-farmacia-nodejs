import { describe, expect, it } from 'vitest';
import { createSaleSchema } from './sale.schemas.js';

const item = {
  medicationId: '583601d5-c63c-408f-8813-9b281cb21c46',
  quantity: 2,
};

describe('validación de ventas', () => {
  it('admite una venta a consumidor final', () => {
    const sale = createSaleSchema.parse({
      invoiceNumber: ' v-001 ',
      items: [item],
    });
    expect(sale.invoiceNumber).toBe('V-001');
    expect(sale.customerId).toBeNull();
  });
  it('rechaza medicamentos repetidos', () => {
    expect(
      createSaleSchema.safeParse({ invoiceNumber: 'V-2', items: [item, item] })
        .success,
    ).toBe(false);
  });
});
