import axios from 'axios';
import { fetchResources, fetchResourceById } from '../src/services/findService';
import mockData from './mock/mockData.json';

// Mock axios get function
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


describe('fetchResources', () => {
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
    const expectedData = mockData.data;
    const result = await fetchResources();

    expect(result).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(process.env.API_ENDPOINT);
  });

  it('should return filtered data when a query is provided', async () => {
    const query = 'test';
    const expectedData = mockData.data.filter((resource) => {
      return Object.values(resource).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
    const result = await fetchResources(query);
    expect(result).toEqual(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledWith(process.env.API_ENDPOINT);
  })

  it('should throw an error when the axios request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('An error occurred while fetching data from the API'));
    await expect(fetchResources('test')).rejects.toThrow('An error occurred while fetching data from the API');
  });
});

describe('fetchResourceById', () => {
  beforeEach(() => {
    // Set up the axios get mock before each test
    process.env.API_ENDPOINT = 'http://mock-test.endpoint.com/';
    mockedAxios.get.mockResolvedValue({ data: mockData });
  });

  afterEach(() => {
    // Clear the mock after each test
    mockedAxios.get.mockClear();
    delete process.env.API_ENDPOINT;
  });

  it('should return the correct resource data when valid ID is provided', async () => {
    const resourceId = mockData.data[0].identifier;
    const expectedResource = mockData.data.find(resource => resource.identifier === resourceId);
    const result = await fetchResourceById(resourceId);

    expect(result).toEqual(expectedResource);
  });

  it('should throw an error when the provided ID does not exist', async () => {
    const resourceId = 'non-existing-id';
    mockedAxios.get.mockResolvedValue({ data: mockData});
    await expect(fetchResourceById(resourceId)).rejects.toThrow('Resource not found.');
  });

  it('should throw an error when the axios request fails', async () => {
    const resourceId = mockData.data[0].identifier;
    mockedAxios.get.mockRejectedValue(new Error('An error occurred while fetching data from the API'));
    await expect(fetchResourceById(resourceId)).rejects.toThrow('An error occurred while fetching data from the API');
  });
});