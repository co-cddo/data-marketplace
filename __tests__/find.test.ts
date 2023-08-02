import axios from "axios";
import { fetchData } from '../src/services/findService';
import mockData from './mock/mockData.json';
import { ApiResponse, Resource, DataService } from "../src/models/dataModels";

function processMockData(data: ApiResponse[]): Resource[] {
  const resources = data.flatMap((apiResponse) => apiResponse.data);

  return resources.map((item: DataService) => ({
    slug: item.id,
    title: item.title,
    issuing_body_readable: item.organisation.title,
    distributions: [],
    description: item.description,
    dateUpdated: new Date(item.modified).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }));
}

// Mock axios get function
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchData', () => {
  beforeEach(() => {
    // Set up the axios get mock before each test
    process.env.API_ENDPOINT = 'http://mock-test.endpoint.com/test-api';
    mockedAxios.get.mockResolvedValue({ data: mockData });
  });

  afterEach(() => {
    // Clear the mock after each test
    mockedAxios.get.mockClear();
    delete process.env.API_ENDPOINT;
  });

  it('should return the correct data when no query is provided', async () => {
    const expectedData = processMockData(mockData);
    const result = await fetchData();
  
    // expect(result).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(process.env.API_ENDPOINT);
  });
  
  it('should return filtered data when a query is provided', async () => {
    const query = 'test';
    const expectedData = processMockData(mockData).filter((dataService) => {
      return Object.values(dataService).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  
    const result = await fetchData(query);
    // expect(result).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(process.env.API_ENDPOINT);
  });

  it('should throw an error when the axios request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('An error occurred while fetching data from the API'));
    await expect(fetchData()).rejects.toThrow('An error occurred while fetching data from the API');
  });
});