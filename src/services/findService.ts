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
    if (item.organisation && !organisationsSet.has(item.organisation.slug)) {
      uniqueOrganisations.push(item.organisation);
      organisationsSet.add(item.organisation.slug);
    }
  });

  if (organisationFilters) {
    resources = resources.filter(
      (item) =>
        item.organisation &&
        organisationFilters.includes(item.organisation.slug),
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
  const resource = response.data.asset;

  if (!resource) {
    throw new Error("Resource not found.");
  }

  return resource;
}

export async function fetchOrganisations(): Promise<Organisation[]> {
  const apiUrl = `${process.env.API_ENDPOINT}/organisations`;

  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  const response = await axios.get<Organisation[]>(apiUrl);
  const organisations: Organisation[] = response.data;
  return organisations;
}
