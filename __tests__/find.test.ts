import request from "supertest";
import app from "../src/app";
import {
  fetchResources,
  fetchOrganisations,
} from "../src/services/findService";
jest.mock("../src/services/findService");
describe("GET /", () => {
  it("should render the find.njk template with data when API calls are successful", async () => {
    const mockResources = [
      { id: 1, title: "Resource 1", type: "dataservice" },
      { id: 199, title: "Resource 112", type: "dataservice" },
    ];
    const mockOrganisations = [
      { id: "org1", title: "Org 1" },
      { id: "org2", title: "Org 2" },
    ];

    (fetchResources as jest.Mock).mockResolvedValue({
      resources: mockResources,
    });
    (fetchOrganisations as jest.Mock).mockResolvedValue(mockOrganisations);

    const response = await request(app).get("/find");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Resource 1");
    expect(response.text).toContain("Resource 112");
    expect(response.text).toContain("Org 1");
    expect(response.text).toContain("Org 2");
    expect(response.text).not.toContain("Org 3");
  });

  it("should render the find.njk template with error message when API calls fail", async () => {
    (fetchResources as jest.Mock).mockRejectedValue(new Error("API error"));

    const response = await request(app).get("/find");

    expect(response.status).toBe(500);
    expect(response.text).toContain(
      "Sorry, there is a problem with the service - Data Marketplace - GOV.UK",
    );
  });
});
