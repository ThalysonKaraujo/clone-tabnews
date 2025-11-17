import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(
        responseBody.dependencies.database.opened_connections,
      ).not.toBeNull();
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeLessThanOrEqual(responseBody.dependencies.database.max_connections);

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).not.toBeNull();
      expect(responseBody.dependencies.database.max_connections).toEqual(
        expect.any(Number),
      );

      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(responseBody.dependencies.database.version).not.toBeNull();
      expect(responseBody.dependencies.database.version).toEqual(
        process.env.NODE_ENV === "test" ? "16.0" : "16.9 (165f042)",
      );
    });
  });
});
