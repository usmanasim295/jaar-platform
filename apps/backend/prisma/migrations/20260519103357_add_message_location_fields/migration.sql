-- AlterEnum
ALTER TYPE "public"."MessageType" ADD VALUE 'LOCATION';

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
