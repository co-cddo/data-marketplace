import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";
import { Request, Response } from "express";

jest.mock("../src/services/findService");
jest.mock("../src/middleware/authMiddleware", () => ({
  ...jest.requireActual("../src/middleware/authMiddleware"),
  authenticateJWT: (req: Request, res: Response) => {
    res.redirect("/");
  },
}));

describe("GET /share/:resourceID/acquirer", () => {
  const resourceId = mockData.data[0].identifier;
  const expectedResource = mockData.data.find(
    (resource) => resource.identifier === resourceId,
  );

  (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);

  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/share/${resourceId}/acquirer`);
    expect(response.status).toBe(302);
  });
});
