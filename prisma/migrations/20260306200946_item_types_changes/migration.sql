/*
  Warnings:

  - You are about to drop the column `isRead` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `isFavorite` on the `Password` table. All the data in the column will be lost.
  - Made the column `contentEnc` on table `Resource` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Link_userId_isRead_idx";

-- DropIndex
DROP INDEX "Password_userId_isFavorite_idx";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "isRead";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "titleEnc" TEXT;

-- AlterTable
ALTER TABLE "Password" DROP COLUMN "isFavorite";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "titleEnc" TEXT,
ALTER COLUMN "contentEnc" SET NOT NULL;
