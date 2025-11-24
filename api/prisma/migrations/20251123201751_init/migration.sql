-- CreateTable
CREATE TABLE "SessionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionTypeId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SessionType_category_idx" ON "SessionType"("category");

-- CreateIndex
CREATE INDEX "AvailabilityWindow_dayOfWeek_idx" ON "AvailabilityWindow"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityWindow_dayOfWeek_startTime_endTime_key" ON "AvailabilityWindow"("dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Session_startTime_idx" ON "Session"("startTime");

-- CreateIndex
CREATE INDEX "Session_sessionTypeId_idx" ON "Session"("sessionTypeId");

-- CreateIndex
CREATE INDEX "Session_completed_idx" ON "Session"("completed");
