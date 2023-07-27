import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe("GET /find", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/page");
    expect(response.status).toBe(200);
  });
});
