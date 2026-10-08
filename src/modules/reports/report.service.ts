import { database } from '../../config/database.js';

const startOfUtcDay = (date: Date) => {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

export const reportService = {
  async dashboard() {
    const now = new Date();
    const today = startOfUtcDay(now);
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const expirationLimit = new Date(today);
    expirationLimit.setUTCDate(expirationLimit.getUTCDate() + 30);

    const [medications, batches, todaySales, monthSales] = await Promise.all([
      database.medication.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
      }),
      database.inventoryBatch.findMany({
        include: {
          medication: { select: { id: true, code: true, name: true } },
        },
      }),
      database.sale.aggregate({
        where: { soldAt: { gte: today } },
        _count: { id: true },
        _sum: { total: true },
      }),
      database.sale.aggregate({
        where: { soldAt: { gte: monthStart } },
        _count: { id: true },
        _sum: { total: true },
      }),
    ]);

    const stockByMedication = new Map(
      medications.map((medication) => [
        medication.id,
        { ...medication, stock: 0 },
      ]),
    );
    let totalStock = 0;
    for (const batch of batches) {
      totalStock += batch.stock;
      const current = stockByMedication.get(batch.medicationId) ?? {
        ...batch.medication,
        stock: 0,
      };
      current.stock += batch.stock;
      stockByMedication.set(batch.medicationId, current);
    }

    const lowStock = [...stockByMedication.values()]
      .filter((item) => item.stock <= 10)
      .sort((a, b) => a.stock - b.stock);
    const expiringBatches = batches
      .filter(
        (batch) =>
          batch.stock > 0 &&
          batch.expirationDate >= today &&
          batch.expirationDate <= expirationLimit,
      )
      .map((batch) => ({
        id: batch.id,
        batchNumber: batch.batchNumber,
        expirationDate: batch.expirationDate,
        stock: batch.stock,
        medication: batch.medication,
      }))
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

    return {
      summary: {
        activeMedications: medications.length,
        totalStock,
        todaySalesCount: todaySales._count.id,
        todayRevenue: String(todaySales._sum.total ?? 0),
        monthSalesCount: monthSales._count.id,
        monthRevenue: String(monthSales._sum.total ?? 0),
        lowStockCount: lowStock.length,
        expiringBatchCount: expiringBatches.length,
      },
      alerts: { lowStock, expiringBatches },
    };
  },
};
