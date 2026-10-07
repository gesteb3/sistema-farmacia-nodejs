-- CreateTable
CREATE TABLE "medications" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "active_ingredient" VARCHAR(120) NOT NULL,
    "presentation" VARCHAR(80) NOT NULL,
    "concentration" VARCHAR(60),
    "purchase_price" DECIMAL(12,2) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "requires_prescription" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medications_code_key" ON "medications"("code");

-- CreateIndex
CREATE INDEX "medications_name_idx" ON "medications"("name");
