import axios from "axios";
import {
  CatalogueItem,
  ApiResponse,
  DataSetResource,
  DataServiceResource,
  Organisation,
} from "../models/dataModels";

export async function fetchResources(
  query?: string,
  organisationFilters?: string[],
  filterOptionTags?: string[],
): Promise<{
  resources: (DataSetResource | DataServiceResource)[];
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

  // Map the data to the new object shape
  const mappedResources = resources.map((item: CatalogueItem) => {
    if (item.type.toLowerCase() === "dataset") {
      return {
        ...item,
        mediaType: item.mediaType,
      } as DataSetResource;
    } else if (item.type.toLowerCase() === "dataservice") {
      return {
        ...item,
        serviceType: item.serviceType,
      } as DataServiceResource;
    } else {
      throw new Error("Unknown resource type.");
    }
  });

  return {
    resources: mappedResources,
    uniqueOrganisations: uniqueOrganisations,
    selectedFilters: filterOptionTags,
  };
}

export async function fetchResourceById(
  resourceID: string,
): Promise<DataSetResource | DataServiceResource> {
  const apiUrl = `${process.env.API_ENDPOINT}/catalogue`;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }

  const response = await axios.get<ApiResponse>(apiUrl as string);
  const resources = response.data.data;

  // Search the response and find the matching ID
  const resource = resources.find(
    (resource) => resource.identifier === resourceID,
  );

  if (!resource) {
    throw new Error("Resource not found.");
  }

  // Depending on the type of the resource, return the appropriate structure
  if (resource.type.toLowerCase() === "dataset") {
    return {
      ...resource,
      distributions: resource.distributions,
      updateFrequency: resource.updateFrequency,
    } as DataSetResource;
  } else if (resource.type.toLowerCase() === "dataservice") {
    return {
      ...resource,
      endpointDescription: resource.endpointDescription,
      endpointURL: resource.endpointURL,
      servesData: resource.servesData,
      serviceStatus: resource.serviceStatus,
      serviceType: resource.serviceType,
    } as DataServiceResource;
  } else {
    throw new Error("Unknown resource type.");
  }
}
