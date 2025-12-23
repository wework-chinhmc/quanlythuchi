const fs = require('fs');
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function main() {
  const file = process.argv[2] || 'prisma_to_postgres.sql';
  if (!fs.existsSync(file)) {
    console.error('SQL file not found:', file);
    process.exit(1);
  }

  const sql = fs.readFileSync(file, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SQL executed successfully.');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.error('Execution failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
