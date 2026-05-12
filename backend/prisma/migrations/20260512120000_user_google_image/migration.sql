-- AlterTable
ALTER TABLE "users" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "googleId" TEXT;

-- AlterTable: allow OAuth-only users
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
