import { describe, expect, it } from 'vitest';

import {
  createMedicationSchema,
  listMedicationsSchema,
} from './medication.schemas.js';

describe('validación de medicamentos', () => {
  it('normaliza el código y acepta datos válidos', () => {
    const result = createMedicationSchema.parse({
      code: ' med-001 ',
      name: 'Acetaminofén',
      activeIngredient: 'Paracetamol',
      presentation: 'Caja con 20 tabletas',
      concentration: '500 mg',
      purchasePrice: 10,
      salePrice: 15.5,
    });

    expect(result.code).toBe('MED-001');
    expect(result.requiresPrescription).toBe(false);
  });

  it('rechaza un precio de venta menor al precio de compra', () => {
    const result = createMedicationSchema.safeParse({
      code: 'MED-002',
      name: 'Ibuprofeno',
      activeIngredient: 'Ibuprofeno',
      presentation: 'Caja',
      purchasePrice: 20,
      salePrice: 15,
    });

    expect(result.success).toBe(false);
  });

  it('limita la paginación a un máximo de 100 registros', () => {
    expect(() => listMedicationsSchema.parse({ limit: '101' })).toThrow();
  });
});
