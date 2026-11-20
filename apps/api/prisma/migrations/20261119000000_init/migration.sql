-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('STROKE_PLAY', 'STABLEFORD', 'MATCH_PLAY');

-- CreateEnum
CREATE TYPE "FairwayHit" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('TOURNAMENT', 'ORDER', 'SOCIAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PrivacyMode" AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TournamentScoreStatus" AS ENUM ('ENTERED', 'VALIDATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT,
    "memberId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "fcmToken" TEXT,
    "handicapIndex" DECIMAL(4,1) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "lastSeenLat" DOUBLE PRECISION,
    "lastSeenLng" DOUBLE PRECISION,
    "facePhotoPath" TEXT,
    "facePhotoUpdatedAt" TIMESTAMP(3),
    "verificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "imageUrl" TEXT,
    "totalHoles" INTEGER NOT NULL DEFAULT 18,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hole" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "lengthYds" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeBox" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yardage" INTEGER NOT NULL,
    "rating" DECIMAL(4,1) NOT NULL,
    "slope" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeeBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teeBoxId" TEXT NOT NULL,
    "gameMode" "GameMode" NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "currentHole" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundPlayer" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoleScore" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strokes" INTEGER NOT NULL,
    "putts" INTEGER NOT NULL,
    "fairwayHit" "FairwayHit",
    "gir" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoleScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "privacyMode" "PrivacyMode" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT,
    "locationId" TEXT,
    "caddieCode" TEXT,
    "holeNumber" INTEGER,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "totalPaid" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "course" TEXT NOT NULL,
    "teeBox" TEXT NOT NULL,
    "teeTime" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "scoringMethod" TEXT NOT NULL,
    "code" TEXT,
    "pars" JSONB,
    "marshalPin" TEXT,
    "publishedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPlayer" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "dob" TEXT,
    "shirtSize" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "handicap" INTEGER NOT NULL,
    "flight" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentGroup" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "number" INTEGER,
    "startHole" INTEGER,
    "flightType" TEXT NOT NULL,
    "caddieData" JSONB,
    "scoresData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "roleInfo" TEXT NOT NULL,
    "changedHole" INTEGER NOT NULL,
    "changedPlayerName" TEXT NOT NULL,
    "newScore" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isMarshalEdit" BOOLEAN NOT NULL DEFAULT false,
    "groupCode" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaddiePerformance" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "caddieCode" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaddiePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentScore" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "hole" INTEGER NOT NULL,
    "strokes" INTEGER,
    "isOut" BOOLEAN NOT NULL DEFAULT false,
    "status" "TournamentScoreStatus" NOT NULL DEFAULT 'ENTERED',
    "editedByMarshal" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "enteredBy" TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentScoreLog" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "hole" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldStrokes" INTEGER,
    "newStrokes" INTEGER,
    "oldIsOut" BOOLEAN,
    "newIsOut" BOOLEAN,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT,
    "groupCode" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentScoreLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMessage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "toTarget" TEXT NOT NULL,
    "fromRole" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "groupCode" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Hole_courseId_number_key" ON "Hole"("courseId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "RoundPlayer_roundId_userId_key" ON "RoundPlayer"("roundId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HoleScore_roundId_holeId_userId_key" ON "HoleScore"("roundId", "holeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_name_key" ON "MenuCategory"("name");

-- CreateIndex
CREATE INDEX "Tournament_code_idx" ON "Tournament"("code");

-- CreateIndex
CREATE INDEX "TournamentPlayer_code_idx" ON "TournamentPlayer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPlayer_tournamentId_code_key" ON "TournamentPlayer"("tournamentId", "code");

-- CreateIndex
CREATE INDEX "TournamentGroup_code_idx" ON "TournamentGroup"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGroup_tournamentId_code_key" ON "TournamentGroup"("tournamentId", "code");

-- CreateIndex
CREATE INDEX "TournamentScore_tournamentId_idx" ON "TournamentScore"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentScore_playerId_hole_key" ON "TournamentScore"("playerId", "hole");

-- CreateIndex
CREATE INDEX "TournamentScoreLog_tournamentId_createdAt_idx" ON "TournamentScoreLog"("tournamentId", "createdAt");

-- CreateIndex
CREATE INDEX "TournamentMessage_tournamentId_createdAt_idx" ON "TournamentMessage"("tournamentId", "createdAt");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hole" ADD CONSTRAINT "Hole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeBox" ADD CONSTRAINT "TeeBox_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_teeBoxId_fkey" FOREIGN KEY ("teeBoxId") REFERENCES "TeeBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundPlayer" ADD CONSTRAINT "RoundPlayer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundPlayer" ADD CONSTRAINT "RoundPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusLog" ADD CONSTRAINT "OrderStatusLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TournamentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGroup" ADD CONSTRAINT "TournamentGroup_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScore" ADD CONSTRAINT "TournamentScore_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScore" ADD CONSTRAINT "TournamentScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "TournamentPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScoreLog" ADD CONSTRAINT "TournamentScoreLog_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMessage" ADD CONSTRAINT "TournamentMessage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Supabase: block PostgREST (anon/authenticated) access; the API connects as postgres and bypasses RLS.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordReset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeeBox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Round" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoundPlayer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HoleScore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tournament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentPlayer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaddiePerformance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentScore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentScoreLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentMessage" ENABLE ROW LEVEL SECURITY;
