-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Star" (
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Star_pkey" PRIMARY KEY ("userId","fileId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "File_visibility_starCount_idx" ON "File"("visibility", "starCount");

-- CreateIndex
CREATE INDEX "File_visibility_createdAt_idx" ON "File"("visibility", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "File_userId_path_key" ON "File"("userId", "path");

-- CreateIndex
CREATE INDEX "Star_fileId_idx" ON "Star"("fileId");

-- CreateIndex
CREATE INDEX "Comment_fileId_createdAt_idx" ON "Comment"("fileId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Star" ADD CONSTRAINT "Star_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Star" ADD CONSTRAINT "Star_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
