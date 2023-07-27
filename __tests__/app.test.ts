import request from "supertest";
import app from "../src/app";

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

describe("GET /share", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/share");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Share journey");
  });
  it('should respond as expected"', async () => {
    const response = await request(app).get("/share/start");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Start share journey");
  });
});
