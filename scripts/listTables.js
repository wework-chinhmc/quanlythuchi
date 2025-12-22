require('dotenv/config');
const { Client } = require('pg');

function schemaFromEnvOrUrl() {
  if (process.env.SCHEMA) return process.env.SCHEMA;
  const url = process.env.DATABASE_URL || '';
  const m = url.match(/[?&]schema=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : 'public';
}

async function main() {
  const schema = schemaFromEnvOrUrl();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema=$1 AND table_type='BASE TABLE' ORDER BY table_name;`,
      [schema]
    );
    if (!res.rows || res.rows.length === 0) {
      console.log(`No tables found in schema ${schema}`);
    } else {
      console.log(`Tables in schema ${schema}:`);
      for (const row of res.rows) {
        console.log('-', row.table_name);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Error querying tables:', e);
  process.exit(1);
});
