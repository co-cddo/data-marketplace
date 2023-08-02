import axios from "axios";
import { ApiResponse, CatalogueItem } from "../models/dataModels";

export async function fetchAllResources(
  query?: string,
): Promise<CatalogueItem[]> {
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse[]>(apiUrl as string);

  let resources = response.data.flatMap((apiResponse) => apiResponse.data);

  if (query) {
    resources = resources.filter((catalogueItem) => {
      return Object.values(catalogueItem).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  }

  return resources;
}

export async function fetchResource(
  resourceID: string,
): Promise<CatalogueItem> {
  const response = await axios.get<ApiResponse[]>(
    process.env.API_ENDPOINT as string,
  );

  const resources = response.data.flatMap((apiResponse) => apiResponse.data);

  const resource = resources.find(
    (resource) => resource.identifier === resourceID,
  );

  if (!resource) {
    throw new Error("Resource not found.");
  }

  return resource;
}
