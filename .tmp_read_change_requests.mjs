import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const grouped = await prisma.$queryRawUnsafe(`
    SELECT status, COUNT(*)::int AS count
    FROM "CooperativeChangeRequest"
    GROUP BY status
    ORDER BY status
  `);
  const pending = await prisma.$queryRawUnsafe(`
    SELECT id, "cooperativeId", payload->'cooperativeTypes' AS "cooperativeTypes"
    FROM "CooperativeChangeRequest"
    WHERE status = 'PENDING'
    ORDER BY id
  `);

  const serialize = (value) => JSON.stringify(value, (_, item) =>
    typeof item === 'bigint' ? item.toString() : item
  );
  console.log('Conteo por status:', serialize(grouped));
  console.log('Filas PENDING:', serialize(pending));
} finally {
  await prisma.$disconnect();
}
