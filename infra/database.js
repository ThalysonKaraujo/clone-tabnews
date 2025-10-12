import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  await client.connect();
  try {
    const result = await client.query(queryObject);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await client.end();
  }
  return;
}

async function version() {
  const versionQuery = await query({
    text: "SELECT current_setting('server_version') as version;",
  });
  const result = versionQuery.rows[0].version;
  return result;
}

async function maxConnections() {
  const connectionsQuery = await query({
    text: "SELECT current_setting('max_connections')::float as max_connections;",
  });
  const result = connectionsQuery.rows[0].max_connections;
  return result;
}

async function openedConnections() {
  const dbName = "local_db";
  const connectionsQuery = await query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = '${dbName}';`,
  });
  const result = connectionsQuery.rows[0].count;
  return result;
}

export default {
  query: query,
  version: version,
  maxConnections: maxConnections,
  openedConnections: openedConnections,
};
