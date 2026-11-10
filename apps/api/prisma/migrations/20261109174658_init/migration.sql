-- CreateEnum
CREATE TYPE "VerifyStrategy" AS ENUM ('xuexin', 'student_card_ocr', 'edu_email');

-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('todo', 'pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "DropPhase" AS ENUM ('open', 'cutoff', 'released', 'closed');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('proposed', 'accepted', 'reschedule_requested', 'declined', 'checked_in', 'feedback_done', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "unionid" TEXT,
    "sessionKey" TEXT,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "studentVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "gender" TEXT,
    "grade" INTEGER,
    "major" TEXT,
    "bio" TEXT,
    "schoolId" TEXT,
    "schoolName" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategy" "VerifyStrategy" NOT NULL,
    "status" "VerifyStatus" NOT NULL DEFAULT 'todo',
    "payload" JSONB,
    "todo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropCycle" (
    "id" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "cutoffAt" TIMESTAMP(3) NOT NULL,
    "releaseAt" TIMESTAMP(3) NOT NULL,
    "phase" "DropPhase" NOT NULL DEFAULT 'open',
    "log" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DropCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPair" (
    "id" TEXT NOT NULL,
    "dropCycleId" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "gradeGap" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'proposed',
    "suggestedAt" TIMESTAMP(3),
    "meetupAt" TIMESTAMP(3),
    "suggestionNote" TEXT,
    "userAResponse" TEXT,
    "userBResponse" TEXT,
    "userACheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "userBCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "matchPairId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "noShow" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_openid_key" ON "User"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_schoolId_grade_idx" ON "Profile"("schoolId", "grade");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_userId_idx" ON "AvailabilitySlot"("userId");

-- CreateIndex
CREATE INDEX "StudentVerification_userId_strategy_idx" ON "StudentVerification"("userId", "strategy");

-- CreateIndex
CREATE UNIQUE INDEX "DropCycle_weekKey_key" ON "DropCycle"("weekKey");

-- CreateIndex
CREATE INDEX "MatchPair_userAId_idx" ON "MatchPair"("userAId");

-- CreateIndex
CREATE INDEX "MatchPair_userBId_idx" ON "MatchPair"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPair_dropCycleId_userAId_userBId_key" ON "MatchPair"("dropCycleId", "userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_matchPairId_userId_key" ON "Feedback"("matchPairId", "userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPair" ADD CONSTRAINT "MatchPair_dropCycleId_fkey" FOREIGN KEY ("dropCycleId") REFERENCES "DropCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPair" ADD CONSTRAINT "MatchPair_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPair" ADD CONSTRAINT "MatchPair_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_matchPairId_fkey" FOREIGN KEY ("matchPairId") REFERENCES "MatchPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
