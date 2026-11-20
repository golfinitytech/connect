-- CreateEnum
CREATE TYPE "AcademyRole" AS ENUM ('STUDENT', 'COACH', 'ADMIN');

-- CreateEnum
CREATE TYPE "AcademyAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AcademyProgressStatus" AS ENUM ('LOCKED', 'PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AcademySessionStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AcademyEvaluationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AcademyContentType" AS ENUM ('BOOKLET', 'VIDEO', 'ARTICLE', 'COACH_TIP');

-- CreateTable
CREATE TABLE "AcademyAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AcademyRole" NOT NULL,
    "status" "AcademyAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "specialty" TEXT,
    "rating" DECIMAL(2,1),
    "coachId" TEXT,
    "programId" TEXT,
    "packageName" TEXT,
    "remainingSessions" INTEGER,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyVenue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "rating" DECIMAL(2,1),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyProgram" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "rating" DECIMAL(2,1),
    "color" TEXT NOT NULL DEFAULT 'emerald',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyModule" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "drills" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AcademyModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademySublevel" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "evaluationName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AcademySublevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademySyllabusLesson" (
    "id" TEXT NOT NULL,
    "sublevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AcademySyllabusLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "AcademyProgressStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademySession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "venueId" TEXT,
    "location" TEXT,
    "programId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "topic" TEXT,
    "status" "AcademySessionStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyEvaluation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "sessionId" TEXT,
    "topic" TEXT NOT NULL,
    "levelLabel" TEXT,
    "status" "AcademyEvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "score" DECIMAL(5,2),
    "notes" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyLearningContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AcademyContentType" NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tag" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyLearningContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyAccount_email_key" ON "AcademyAccount"("email");

-- CreateIndex
CREATE INDEX "AcademyAccount_role_idx" ON "AcademyAccount"("role");

-- CreateIndex
CREATE INDEX "AcademyAccount_coachId_idx" ON "AcademyAccount"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyVenue_name_key" ON "AcademyVenue"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyProgram_code_key" ON "AcademyProgram"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyProgress_studentId_lessonId_key" ON "AcademyProgress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "AcademySession_coachId_startsAt_idx" ON "AcademySession"("coachId", "startsAt");

-- CreateIndex
CREATE INDEX "AcademySession_studentId_startsAt_idx" ON "AcademySession"("studentId", "startsAt");

-- CreateIndex
CREATE INDEX "AcademyEvaluation_coachId_status_idx" ON "AcademyEvaluation"("coachId", "status");

-- CreateIndex
CREATE INDEX "AcademyEvaluation_studentId_idx" ON "AcademyEvaluation"("studentId");

-- CreateIndex
CREATE INDEX "AcademyMessage_senderId_recipientId_createdAt_idx" ON "AcademyMessage"("senderId", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "AcademyMessage_recipientId_readAt_idx" ON "AcademyMessage"("recipientId", "readAt");

-- AddForeignKey
ALTER TABLE "AcademyAccount" ADD CONSTRAINT "AcademyAccount_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "AcademyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyAccount" ADD CONSTRAINT "AcademyAccount_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AcademyProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyModule" ADD CONSTRAINT "AcademyModule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AcademyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySublevel" ADD CONSTRAINT "AcademySublevel_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AcademyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySyllabusLesson" ADD CONSTRAINT "AcademySyllabusLesson_sublevelId_fkey" FOREIGN KEY ("sublevelId") REFERENCES "AcademySublevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyProgress" ADD CONSTRAINT "AcademyProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyProgress" ADD CONSTRAINT "AcademyProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "AcademySyllabusLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySession" ADD CONSTRAINT "AcademySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySession" ADD CONSTRAINT "AcademySession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySession" ADD CONSTRAINT "AcademySession_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "AcademyVenue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySession" ADD CONSTRAINT "AcademySession_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AcademyProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEvaluation" ADD CONSTRAINT "AcademyEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEvaluation" ADD CONSTRAINT "AcademyEvaluation_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEvaluation" ADD CONSTRAINT "AcademyEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyMessage" ADD CONSTRAINT "AcademyMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyMessage" ADD CONSTRAINT "AcademyMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Supabase: block PostgREST (anon/authenticated) access; the API connects as postgres and bypasses RLS.
ALTER TABLE "AcademyAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyVenue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyProgram" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyModule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademySublevel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademySyllabusLesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyEvaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyLearningContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademyMessage" ENABLE ROW LEVEL SECURITY;
