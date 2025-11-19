import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "mesmo.case@curso.dev",
          password: "senha123",
        }),
      });
      expect(response.status).toBe(201);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response1.status).toBe(200);

      const response2Body = await response1.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCase",
        email: "mesmo.case@curso.dev",
        password: "senha123",
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test("With mismatch", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseDiferente",
          email: "case.diferente@curso.dev",
          password: "senha123",
        }),
      });
      expect(response.status).toBe(201);

      const response1 = await fetch(
        "http://localhost:3000/api/v1/users/caseDiferente",
      );

      expect(response1.status).toBe(200);

      const response1Body = await response1.json();

      expect(response1Body).toEqual({
        id: response1Body.id,
        username: "CaseDiferente",
        email: "case.diferente@curso.dev",
        password: "senha123",
        created_at: response1Body.created_at,
        updated_at: response1Body.updated_at,
      });

      expect(uuidVersion(response1Body.id)).toBe(4);
      expect(Date.parse(response1Body.created_at)).not.toBeNaN();
      expect(Date.parse(response1Body.updated_at)).not.toBeNaN();
    });
    test("With none existing username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarionaoexistente",
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username foi digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
