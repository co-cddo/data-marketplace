import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";
import { NextFunction, Request, Response } from "express";
import { authenticateJWT } from "../src/middleware/authMiddleware";

jest.mock("../src/services/findService");
jest.mock("../src/middleware/authMiddleware", () => ({
  ...jest.requireActual("../src/middleware/authMiddleware"),
  authenticateJWT: jest.fn(
    (req: Request, res: Response, next: NextFunction) => {
      next();
    },
  ),
}));

describe("GET /share/:resourceID/acquirer", () => {
  const resourceId = mockData.data[0].identifier;
  const resourceTitle = mockData.data[0].title;
  const expectedResource = mockData.data.find(
    (resource) => resource.identifier === resourceId,
  );

  if (!expectedResource) {
    throw new Error("Resource not found in mock data");
  }

  (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);

  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/share/${resourceId}/acquirer`);
    expect(authenticateJWT).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.text).toContain(resourceTitle);
  });
});
