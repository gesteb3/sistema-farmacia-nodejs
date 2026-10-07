import { describe, expect, it } from 'vitest';
import { createPurchaseSchema } from './purchase.schemas.js';

const basePurchase = {
  supplierId: 'd36daec2-b108-407a-a4a3-64c9feb83685',
  invoiceNumber: ' fac-100 ',
  purchaseDate: '2026-10-07',
  items: [
    {
      medicationId: '583601d5-c63c-408f-8813-9b281cb21c46',
      batchNumber: ' lote-a ',
      expirationDate: '2027-12-31',
      quantity: 10,
      unitCost: 12.5,
    },
  ],
};

describe('validación de compras', () => {
  it('normaliza factura y lote', () => {
    const purchase = createPurchaseSchema.parse(basePurchase);
    expect(purchase.invoiceNumber).toBe('FAC-100');
    expect(purchase.items[0]?.batchNumber).toBe('LOTE-A');
  });

  it('rechaza medicamentos y lotes repetidos', () => {
    const result = createPurchaseSchema.safeParse({
      ...basePurchase,
      items: [basePurchase.items[0], basePurchase.items[0]],
    });
    expect(result.success).toBe(false);
  });
});
