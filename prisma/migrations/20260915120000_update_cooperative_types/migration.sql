ALTER TYPE "CooperativeType" RENAME TO "CooperativeType_old";

CREATE TYPE "CooperativeType" AS ENUM (
  'AHORRO_CREDITO',
  'ORGANISMOS_CENTRALES',
  'TRABAJO_ASOCIADO',
  'CONSUMIDORES_USUARIOS',
  'MIXTAS',
  'VIVIENDA',
  'ENERGIA',
  'SEGUROS',
  'JUVENILES'
);

ALTER TABLE "Cooperative" ADD COLUMN "cooperativeTypes_new" "CooperativeType"[] NOT NULL DEFAULT ARRAY[]::"CooperativeType"[];

UPDATE "Cooperative" AS c
SET "cooperativeTypes_new" = ARRAY(
  SELECT CASE value::text
    WHEN 'MOVIMIENTO_COOPERATIVO' THEN 'ORGANISMOS_CENTRALES'
    ELSE value::text
  END::"CooperativeType"
  FROM unnest(c."cooperativeTypes") AS value
  WHERE value::text <> 'TIPOS_DIVERSOS'
);

DROP INDEX IF EXISTS "Cooperative_cooperativeTypes_idx";
ALTER TABLE "Cooperative" DROP COLUMN "cooperativeTypes";
ALTER TABLE "Cooperative" RENAME COLUMN "cooperativeTypes_new" TO "cooperativeTypes";
CREATE INDEX "Cooperative_cooperativeTypes_idx" ON "Cooperative" USING GIN ("cooperativeTypes");

DROP TYPE "CooperativeType_old";