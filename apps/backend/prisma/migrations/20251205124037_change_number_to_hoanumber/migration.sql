/*
  Warnings:

  - You are about to drop the column `number` on the `Hoa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hoaNumber]` on the table `Hoa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hoaNumber` to the `Hoa` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Hoa_number_key";

-- AlterTable
ALTER TABLE "public"."Hoa" DROP COLUMN "number",
ADD COLUMN     "hoaNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Hoa_hoaNumber_key" ON "public"."Hoa"("hoaNumber");
