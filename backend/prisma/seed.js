/* prisma/seed.js */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// FIXED passwords (expected by smoke tests)
const ADMIN_PASSWORD = "Admin123!";
const USER_PASSWORD = "User123!";

const ADMINS = [
  { email: "admin@example.com", name: "Admin", phone: "", role: "ADMIN", password: ADMIN_PASSWORD },
  { email: "admin@test.com", name: "Admin Test", phone: "", role: "ADMIN", password: ADMIN_PASSWORD },
];

// Non-admin role in DB enum is DISPATCHER (USER is not valid in your schema)
const USERS = [
  { email: "user@test.com", name: "Test User", phone: "", role: "DISPATCHER", password: USER_PASSWORD },
];

function makeId(prefix = "usr") {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

async function ensureUser({ email, name, phone, role, password }) {
  const passwordHash = bcrypt.hashSync(password, 10);

  const updated = await prisma.$executeRaw`
    UPDATE public."User"
    SET "passwordHash" = ${passwordHash},
        "name" = ${name},
        "phone" = ${phone},
        "role" = (${role}::"Role"),
        "isActive" = true,
        "updatedAt" = now()
    WHERE "email" = ${email};
  `;

  const updatedNum = typeof updated === "bigint" ? Number(updated) : updated;

  if (updatedNum && updatedNum > 0) {
    console.log(`OK updated ${role} ${email}`);
    return;
  }

  const id = makeId(role === "ADMIN" ? "admin" : "user");

  await prisma.$executeRaw`
    INSERT INTO public."User" ("id","email","passwordHash","name","phone","role","isActive","createdAt","updatedAt")
    VALUES (${id}, ${email}, ${passwordHash}, ${name}, ${phone}, (${role}::"Role"), true, now(), now());
  `;

  console.log(`OK inserted ${role} ${email} (id=${id})`);
}

async function main() {
  console.log("Seeding users with fixed passwords:");
  console.log("- admin@example.com / Admin123!");
  console.log("- admin@test.com / Admin123!");
  console.log("- user@test.com / User123! (role=DISPATCHER)");

  for (const a of ADMINS) await ensureUser(a);
  for (const u of USERS) await ensureUser(u);

  console.log("OK seed complete");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
