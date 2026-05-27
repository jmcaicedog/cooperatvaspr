-- CreateEnum
CREATE TYPE "CooperativeType" AS ENUM ('TRABAJO_ASOCIADO', 'CONSUMIDORES_USUARIOS', 'VIVIENDA', 'ENERGIA');

-- AlterTable
ALTER TABLE "Cooperative"
ADD COLUMN "cooperativeTypes" "CooperativeType"[] NOT NULL DEFAULT ARRAY[]::"CooperativeType"[],
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Cooperative_cooperativeTypes_idx" ON "Cooperative" USING GIN ("cooperativeTypes");

-- CreateIndex
CREATE INDEX "Cooperative_tags_idx" ON "Cooperative" USING GIN ("tags");
