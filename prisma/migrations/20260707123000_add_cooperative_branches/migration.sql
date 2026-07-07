CREATE TABLE "CooperativeBranch" (
  "id" TEXT NOT NULL,
  "cooperativeId" TEXT NOT NULL,
  "municipalityCode" TEXT NOT NULL,
  "label" TEXT,
  "address" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CooperativeBranch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CooperativeBranch_cooperativeId_sortOrder_idx"
ON "CooperativeBranch"("cooperativeId", "sortOrder");

CREATE INDEX "CooperativeBranch_municipalityCode_idx"
ON "CooperativeBranch"("municipalityCode");

ALTER TABLE "CooperativeBranch"
ADD CONSTRAINT "CooperativeBranch_cooperativeId_fkey"
FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CooperativeBranch"
ADD CONSTRAINT "CooperativeBranch_municipalityCode_fkey"
FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code")
ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "CooperativeBranch" ("id", "cooperativeId", "municipalityCode", "label", "address", "sortOrder", "createdAt", "updatedAt")
SELECT
  'branch_' || substr(md5(cp."id"), 1, 24),
  cp."cooperativeId",
  c."municipalityCode",
  cp."label",
  cp."value",
  cp."sortOrder",
  cp."createdAt",
  cp."updatedAt"
FROM "ContactPoint" cp
INNER JOIN "Cooperative" c ON c."id" = cp."cooperativeId"
WHERE cp."type" = 'ADDRESS';

DELETE FROM "ContactPoint"
WHERE "type" = 'ADDRESS';
