-- CreateTable
CREATE TABLE "AcademyFeedback" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyFeedback_createdAt_idx" ON "AcademyFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "AcademyFeedback" ADD CONSTRAINT "AcademyFeedback_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AcademyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Supabase: block PostgREST access.
ALTER TABLE "AcademyFeedback" ENABLE ROW LEVEL SECURITY;
