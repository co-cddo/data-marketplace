import request from "supertest";
import app from "../src/app";

describe("fetchResources", () => {
  test("Cannot access /profile without a valid jwt", async () => {
    const response = await request(app).get("/profile");
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
});
