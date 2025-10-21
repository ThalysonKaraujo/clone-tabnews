import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

export default async function migrations(req, res) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = {
      dbClient: dbClient,
      dryRun: false,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: "true",
      migrationsTable: "pgmigrations",
    };
    const allowedMethods = ["GET", "POST"];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        error: `method "${req.method}" not allowed`,
      });
    }
    if (req.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
      return res.status(200).json(pendingMigrations);
    }

    if (req.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });
      if (migratedMigrations.length > 0) {
        return res.status(201).json(migratedMigrations);
      }
      return res.status(200).json(migratedMigrations);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await dbClient.end();
  }
}
