-- CreateEnum
CREATE TYPE "public"."NafathVerificationStatus" AS ENUM ('WAITING', 'EXPIRED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."NafathVerification" (
    "id" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "status" "public"."NafathVerificationStatus" NOT NULL DEFAULT 'WAITING',
    "details" JSONB,
    "transId" TEXT,
    "random" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NafathVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TempNafathWebhook" (
    "id" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempNafathWebhook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."NafathVerification" ADD CONSTRAINT "NafathVerification_nationalId_fkey" FOREIGN KEY ("nationalId") REFERENCES "public"."User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;
