import axios from "axios";
import {
  SingleApiResponse,
  ApiResponse,
  CatalogueItem,
  Organisation,
} from "../models/dataModels";
import { getLicenceTitleFromURL } from "../helperFunctions/formHelper";

export async function fetchResources(
  query?: string,
  organisationFilters?: string[],
  themeFilters?: string[],
): Promise<{
  resources: CatalogueItem[];
}> {
  const orgSearch =
    organisationFilters?.map((o) => `&organisation=${o}`).join("") || "";
  const topicSearch = themeFilters?.map((t) => `&topic=${t}`).join("") || "";
  const apiUrl = `${process.env.API_ENDPOINT}/catalogue?query=${
    query ? query : ""
  }${orgSearch}${topicSearch}`;
  if (!process.env.API_ENDPOINT) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  const response = await axios.get<ApiResponse>(apiUrl as string);
  const resources = response.data.data;

  return {
    resources,
  };
}

export async function fetchResourceById(
  resourceID: string,
): Promise<CatalogueItem | null> {
  const apiUrl = `${process.env.API_ENDPOINT}/catalogue/${resourceID}`;
  if (!process.env.API_ENDPOINT) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  let response;
  try {
    response = await axios.get<SingleApiResponse>(apiUrl as string);
    if (!response) {
      return null;
    }
  } catch (error: unknown) {
    console.error(`Error fetching resource: ${resourceID}`);
    if (axios.isAxiosError(error)) {
      console.error(`Error status: ${error.response?.status}`);
      console.error("Please check the API logs for details");
    }
    return null;
  }
  const resource = response.data.asset;

  if (!resource) {
    console.error("Resource not found.");
    return null;
  }

  if (resource.licence) {
    resource.licenceTitle = getLicenceTitleFromURL(resource.licence);
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
