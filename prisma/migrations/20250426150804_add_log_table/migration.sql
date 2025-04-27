-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "code_ref" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogMetadata" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "LogMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogMetadata_logId_idx" ON "LogMetadata"("logId");

-- AddForeignKey
ALTER TABLE "LogMetadata" ADD CONSTRAINT "LogMetadata_logId_fkey" FOREIGN KEY ("logId") REFERENCES "LogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
