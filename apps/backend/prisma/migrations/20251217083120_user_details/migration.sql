-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "buildingNumber" TEXT,
ADD COLUMN     "city" JSONB,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "district" JSONB,
ADD COLUMN     "fatherName" JSONB,
ADD COLUMN     "firstName" JSONB,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastName" JSONB,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "region" JSONB,
ADD COLUMN     "street" JSONB;
