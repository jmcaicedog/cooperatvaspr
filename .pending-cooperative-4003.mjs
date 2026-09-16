import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const rows = await prisma.cooperativeChangeRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { cooperative: true }
  });
  for (const r of rows) {
    console.log(JSON.stringify({
      id: r.id,
      severity: r.severity,
      createdAt: r.createdAt.toISOString(),
      payload: r.payload,
      cooperativeTypes: r.cooperative?.cooperativeTypes,
      municipalityCode: r.cooperative?.municipalityCode
    }, null, 2));
  }
  console.log(`PENDING_COUNT=${rows.length}`);
} finally { await prisma.$disconnect(); }
