import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';

const prisma = new PrismaClient();
const migrationPath = 'prisma/migrations/20260916120000_backfill_change_request_payload_types/migration.sql';
const sql = await readFile(migrationPath, 'utf8');
let updated;
let rows;
let rollbackCaught = false;
try {
  await prisma.$transaction(async (tx) => {
    updated = await tx.$executeRawUnsafe(sql);
    rows = await tx.$queryRawUnsafe(`SELECT id, payload->'cooperativeTypes' AS "cooperativeTypes" FROM "CooperativeChangeRequest" WHERE status = 'PENDING' ORDER BY id`);
    console.log('SQL executed without syntax errors: yes');
    console.log(`Rows updated: ${updated}`);
    console.log('cooperativeTypes results:', JSON.stringify(rows, (_, value) => typeof value === 'bigint' ? value.toString() : value));
    throw new Error('intentional rollback for validation');
  });
} catch (error) {
  rollbackCaught = error?.message === 'intentional rollback for validation';
  console.log('Rollback error captured:', rollbackCaught ? 'yes' : `no (${error?.message ?? error})`);
}
console.log('Transaction rolled back: ' + (rollbackCaught ? 'yes' : 'no'));
await prisma.$disconnect();
