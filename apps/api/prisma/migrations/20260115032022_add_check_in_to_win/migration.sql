-- CreateTable
CREATE TABLE "check_in_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20),
    "car_year" INTEGER,
    "car_make" VARCHAR(100),
    "car_model" VARCHAR(100),
    "car_color" VARCHAR(50),
    "mileage" INTEGER,
    "issue_description" TEXT,
    "prize_won" VARCHAR(100),
    "prize_id" VARCHAR(50),
    "validation_code" VARCHAR(20) NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemed_at" TIMESTAMPTZ,
    "content_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "check_in_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "prizes" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prize_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "check_in_submissions_validation_code_key" ON "check_in_submissions"("validation_code");

-- CreateIndex
CREATE INDEX "check_in_submissions_tenant_id_created_at_idx" ON "check_in_submissions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "check_in_submissions_tenant_id_redeemed_idx" ON "check_in_submissions"("tenant_id", "redeemed");

-- CreateIndex
CREATE INDEX "check_in_submissions_validation_code_idx" ON "check_in_submissions"("validation_code");

-- CreateIndex
CREATE UNIQUE INDEX "prize_configurations_tenant_id_key" ON "prize_configurations"("tenant_id");

-- AddForeignKey
ALTER TABLE "check_in_submissions" ADD CONSTRAINT "check_in_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_configurations" ADD CONSTRAINT "prize_configurations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
