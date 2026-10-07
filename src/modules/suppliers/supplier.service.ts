import { AppError } from '../../shared/errors/app-error.js';
import { supplierRepository } from './supplier.repository.js';
import type {
  CreateSupplierInput,
  ListSuppliersInput,
  UpdateSupplierInput,
} from './supplier.schemas.js';

const findSupplier = async (id: string) => {
  const supplier = await supplierRepository.findById(id);

  if (!supplier) {
    throw new AppError(404, 'El proveedor solicitado no existe.');
  }

  return supplier;
};

const ensureUniqueNit = async (nit: string, currentId?: string) => {
  const supplier = await supplierRepository.findByNit(nit);

  if (supplier && supplier.id !== currentId) {
    throw new AppError(409, `Ya existe un proveedor con el NIT ${nit}.`);
  }
};

export const supplierService = {
  async create(data: CreateSupplierInput) {
    await ensureUniqueNit(data.nit);
    return supplierRepository.create(data);
  },

  list: (input: ListSuppliersInput) => supplierRepository.findMany(input),
  findById: (id: string) => findSupplier(id),

  async update(id: string, data: UpdateSupplierInput) {
    await findSupplier(id);

    if (data.nit) {
      await ensureUniqueNit(data.nit, id);
    }

    return supplierRepository.update(id, data);
  },

  async deactivate(id: string) {
    await findSupplier(id);
    await supplierRepository.update(id, { isActive: false });
  },
};
