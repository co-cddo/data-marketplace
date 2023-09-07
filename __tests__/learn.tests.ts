import request from "supertest";
import app from "../src/app";

describe("GET /learn", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/learn");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Data Marketplace");
  });

  it('should respond as expected when accessing data-sharing-arrangements"', async () => {
    const response = await request(app).get("/learn/data-sharing-arrangements");
    expect(response.status).toBe(200);
    expect(response.text).toContain("data share request");
  });

  it('should respond as expected when accessing data-sharing-questions"', async () => {
    const response = await request(app).get("/learn/data-sharing-questions");
    expect(response.status).toBe(200);
    expect(response.text).toContain("questions for a data share request");
  });

  it('should respond as expected when accessing guidance-on-publish"', async () => {
    const response = await request(app).get("/learn/guidance-on-publish");
    expect(response.status).toBe(200);
    expect(response.text).toContain("publishing data descriptions");
  });
});