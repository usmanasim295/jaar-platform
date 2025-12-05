/*
  Warnings:

  - You are about to drop the column `userId` on the `Hoa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Hoa" DROP CONSTRAINT "Hoa_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Hoa" DROP COLUMN "userId";
