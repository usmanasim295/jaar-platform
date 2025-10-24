/*
  Warnings:

  - Made the column `password` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.

*/

-- First, set default password for existing users (hashed version of "12345678")
-- This is the bcrypt hash for "12345678" with salt rounds 10
UPDATE "public"."ServiceProvider" 
SET "password" = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE "password" IS NULL;

-- Then make the column required
ALTER TABLE "public"."ServiceProvider" ALTER COLUMN "password" SET NOT NULL;
