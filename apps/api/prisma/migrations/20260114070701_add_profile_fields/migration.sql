-- AlterTable
ALTER TABLE "brand_kits" ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "shop_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "social_links" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "target_demographics" TEXT,
ADD COLUMN     "target_pain_points" TEXT,
ADD COLUMN     "unique_selling_points" TEXT[] DEFAULT ARRAY[]::TEXT[];
