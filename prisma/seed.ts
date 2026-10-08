import { database } from '../src/config/database.js';
import { hash } from 'bcryptjs';

const medications = [
  {
    code: 'MED-001',
    name: 'Acetaminofén',
    activeIngredient: 'Paracetamol',
    presentation: 'Caja con 20 tabletas',
    concentration: '500 mg',
    purchasePrice: 8.5,
    salePrice: 12.75,
    requiresPrescription: false,
  },
  {
    code: 'MED-002',
    name: 'Ibuprofeno',
    activeIngredient: 'Ibuprofeno',
    presentation: 'Caja con 20 tabletas',
    concentration: '400 mg',
    purchasePrice: 12,
    salePrice: 18,
    requiresPrescription: false,
  },
  {
    code: 'MED-003',
    name: 'Amoxicilina',
    activeIngredient: 'Amoxicilina',
    presentation: 'Caja con 21 cápsulas',
    concentration: '500 mg',
    purchasePrice: 28,
    salePrice: 42,
    requiresPrescription: true,
  },
  {
    code: 'MED-004',
    name: 'Loratadina',
    activeIngredient: 'Loratadina',
    presentation: 'Caja con 10 tabletas',
    concentration: '10 mg',
    purchasePrice: 9,
    salePrice: 14,
    requiresPrescription: false,
  },
  {
    code: 'MED-005',
    name: 'Omeprazol',
    activeIngredient: 'Omeprazol',
    presentation: 'Caja con 30 cápsulas',
    concentration: '20 mg',
    purchasePrice: 20,
    salePrice: 31,
    requiresPrescription: false,
  },
  {
    code: 'MED-006',
    name: 'Metformina',
    activeIngredient: 'Metformina clorhidrato',
    presentation: 'Caja con 30 tabletas',
    concentration: '850 mg',
    purchasePrice: 18,
    salePrice: 27,
    requiresPrescription: true,
  },
  {
    code: 'MED-007',
    name: 'Losartán',
    activeIngredient: 'Losartán potásico',
    presentation: 'Caja con 30 tabletas',
    concentration: '50 mg',
    purchasePrice: 22,
    salePrice: 34,
    requiresPrescription: true,
  },
  {
    code: 'MED-008',
    name: 'Azitromicina',
    activeIngredient: 'Azitromicina',
    presentation: 'Caja con 3 tabletas',
    concentration: '500 mg',
    purchasePrice: 32,
    salePrice: 48,
    requiresPrescription: true,
  },
  {
    code: 'MED-009',
    name: 'Diclofenaco gel',
    activeIngredient: 'Diclofenaco sódico',
    presentation: 'Tubo de 30 gramos',
    concentration: '1 %',
    purchasePrice: 16,
    salePrice: 24.5,
    requiresPrescription: false,
  },
  {
    code: 'MED-010',
    name: 'Vitamina C',
    activeIngredient: 'Ácido ascórbico',
    presentation: 'Frasco con 60 tabletas',
    concentration: '500 mg',
    purchasePrice: 14,
    salePrice: 21,
    requiresPrescription: false,
  },
];

const suppliers = [
  {
    nit: '1000001-1',
    name: 'Distribuidora Farmacéutica Central',
    contactName: 'Ana López',
    phone: '+502 2222-1001',
    email: 'ventas@distribuidoracentral.example',
    address: 'Ciudad de Guatemala',
  },
  {
    nit: '1000002-2',
    name: 'Suministros Médicos del Norte',
    contactName: 'Carlos Méndez',
    phone: '+502 2222-1002',
    email: 'pedidos@suministrosnorte.example',
    address: 'Cobán, Alta Verapaz',
  },
  {
    nit: '1000003-3',
    name: 'Productos de Salud Occidente',
    contactName: 'María González',
    phone: '+502 2222-1003',
    email: 'contacto@saludoccidente.example',
    address: 'Quetzaltenango',
  },
];

const seed = async () => {
  for (const medication of medications) {
    await database.medication.upsert({
      where: { code: medication.code },
      update: medication,
      create: medication,
    });
  }

  for (const supplier of suppliers) {
    await database.supplier.upsert({
      where: { nit: supplier.nit },
      update: supplier,
      create: supplier,
    });
  }

  await database.user.upsert({
    where: { email: 'admin@farmacia.local' },
    update: { name: 'Administrador', role: 'ADMIN', isActive: true },
    create: {
      name: 'Administrador',
      email: 'admin@farmacia.local',
      passwordHash: await hash('Farmacia2026!', 12),
      role: 'ADMIN',
    },
  });

  console.log(
    `${medications.length} medicamentos, ${suppliers.length} proveedores y el usuario administrador disponibles.`,
  );
};

seed()
  .catch((error: unknown) => {
    console.error('No fue posible cargar los datos de demostración.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
