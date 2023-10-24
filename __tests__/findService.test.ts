import axios from "axios";
import { fetchResources, fetchResourceById } from "../src/services/findService";

jest.mock("axios");

describe("fetchResources", () => {
  beforeEach(() => {
    process.env.API_ENDPOINT = "https://example.com/my-example-api";
  });
  it("should fetch resources with query and filters", async () => {
    const responseData = {
      data: {
        data: [
          { id: 1, name: "Resource 1" },
          { id: 2, name: "Resource 2" },
        ],
      },
    };
    (axios.get as jest.Mock).mockResolvedValue(responseData);

    const result = await fetchResources("exampleQuery", ["org1"], ["theme1"]);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("query=exampleQuery"),
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("organisation=org1"),
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("topic=theme1"),
    );

    expect(result.resources.length).toBe(2);
  });

  it("should throw an error when API_ENDPOINT is undefined", async () => {
    process.env.API_ENDPOINT = "";

    await expect(fetchResources()).rejects.toThrow(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  });

  it("should fetch a resource by ID", async () => {
    const resourceId = "123";
    const responseData = {
      data: {
        asset: { id: resourceId, title: "Resource 123" },
      },
    };
    (axios.get as jest.Mock).mockResolvedValue(responseData);

    const result = await fetchResourceById(resourceId);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/catalogue/${resourceId}`),
    );
    expect(result?.title).toBe("Resource 123");
  });

  it("should throw an error when API_ENDPOINT is undefined", async () => {
    process.env.API_ENDPOINT = "";

    await expect(fetchResourceById("123")).rejects.toThrow(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  });

  it("should throw an error when resource is not found", async () => {
    process.env.API_ENDPOINT = "https://example.com/my-example-api";
    const resourceId = "456";
    (axios.get as jest.Mock).mockResolvedValue({ data: { asset: null } });

    await expect(fetchResourceById(resourceId)).rejects.toThrow(
      "Resource not found.",
    );
  });
});
