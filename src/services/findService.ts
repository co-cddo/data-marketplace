import axios from "axios";
import {
  CatalogueItem,
  ApiResponse,
  SearchListResource,
  DataSetResource,
  DataServiceResource,
} from "../models/dataModels";

export async function fetchAllResources(
  query?: string,
): Promise<SearchListResource[]> {
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse[]>(apiUrl as string);
  // Flatten the array of data
  let resources = response.data.flatMap((apiResponse) => apiResponse.data);
  // Search the data if query is present
  if (query) {
    resources = resources.filter((catalogueItem) => {
      return Object.values(catalogueItem).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  }
  // Map the data to the new object shape
  return resources.map(
    (item: CatalogueItem): SearchListResource => ({
      ...item,
    }),
  );
}

export async function fetchResource(
  resourceID: string,
): Promise<DataSetResource | DataServiceResource> {
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  const response = await axios.get<ApiResponse[]>(apiUrl as string);
  // Flatten the array of data
  const resources = response.data.flatMap((apiResponse) => apiResponse.data);
  // Search the response and find the matching ID
  const resource = resources.find(
    (resource) => resource.identifier === resourceID,
  );
  if (!resource) {
    throw new Error("Resource not found.");
  }

  // Depending on the type of the resource, return the appropriate structure
  if (resource.type.toLowerCase() === "dataset") {
    return resource as DataSetResource;
  } else if (resource.type.toLowerCase() === "dataservice") {
    return resource as DataServiceResource;
  } else {
    throw new Error("Unknown resource type.");
  }
}
