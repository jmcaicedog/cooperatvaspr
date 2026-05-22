import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const [, , emailArg, nameArg, passwordArg] = process.argv;

if (!emailArg || !nameArg) {
  console.error("Uso: npm run admin:create -- <email> <nombre> [password]");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const displayName = nameArg.trim();

if (!email || !displayName) {
  console.error("Email y nombre son obligatorios.");
  process.exit(1);
}

async function main() {
  const passwordHash = passwordArg ? await bcrypt.hash(passwordArg, 12) : null;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName,
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      email,
      displayName,
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
      passwordHash,
    },
  });

  console.info("Administrador listo:", {
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });