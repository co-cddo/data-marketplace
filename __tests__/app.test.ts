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
