import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";

jest.mock("../src/services/findService");

describe("GET /share/:resourceID/acquirer", () => {
  const resourceId = mockData.data[0].identifier;
  const resourceTitle = mockData.data[0].title;
  const expectedResource = mockData.data.find(resource => resource.identifier === resourceId);

  if (!expectedResource) {
    throw new Error("Resource not found in mock data");
  }

  // Set up the service layer mock to return the expected resource
  (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);

  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/share/${resourceId}/acquirer`);

    expect(response.status).toBe(200);
    expect(response.text).toContain(resourceTitle);
  });
});