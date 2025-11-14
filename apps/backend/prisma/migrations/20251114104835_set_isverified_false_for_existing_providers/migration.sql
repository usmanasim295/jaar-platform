-- Update existing service providers to set isVerified = false
UPDATE "public"."ServiceProvider" SET "isVerified" = false WHERE "isVerified" = true;

-- AlterTable
ALTER TABLE "public"."ServiceProvider" ALTER COLUMN "isVerified" SET DEFAULT false;
