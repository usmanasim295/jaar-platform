-- AlterEnum
ALTER TYPE "public"."JobType" ADD VALUE 'RFQ';

-- CreateTable
CREATE TABLE "public"."ServiceQuestion" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceQuestionAnswer" (
    "id" TEXT NOT NULL,
    "serviceQuestionId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ServiceQuestion" ADD CONSTRAINT "ServiceQuestion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceQuestionAnswer" ADD CONSTRAINT "ServiceQuestionAnswer_serviceQuestionId_fkey" FOREIGN KEY ("serviceQuestionId") REFERENCES "public"."ServiceQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceQuestionAnswer" ADD CONSTRAINT "ServiceQuestionAnswer_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
