-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "thresholdCount" INTEGER NOT NULL DEFAULT 2,
    "kmsKeyId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyShare" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "encryptedShare" TEXT NOT NULL,
    "keyIndex" INTEGER NOT NULL,

    CONSTRAINT "KeyShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalPolicy" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "minAmount" DECIMAL(65,30) NOT NULL,
    "maxAmount" DECIMAL(65,30),
    "requiredRole" TEXT NOT NULL,

    CONSTRAINT "ApprovalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressBook" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isWhitelisted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AddressBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "requestId" TEXT,
    "prevHash" TEXT NOT NULL,
    "currentHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRecord" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "onChainAmount" DECIMAL(65,30) NOT NULL,
    "offChainAmount" DECIMAL(65,30),
    "status" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlert" (
    "id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "AddressBook_orgId_address_key" ON "AddressBook"("orgId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_requestId_approverId_key" ON "Approval"("requestId", "approverId");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationRecord_txHash_key" ON "ReconciliationRecord"("txHash");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyShare" ADD CONSTRAINT "KeyShare_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyShare" ADD CONSTRAINT "KeyShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPolicy" ADD CONSTRAINT "ApprovalPolicy_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressBook" ADD CONSTRAINT "AddressBook_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRecord" ADD CONSTRAINT "ReconciliationRecord_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
