-- CreateTable
CREATE TABLE "social_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "account_id" VARCHAR(255) NOT NULL,
    "account_name" VARCHAR(255),
    "account_username" VARCHAR(255),
    "account_avatar" VARCHAR(500),
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMPTZ,
    "page_id" VARCHAR(255),
    "page_name" VARCHAR(255),
    "page_access_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "connected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "social_account_id" UUID NOT NULL,
    "caption" TEXT,
    "scheduled_for" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "post_id" VARCHAR(255),
    "post_url" VARCHAR(500),
    "error_message" TEXT,
    "posted_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_accounts_tenant_id_platform_idx" ON "social_accounts"("tenant_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_tenant_id_platform_account_id_key" ON "social_accounts"("tenant_id", "platform", "account_id");

-- CreateIndex
CREATE INDEX "scheduled_posts_tenant_id_status_idx" ON "scheduled_posts"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "scheduled_posts_scheduled_for_idx" ON "scheduled_posts"("scheduled_for");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "social_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
