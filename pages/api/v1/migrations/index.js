import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { error } from "node:console";

export default async function migrations(req, res) {
  const dbClient = await database.getNewClient();
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: false,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: "true",
    migrationsTable: "pgmigrations",
  };

  try {
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

    if (req.method === "DELETE") {
      return res.status(204).json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await dbClient.end();
  }

  res.status(405).end();
}
