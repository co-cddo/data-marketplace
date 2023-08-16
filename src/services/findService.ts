
import axios from "axios";
import {
  SingleApiResponse,
  ApiResponse,
  CatalogueItem,
  Organisation,
} from "../models/dataModels";

export async function fetchResources(
  query?: string,
  organisationFilters?: string[],
  filterOptionTags?: string[],
): Promise<{
  resources: CatalogueItem[];
  uniqueOrganisations: Organisation[];
  selectedFilters?: string[];
}> {
  const apiUrl = `${process.env.API_ENDPOINT}/catalogue`;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse>(apiUrl as string);
  let resources = response.data.data;
  // Search the data if query is present
  if (query) {
    resources = resources.filter((catalogueItem) => {
      return Object.values(catalogueItem).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  }

  // Extract unique organisations
  const organisationsSet = new Set();
  const uniqueOrganisations: Organisation[] = [];
  resources.forEach((item) => {
    if (item.organisation && !organisationsSet.has(item.organisation.id)) {
      uniqueOrganisations.push(item.organisation);
      organisationsSet.add(item.organisation.id);
    }
  });

  if (organisationFilters) {
    resources = resources.filter(
      (item) =>
        item.organisation && organisationFilters.includes(item.organisation.id),
    );
  }

  return {
    resources: resources,
    uniqueOrganisations: uniqueOrganisations,
    selectedFilters: filterOptionTags,
  };
}
export async function fetchResourceById(
  resourceID: string,
): Promise<CatalogueItem> {
  const apiUrl = `${process.env.API_ENDPOINT}/catalogue/${resourceID}`;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  const response = await axios.get<SingleApiResponse>(apiUrl as string);

  const resource: CatalogueItem = response.data.asset;  // Extract from 'asset' property

  if (!resource) {
    throw new Error("Resource not found.");
  }

  return resource;
}