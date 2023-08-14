import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";

jest.mock("../src/services/findService");

describe("GET /:resourceID/start", () => {
  const resourceId = mockData.data[0].identifier;
  const expectedResource = mockData.data.find(resource => resource.identifier === resourceId);
  if (!expectedResource) {
    throw new Error("Resource not found in mock data");
  }

  // Set up the service layer mock to return the expected resource
  (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);
  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/acquirer/${resourceId}/start`);
    expect(response.status).toBe(200);
    // We test the render of the first section
    expect(response.text).toContain("Purpose of the data share");
    // We test the render of the first question of first section
    expect(response.text).toContain("Data type");
  });

  // Handling case when a resource is not found
  it("should return a 404 status when resource ID does not exist", async () => {
    (fetchResourceById as jest.Mock).mockResolvedValue(null);
    const response = await request(app).get(`/acquirer/non-existing-id/start`);
    expect(response.status).toBe(404);
    expect(response.text).toContain("Resource not found");
  });

  // Handling case when fetchResourceById throws an error
  it("should return a 500 status when an error occurs fetching resource data", async () => {
    (fetchResourceById as jest.Mock).mockRejectedValue(new Error("An error occurred while fetching data from the API"));
    const response = await request(app).get(`/acquirer/${resourceId}/start`);
    expect(response.status).toBe(500);
    expect(response.text).toContain("An error occurred while fetching data from the API");
  });

  it("should render legal-power", async () => {
    (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);
    const response = await request(app).get(`/acquirer/${resourceId}/legal-power`);
    expect(response.status).toBe(200);
    // We render the question
    expect(response.text).toContain("legal power");
    // We render the last option
    expect(response.text).toContain("We don't know");
  });

});
