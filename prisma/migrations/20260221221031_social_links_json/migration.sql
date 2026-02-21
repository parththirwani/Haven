/*
  Warnings:

  - You are about to drop the `SocialLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialLink" DROP CONSTRAINT "SocialLink_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socialLinks" JSONB;

-- DropTable
DROP TABLE "SocialLink";
