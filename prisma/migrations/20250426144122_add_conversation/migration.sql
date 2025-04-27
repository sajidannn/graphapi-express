-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "botReply" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
