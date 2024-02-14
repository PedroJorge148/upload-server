/*
  Warnings:

  - You are about to drop the column `size` on the `uploads` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `uploads` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `uploads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeInBytes` to the `uploads` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_uploads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sizeInBytes" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_uploads" ("createdAt", "id", "key", "name") SELECT "createdAt", "id", "key", "name" FROM "uploads";
DROP TABLE "uploads";
ALTER TABLE "new_uploads" RENAME TO "uploads";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
