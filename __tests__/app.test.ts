import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe("GET /acquirer", () => {
  it('/ should respond as expected"', async () => {
    const response = await request(app).get("/share/acquirer");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Start now");
  });
  it('/start should respond as expected"', async () => {
    const response = await request(app).get("/share/start");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Start share journey");
  });
});

