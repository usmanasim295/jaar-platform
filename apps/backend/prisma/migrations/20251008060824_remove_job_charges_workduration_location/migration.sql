/*
  Warnings:

  - You are about to drop the column `charges` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `workDuration` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "charges",
DROP COLUMN "location",
DROP COLUMN "workDuration";
