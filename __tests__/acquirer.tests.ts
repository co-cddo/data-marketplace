import axios from "axios";
import request from "supertest";
import app from "../src/app";
import { fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";
import { NextFunction, Request, Response } from "express";
import { authenticateJWT } from "../src/middleware/authMiddleware";

// Mock axios get function
jest.mock("axios");
jest.mock("../src/services/findService");
jest.mock("../src/middleware/authMiddleware", () => ({
  ...jest.requireActual("../src/middleware/authMiddleware"),
  authenticateJWT: jest.fn(
    (req: Request, res: Response, next: NextFunction) => {
      req.user = {
        email: "test@test.com",
        nickname: "testuser",
        display_name: "Test User",
        idToken: "someToken",
        name: "test user",
        email_verified: true,
        organisation: null,
        user_id: null,
        jobTitle: null,
        permission: []
      };
      next();
    },
  ),
}));
jest.mock("../src/middleware/apiMiddleware", () => ({
  ...jest.requireActual("../src/middleware/apiMiddleware"),
  apiUser: jest.fn(
    (req: Request, res: Response, next: NextFunction) => {
      req.user.organisation = {
        "id": "https://www.gov.uk/api/organisations/department-for-work-pensions",
        "title": "Department for Work and Pensions",
        "abbreviation": "DWP",
        "slug": "department-for-work-pensions",
        "format": "Ministerial department",
        "web_url": "https://www.gov.uk/government/organisations/department-for-work-pensions"
      },
        req.user.user_id = "abcd1234",
        req.user.jobTitle = "Technology"
      next()
    }
  )
}))
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GET /:resourceID/start", () => {
  beforeEach(() => {
    // Set up the axios get mock before each test
    process.env.API_ENDPOINT = "http://mock-test.endpoint.com/test-api";
    mockedAxios.get.mockResolvedValue({ data: mockData });
  });

  afterEach(() => {
    // Clear the mock after each test
    jest.clearAllMocks();
    delete process.env.API_ENDPOINT;
  });

  const resourceId = mockData.data[0].identifier;
  const expectedResource = mockData.data.find(
    (resource) => resource.identifier === resourceId,
  );
  if (!expectedResource) {
    throw new Error("Resource not found in mock data");
  }

  // Set up the service layer mock to return the expected resource
  (fetchResourceById as jest.Mock).mockResolvedValue(expectedResource);
  it("should return the correct resource data when valid ID is provided", async () => {
    const response = await request(app).get(`/acquirer/${resourceId}/start`);
    expect(response.status).toBe(200);
    expect(authenticateJWT).toHaveBeenCalledTimes(1);
    // We test the render of the first section
    expect(response.text).toContain("Purpose of the data share");
    // We test the render of the first question of first section
    expect(response.text).toContain("Data type");
  });

  // Handling case when a resource is not found
  it("should return a 404 status when resource ID does not exist", async () => {
    (fetchResourceById as jest.Mock).mockResolvedValue(null);
    const response = await request(app).get(`/acquirer/non-existing-id/start`);
    expect(authenticateJWT).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(response.text).toContain("Resource not found");
  });
  // Handling case when fetchResourceById throws an error
  it("should return a 500 status when an error occurs fetching resource data", async () => {
    (fetchResourceById as jest.Mock).mockRejectedValue(
      new Error("An error occurred while fetching data from the API"),
    );
    const spy = jest.spyOn(console, "error").mockImplementation();
    const response = await request(app).get(`/acquirer/${resourceId}/start`);
    expect(response.status).toBe(500);
    expect(authenticateJWT).toHaveBeenCalledTimes(1);
    expect(response.text).toContain(
      "An error occurred while fetching data from the API",
    );
    expect(spy).toHaveBeenCalledWith(
      "An error occurred while fetching data from the API:",
      expect.any(Error),
    );
    spy.mockRestore();
  });
});

describe("GET//:resourceID/:steps", () => {
  const resourceId = mockData.data[0].identifier;
  const expectedResource = mockData.data.find(
    (resource) => resource.identifier === resourceId,
  );
  if (!expectedResource) {
    throw new Error("Resource not found in mock data");
  }
  // Handling data-subjects
  it("should return a 302 status when select data-subjects", async () => {
    const response = await request(app).get(
      `/acquirer/${resourceId}/data-subjects`,
    );
    expect(authenticateJWT).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(
      "/share/fcbc4d3f-0c05-4857-b0h7-eeec6bfcd3a1/acquirer",
    );
  });
});
