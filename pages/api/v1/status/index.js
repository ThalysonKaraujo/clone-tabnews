import database from "infra/database.js";

async function status(req, res) {
  const updatedAt = new Date().toISOString();
  const versionResult = await database.version();
  const maxConnections = await database.maxConnections();
  // const openedConnections = await database.openedConnections();
  const databaseName = process.env.POSTGRES_DB;

  const connectionsQuery = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });
  const openedConnections = connectionsQuery.rows[0].count;

  console.log("openedConnections: ", openedConnections);
  console.log("maxConnections: ", maxConnections);
  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: versionResult,
        max_connections: maxConnections,
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
