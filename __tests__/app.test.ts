import request from "supertest";
import app from "../src/app";
import { Server } from "http";

let server: Server;

beforeAll(() => {
  server = app.listen(3002); // Start the server before running the tests
});
afterAll((done) => {
  server.close(done); // Close the server after the tests complete
});

describe("GET /", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe("GET /page", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/page");
    expect(response.status).toBe(200);
  });
});
