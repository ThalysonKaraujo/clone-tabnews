import database from "infra/database";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import { ServiceError } from "infra/errors";

const defaultMigrationsOptions = {
  dbClient: true,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: "true",
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Failed to Run Migrations",
    });
  } finally {
    dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
