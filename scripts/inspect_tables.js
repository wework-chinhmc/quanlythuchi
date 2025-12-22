const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const info = {};

    // List non-system schemas
    const schemas = await client.query("SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';");
    info.schemas = schemas.rows.map(r => r.nspname);

    // List tables from information_schema for target schema
    const targetSchema = (new URL(process.env.DATABASE_URL)).searchParams.get('schema') || 'public';
    info.targetSchema = targetSchema;

    const ist = await client.query("SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema = $1", [targetSchema]);
    info.information_schema_tables = ist.rows;

    // Use pg_class to see exact relname (case preserved)
    const pc = await client.query("SELECT n.nspname AS schema, c.relname AS relname, c.relkind FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = $1 AND c.relkind = 'r'", [targetSchema]);
    info.pg_class = pc.rows;

    // Try selecting 1 row from each table using quoted schema and relname from pg_class first
    info.samples = {};
    const namesToTry = pc.rows.length ? pc.rows.map(r => r.relname) : ist.rows.map(r => r.table_name);

    for (const t of namesToTry) {
      try {
        const q = `SELECT * FROM "${targetSchema}"."${t}" LIMIT 1`;
        const res = await client.query(q);
        info.samples[t] = { ok: true, count: res.rowCount, row: res.rows[0] };
      } catch (e) {
        info.samples[t] = { ok: false, error: e.message };
      }
    }

    console.log(JSON.stringify(info, null, 2));
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
