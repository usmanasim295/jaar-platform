-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "location" JSONB,
ADD COLUMN     "workDuration" JSONB,
ALTER COLUMN "timeSlot" DROP NOT NULL;
