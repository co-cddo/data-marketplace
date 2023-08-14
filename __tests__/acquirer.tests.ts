import axios from "axios";
import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";

// Mock axios get function
jest.mock("axios");
jest.mock("../src/services/findService");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GET /:resourceID/start", () => {
  beforeEach(() => {
    // Set up the axios get mock before each test
    process.env.API_ENDPOINT = "http://mock-test.endpoint.com/test-api";
    mockedAxios.get.mockResolvedValue({ data: mockData });
  });

  afterEach(() => {
    // Clear the mock after each test
    mockedAxios.get.mockClear();
    delete process.env.API_ENDPOINT;
  });

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
});
