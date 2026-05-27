ALTER TABLE "Response" ADD COLUMN IF NOT EXISTS "submissionId" TEXT;

UPDATE "Response"
SET "submissionId" = "id"
WHERE "submissionId" IS NULL;

ALTER TABLE "Response" ALTER COLUMN "submissionId" SET NOT NULL;

DROP INDEX IF EXISTS "Response_submissionId_key";
CREATE UNIQUE INDEX "Response_formId_submissionId_key" ON "Response"("formId", "submissionId");
