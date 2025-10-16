import database from "infra/database.js";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("DROP schema public cascade; create schema public;");

  await database.query("CREATE TABLE posts(id SERIAL PRIMARY KEY);");
}

test("DELETE to /api/v1/migrations should return 204", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "DELETE",
  });
  expect(response.status).toBe(405);
});
