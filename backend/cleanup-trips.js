const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const where = { status: "COMPLETED", shipments: { none: {} } };

  const before = await prisma.trip.count({ where });
  console.log("Before:", before);

  const del = await prisma.trip.deleteMany({ where });
  console.log("Deleted:", del.count);

  const after = await prisma.trip.count({ where });
  console.log("After:", after);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
