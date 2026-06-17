import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient();
const scrypt = promisify(_scrypt);

async function hash(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  await prisma.plan.upsert({
    where: { key: "free" },
    update: {},
    create: { key: "free", name: "Free", priceCents: 0, monthlyAnalyses: 5, monthlyAiCalls: 50 },
  });
  await prisma.plan.upsert({
    where: { key: "pro_monthly" },
    update: {},
    create: {
      key: "pro_monthly",
      name: "Pro (Monthly)",
      interval: "MONTH",
      priceCents: 1900,
      monthlyAnalyses: 200,
      monthlyAiCalls: 2000,
    },
  });
  await prisma.plan.upsert({
    where: { key: "pro_annual" },
    update: {},
    create: {
      key: "pro_annual",
      name: "Pro (Annual)",
      interval: "YEAR",
      priceCents: 19000,
      monthlyAnalyses: 200,
      monthlyAiCalls: 2000,
    },
  });

  const adminEmail = "admin@resumeforge.ai";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await hash("ChangeMe123!"),
      emailVerified: new Date(),
    },
  });

  console.log("Seed complete. Admin login: admin@resumeforge.ai / ChangeMe123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
