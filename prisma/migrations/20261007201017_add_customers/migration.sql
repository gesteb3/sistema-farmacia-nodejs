-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "nit" VARCHAR(20),
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(25),
    "email" VARCHAR(150),
    "address" VARCHAR(250),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_nit_key" ON "customers"("nit");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");
