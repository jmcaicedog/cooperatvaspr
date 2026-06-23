-- Add founded year to cooperatives
ALTER TABLE "Cooperative"
ADD COLUMN "foundedYear" INTEGER;

-- Social platform enum
CREATE TYPE "SocialPlatform" AS ENUM (
  'FACEBOOK',
  'INSTAGRAM',
  'X',
  'LINKEDIN',
  'YOUTUBE',
  'TIKTOK',
  'OTHER'
);

-- Social links table
CREATE TABLE "SocialLink" (
  "id" TEXT NOT NULL,
  "cooperativeId" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "url" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialLink_cooperativeId_sortOrder_idx" ON "SocialLink"("cooperativeId", "sortOrder");

ALTER TABLE "SocialLink"
ADD CONSTRAINT "SocialLink_cooperativeId_fkey"
FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
