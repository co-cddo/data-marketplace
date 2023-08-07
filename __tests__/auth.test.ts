import request from "supertest";
import app from "../src/app";
// import { authenticateJWT } from "../src/middleware/authMiddleware";
// jest.mock("../src/middleware/authMiddleware");

describe("fetchResources", () => {
  test("Cannot access /profile without a valid jwt", async () => {
    const response = await request(app).get("/profile");
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/");
  });

  // test("Cannot access /profile without a valid jwt", async () => {
  //   const mockUser = { id: 1, name: "Mocked User" };
  //   (authenticateJWT as jest.Mock).mockReturnValue(mockUser);
  //   const response = await request(app).get("/profile");
  //   expect(response.statusCode).toBe(302);
  //   expect(response.headers.location).toBe("/");
  // });
});
