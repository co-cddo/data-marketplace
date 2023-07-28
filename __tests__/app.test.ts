import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe('GET /find', () => {
  it('should respond with 200 for a successful request', async () => {
    const response = await request(app).get('/find');
    expect(response.status).toBe(200);
  });

  it('should pass query parameter to the route', async () => {
    const response = await request(app).get('/find/?q=test');
    expect(response.status).toBe(200);
  });
});

describe("GET /share", () => {
  it('/ should respond as expected"', async () => {
    const response = await request(app).get("/share");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Share journey");
  });
  it('/start should respond as expected"', async () => {
    const response = await request(app).get("/share/start");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Start share journey");
  });
});
