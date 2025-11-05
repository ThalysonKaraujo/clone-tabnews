import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(req, res) {
  try {
    const updatedAt = new Date().toISOString();
    const versionResult = await database.version();
    const maxConnections = await database.maxConnections();
    const databaseName = process.env.POSTGRES_DB;

    const connectionsQuery = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
      values: [databaseName],
    });
    const openedConnections = connectionsQuery.rows[0].count;

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
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.error(publicErrorObject);
    res.status(500).json(publicErrorObject);
  }
}

export default status;
