import { db } from './db.js';

async function seed() {
  console.log('[SEED] Initializing database and running seeds...');
  await db.init();
  console.log('[SEED] Database seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
