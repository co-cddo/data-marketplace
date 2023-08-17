import axios from "axios";
import { fetchResources, fetchResourceById } from "../src/services/findService";
import mockData from "./mock/mockData.json";
import singleMockData from "./mock/singleMockData.json";

// Mock axios get function
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;


describe("fetchResources", () => {
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

  it("should return the correct data when no query is provided", async () => {
    const expectedData = mockData.data;
    const result = await fetchResources();

    expect(result.resources).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
  });

  it("should return filtered data when a query is provided", async () => {
    const query = "test";
    const expectedData = mockData.data.filter((resource) => {
      return Object.values(resource).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
    const result = await fetchResources(query);
    expect(result.resources).toEqual(expectedData); 
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
  })

  it("should return filtered data when one organisation filter is provided", async () => {
    // the filter gets passed as a string when there is only one filter selected
    const organisationFilter = "department-for-test";
    
    const expectedData = mockData.data.filter((resource) => {
      return resource.organisation.id.toLowerCase() === organisationFilter.toLowerCase();
    });
    // use undefined in the function call to explicitly state that we"re not passing a value for query
    const result = await fetchResources(undefined, [organisationFilter]);
    expect(result.resources).toEqual(expectedData); 
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
  });
  

  it("should return filtered data when two organisation filters are provided", async () => {
    // the filter gets passed as an array when there is more than one filter selected
    const organisationFilters = ["department-for-test", "department-for-test-test"];
  
    const expectedData = mockData.data.filter(resource => {
      return organisationFilters.includes(resource.organisation.id.toLowerCase());
    });
    // use undefined in the function call to explicitly state that we"re not passing a value for query
    const result = await fetchResources(undefined, organisationFilters);
    expect(result.resources).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
  });

  it("should return filtered data when both a query and an organisation filter are provided", async () => {
    const query = "test service";
    const organisationFilter = "department-for-test";

    const expectedData = mockData.data.filter((resource) => {
        const matchesQuery = Object.values(resource).some(
            (value) => value?.toString().toLowerCase().includes(query)
        );
        const matchesOrgFilter = resource.organisation.id.toLowerCase() === organisationFilter.toLowerCase();
        
        return matchesQuery && matchesOrgFilter;
    });

    const result = await fetchResources(query, [organisationFilter]);
    expect(result.resources).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
  });

  it("should return no data when neither the query nor the organisation filter matches", async () => {
    const query = "nonexistentquery";
    const organisationFilter = "nonexistent-organisation";
    const expectedData = mockData.data.filter((resource) => {
        const matchesQuery = Object.values(resource).some(
            (value) => value?.toString().toLowerCase().includes(query)
        );
        const matchesOrgFilter = resource.organisation.id.toLowerCase() === organisationFilter.toLowerCase();

        return matchesQuery || matchesOrgFilter;
    });
    expect(expectedData.length).toBe(0);

    const result = await fetchResources(query, [organisationFilter]);
    expect(result.resources).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.API_ENDPOINT}/catalogue`);
});

  it("should throw an error when the axios request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("An error occurred while fetching data from the API"));
    await expect(fetchResources("test")).rejects.toThrow("An error occurred while fetching data from the API");
  });
});

describe("fetchResourceById", () => {
  beforeEach(() => {
    // Set up the axios get mock before each test
    process.env.API_ENDPOINT = "http://mock-test.endpoint.com/";
    mockedAxios.get.mockResolvedValue({ data: singleMockData });
  });

  afterEach(() => {
    // Clear the mock after each test
    mockedAxios.get.mockClear();
    delete process.env.API_ENDPOINT;
  });

  it("should return the correct resource data when valid ID is provided", async () => {
    const resourceId = singleMockData.asset.identifier; 
    const expectedResource = singleMockData.asset;
    const result = await fetchResourceById(resourceId);

    expect(result).toEqual(expectedResource);
  });

  it("should throw an error when the provided ID does not exist", async () => {
    const resourceId = "non-existing-id";
    mockedAxios.get.mockResolvedValue({ data: { asset: null } }); 
    await expect(fetchResourceById(resourceId)).rejects.toThrow("Resource not found.");
  });
  

  it("should throw an error when the axios request fails", async () => {
    const resourceId = mockData.data[0].identifier;
    mockedAxios.get.mockRejectedValue(new Error("An error occurred while fetching data from the API"));
    await expect(fetchResourceById(resourceId)).rejects.toThrow("An error occurred while fetching data from the API");
  });
});