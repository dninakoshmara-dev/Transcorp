-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DISPATCHER', 'WAREHOUSE_BG', 'WAREHOUSE_NL', 'DRIVER');

-- CreateEnum
CREATE TYPE "WarehouseCode" AS ENUM ('BG', 'NL');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNED', 'LOADED', 'IN_TRANSIT', 'COMPLETED', 'PROBLEM');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('PICKUP', 'DROP');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('CMR', 'POD', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FUEL', 'TOLL', 'FERRY', 'PARKING', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "code" "WarehouseCode" NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "capacityPallet" INTEGER NOT NULL,
    "capacityKg" INTEGER,
    "homeWarehouseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vat" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "description" TEXT,
    "palletsTotal" INTEGER NOT NULL,
    "weightKg" INTEGER,
    "notes" TEXT,
    "statusCalc" TEXT,
    "customerId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedStartAt" TIMESTAMP(3),
    "plannedEndAt" TIMESTAMP(3),
    "revenueAmount" INTEGER,
    "revenueCurrency" TEXT,
    "truckId" TEXT NOT NULL,
    "driverId" TEXT,
    "startWarehouseId" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" "StopType" NOT NULL,
    "seq" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "windowFrom" TIMESTAMP(3),
    "windowTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripShipment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "palletsAllocated" INTEGER NOT NULL,
    "palletsLoaded" INTEGER NOT NULL DEFAULT 0,
    "palletsDelivered" INTEGER NOT NULL DEFAULT 0,
    "dropStopId" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripShipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseMove" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "type" TEXT NOT NULL,
    "palletsQty" INTEGER NOT NULL,
    "tripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "WarehouseMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filename" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,
    "tripId" TEXT,
    "shipmentId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "note" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_plate_key" ON "Truck"("plate");

-- CreateIndex
CREATE INDEX "Shipment_warehouseId_idx" ON "Shipment"("warehouseId");

-- CreateIndex
CREATE INDEX "Shipment_customerId_idx" ON "Shipment"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_customerId_refNo_key" ON "Shipment"("customerId", "refNo");

-- CreateIndex
CREATE INDEX "Stop_tripId_idx" ON "Stop"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Stop_tripId_seq_key" ON "Stop"("tripId", "seq");

-- CreateIndex
CREATE INDEX "TripShipment_shipmentId_idx" ON "TripShipment"("shipmentId");

-- CreateIndex
CREATE INDEX "TripShipment_tripId_idx" ON "TripShipment"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripShipment_tripId_shipmentId_key" ON "TripShipment"("tripId", "shipmentId");

-- CreateIndex
CREATE INDEX "Document_tripId_idx" ON "Document"("tripId");

-- CreateIndex
CREATE INDEX "Document_shipmentId_idx" ON "Document"("shipmentId");

-- CreateIndex
CREATE INDEX "Expense_tripId_idx" ON "Expense"("tripId");

-- AddForeignKey
ALTER TABLE "Truck" ADD CONSTRAINT "Truck_homeWarehouseId_fkey" FOREIGN KEY ("homeWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_startWarehouseId_fkey" FOREIGN KEY ("startWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripShipment" ADD CONSTRAINT "TripShipment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripShipment" ADD CONSTRAINT "TripShipment_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripShipment" ADD CONSTRAINT "TripShipment_dropStopId_fkey" FOREIGN KEY ("dropStopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseMove" ADD CONSTRAINT "WarehouseMove_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
