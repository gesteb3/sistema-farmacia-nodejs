-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('ENTRY', 'EXIT');

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "batch_number" VARCHAR(50) NOT NULL,
    "expiration_date" DATE NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_batches_expiration_date_idx" ON "inventory_batches"("expiration_date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_batches_medication_id_batch_number_key" ON "inventory_batches"("medication_id", "batch_number");

-- CreateIndex
CREATE INDEX "inventory_movements_batch_id_created_at_idx" ON "inventory_movements"("batch_id", "created_at");

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
