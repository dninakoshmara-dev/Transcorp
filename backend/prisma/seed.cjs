/* eslint-disable no-console */
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

function getEnumValues(enumName, fallbackArray) {
  const fromPrisma = Prisma?.[enumName];
  const fromDollarEnums = Prisma?.$Enums?.[enumName];

  const obj = fromPrisma ?? fromDollarEnums;
  const values = obj ? Object.values(obj) : [];

  if (!values || values.length === 0) return fallbackArray;
  return values;
}

async function main() {
  console.log("Seed start");

  // CLEAN
  await prisma.tripShipment.deleteMany().catch(() => {});
  await prisma.stop.deleteMany().catch(() => {});
  await prisma.trip.deleteMany().catch(() => {});
  await prisma.document.deleteMany().catch(() => {});
  await prisma.expense.deleteMany().catch(() => {});
  await prisma.warehouseMove.deleteMany().catch(() => {});
  await prisma.shipment.deleteMany().catch(() => {});
  await prisma.customer.deleteMany().catch(() => {});
  await prisma.driver.deleteMany().catch(() => {});
  await prisma.truck.deleteMany().catch(() => {});
  await prisma.warehouse.deleteMany().catch(() => {});

  // WAREHOUSES
  const [BG, NL] = getEnumValues("WarehouseCode", ["BG", "NL"]);

  const whBG = await prisma.warehouse.create({
    data: {
      name: "Склад ългария",
      code: BG,
      country: "Bulgaria",
    },
  });

  const whNL = await prisma.warehouse.create({
    data: {
      name: "Склад Холандия",
      code: NL,
      country: "Netherlands",
    },
  });

  // TRUCKS
  const truck1 = await prisma.truck.create({
    data: {
      plate: "BG-TRUCK-01",
      capacityPallet: 33,
      homeWarehouse: { connect: { id: whBG.id } },
      isActive: true,
    },
  });

  await prisma.truck.create({
    data: {
      plate: "BG-TRUCK-02",
      capacityPallet: 33,
      homeWarehouse: { connect: { id: whBG.id } },
      isActive: true,
    },
  });

  await prisma.truck.create({
    data: {
      plate: "NL-TRUCK-03",
      capacityPallet: 33,
      homeWarehouse: { connect: { id: whNL.id } },
      isActive: true,
    },
  });

  await prisma.truck.create({
    data: {
      plate: "NL-TRUCK-04",
      capacityPallet: 33,
      homeWarehouse: { connect: { id: whNL.id } },
      isActive: true,
    },
  });

  // DRIVER + CUSTOMER + SHIPMENT
  const driver = await prisma.driver.create({
    data: { name: "ан ванов", phone: "0888123456", isActive: true },
  });

  const customer = await prisma.customer.create({
    data: {
      name: "ACME LTD",
      vat: "BG123456789",
      address: "София",
      email: "acme@example.com",
      phone: "029999999",
    },
  });

  const shipment = await prisma.shipment.create({
    data: {
      refNo: "SHP-0001",
      palletsTotal: 10,
      description: "Demo shipment",
      customer: { connect: { id: customer.id } },
      warehouse: { connect: { id: whBG.id } },
    },
  });

  // TRIP + TripShipment
  const trip = await prisma.trip.create({
    data: {
      status: "PLANNED",
      truck: { connect: { id: truck1.id } },
      startWarehouse: { connect: { id: whBG.id } },
      driver: { connect: { id: driver.id } },
      plannedStartAt: new Date(Date.now() + 60 * 60 * 1000),
      plannedEndAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
    },
  });

  await prisma.tripShipment.create({
    data: {
      trip: { connect: { id: trip.id } },
      shipment: { connect: { id: shipment.id } },
      palletsAllocated: 5,
    },
  });

  console.log("Seed OK ");
}

main()
  .catch((e) => {
    console.error("Seed FAILED ");
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
