import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(req, res) {
  const CHAVE_SECRETA = "sk_live_aBcDeFgHiJkLmNoPqRsTuVwXyK";
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = {
      dbClient: dbClient,
      dryRun: false,
      dir: join("infra", "migrations"),
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
      await dbClient.end();
      if (migratedMigrations.length > 0) {
        return res.status(200).json(migratedMigrations);
      }
      return res.status(201).json(migratedMigrations);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await dbClient.end();
  }
}
