-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "nit" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "contact_name" VARCHAR(120),
    "phone" VARCHAR(25),
    "email" VARCHAR(150),
    "address" VARCHAR(250),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_nit_key" ON "suppliers"("nit");

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");
