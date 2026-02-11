/*
  Warnings:

  - Added the required column `updatedAt` to the `TransferRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SecurityAlert" ADD COLUMN     "rawData" TEXT;

-- AlterTable
ALTER TABLE "TransferRequest" ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "privateKey" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'MPC';

-- CreateTable
CREATE TABLE "WalletPolicy" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "dailyLimit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "WalletPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressWhitelist" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddressWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletPolicy_walletId_key" ON "WalletPolicy"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "AddressWhitelist_address_key" ON "AddressWhitelist"("address");

-- AddForeignKey
ALTER TABLE "WalletPolicy" ADD CONSTRAINT "WalletPolicy_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
