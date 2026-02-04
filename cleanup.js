const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const where = { trip: { status: "COMPLETED" }, palletsLoaded: 0, palletsDelivered: 0 };

  const before = await prisma.tripShipment.count({ where });
  console.log("Before:", before);

  const del = await prisma.tripShipment.deleteMany({ where });
  console.log("Deleted:", del.count);

  const after = await prisma.tripShipment.count({ where });
  console.log("After:", after);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
