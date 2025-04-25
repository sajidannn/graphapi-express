-- CreateTable
CREATE TABLE "dm" (
    "id" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dm_pkey" PRIMARY KEY ("id")
);
