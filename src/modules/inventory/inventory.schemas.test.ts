import { describe, expect, it } from 'vitest';

import { createBatchSchema, stockMovementSchema } from './inventory.schemas.js';

describe('validación de inventario', () => {
  it('normaliza el número de lote', () => {
    const result = createBatchSchema.parse({
      medicationId: '3ad811f4-425f-44b8-bb93-983e22977054',
      batchNumber: ' lote-2026-a ',
      expirationDate: '2027-12-31',
      initialStock: 50,
    });

    expect(result.batchNumber).toBe('LOTE-2026-A');
    expect(result.reason).toBe('Registro inicial del lote');
  });

  it('rechaza movimientos con cantidad negativa', () => {
    expect(() =>
      stockMovementSchema.parse({ quantity: -5, reason: 'Venta' }),
    ).toThrow();
  });
});
