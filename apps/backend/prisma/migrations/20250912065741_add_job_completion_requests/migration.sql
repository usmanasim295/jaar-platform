-- CreateEnum
CREATE TYPE "public"."JobCompletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."JobCompletionRequest" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "completionNotes" JSONB NOT NULL,
    "completionImages" TEXT[],
    "additionalDocumentUrl" TEXT,
    "status" "public"."JobCompletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" JSONB,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCompletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobCompletionRequest_jobId_serviceProviderId_key" ON "public"."JobCompletionRequest"("jobId", "serviceProviderId");

-- AddForeignKey
ALTER TABLE "public"."JobCompletionRequest" ADD CONSTRAINT "JobCompletionRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobCompletionRequest" ADD CONSTRAINT "JobCompletionRequest_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobCompletionRequest" ADD CONSTRAINT "JobCompletionRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
