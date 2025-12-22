const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const tablesRes = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = $1", ['quanlidulieu']);
    const tables = tablesRes.rows.map(r => r.tablename);
    const output = {};

    for (const t of tables) {
      try {
        const sample = await client.query(`SELECT * FROM "${t}" LIMIT 5`);
        output[t] = { rows: sample.rows, count: sample.rowCount };
      } catch (e) {
        output[t] = { error: String(e) };
      }
    }

    console.log(JSON.stringify({ schema: 'quanlidulieu', tables: output }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
