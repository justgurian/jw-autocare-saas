-- AlterTable
ALTER TABLE "batch_jobs" ADD COLUMN     "mode" VARCHAR(20),
ADD COLUMN     "selected_themes" TEXT,
ADD COLUMN     "theme_strategy" VARCHAR(20);

-- AlterTable
ALTER TABLE "content" ADD COLUMN     "approval_status" VARCHAR(20),
ADD COLUMN     "posted_at" TIMESTAMPTZ,
ADD COLUMN     "scheduled_for" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "favorite_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "theme_id" VARCHAR(100) NOT NULL,
    "service_id" UUID,
    "special_id" UUID,
    "custom_text" TEXT,
    "content_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "favorite_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_templates_tenant_id_idx" ON "favorite_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "content_tenant_id_approval_status_idx" ON "content"("tenant_id", "approval_status");

-- AddForeignKey
ALTER TABLE "favorite_templates" ADD CONSTRAINT "favorite_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_templates" ADD CONSTRAINT "favorite_templates_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
