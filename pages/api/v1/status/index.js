import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
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
}
