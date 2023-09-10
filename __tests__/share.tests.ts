import request, { Response } from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";
import { NextFunction, Request } from "express";

jest.mock("../src/services/findService");
jest.mock("../src/middleware/authMiddleware", () => ({
  ...jest.requireActual("../src/middleware/authMiddleware"),
  authenticateJWT: (req: Request, res: Response, next: NextFunction) => {
    next(); // this basically always passes auth
  },
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/share/${resourceId}/acquirer`);
    expect(response.status).toBe(200);
    expect(response.text).toContain(resourceTitle);
  });
});
