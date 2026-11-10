-- CreateTable
CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "dwellMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireDraft" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserEvent_userId_createdAt_idx" ON "UserEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserEvent_sessionId_createdAt_idx" ON "UserEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireDraft_sessionId_key" ON "QuestionnaireDraft"("sessionId");

-- CreateIndex
CREATE INDEX "QuestionnaireDraft_userId_idx" ON "QuestionnaireDraft"("userId");
