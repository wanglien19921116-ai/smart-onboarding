-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '必修基础',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "examType" TEXT NOT NULL DEFAULT '综合考',
ADD COLUMN     "relatedId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStage" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "jobRole" TEXT;
