import axios from 'axios';
import { ApiResponse, CatalogueItem, Resource } from '../models/dataModels';

export async function fetchData(query?: string): Promise<Resource[]> {
  // Get data from the api
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse[]>(apiUrl as string);

  // Extract the data
  let resources = response.data.flatMap((apiResponse) => apiResponse.data);

  // Search the data if query is present
  if (query) {
    resources = resources.filter((catalogueItem) => {
      return Object.values(catalogueItem).some((value) =>
        value?.toString().toLowerCase().includes(query),
      );
    });
  }

  // Map the data to the new object shape
  return resources.map((item: CatalogueItem) => ({
    slug: item.identifier,
    title: item.title,
    issuing_body_readable: item.organisation.title,
    distributions: item.relatedAssets,
    description: item.description,
    dateUpdated: new Date(item.catalogueModified).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    type: item.type,
    organisation: item.organisation,
    license: item.licence,
    modified: new Date(item.modified).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    contactPoint: item.contactPoint,
    creator: item.creator,
    serviceType: item.serviceType,
    serviceStatus: item.serviceStatus,
    endpointDescription: item.endpointDescription,
    endpointURL: item.endpointURL,
    securityClassification: item.securityClassification,
    accessRights: item.accessRights,
    version: item.version,
    distribution: item.distribution
  }));
}

export async function fetchResource(resourceID: string): Promise<Resource | undefined> {
  // Get data from the api
  const response = await axios.get<ApiResponse[]>(
    process.env.API_ENDPOINT as string,
  );

  // Extract the data
  const resources = response.data.flatMap((apiResponse) => apiResponse.data);

  // Find the item with the specified resource ID
  const resource = resources.find((resource) => resource.identifier === resourceID);
  if (resource) return {
    ...resource,
    slug: resource.identifier,
    issuing_body_readable: resource.organisation.title,
    distributions: resource.distribution,
    description: resource.description,
    dateUpdated: new Date(resource.catalogueModified).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    type: resource.type,
    organisation: resource.organisation,
    license: resource.licence,
    modified: new Date(resource.modified).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    contactPoint: resource.contactPoint,
    creator: resource.creator,
    serviceType: resource.serviceType,
    serviceStatus: resource.serviceStatus,
    endpointDescription: resource.endpointDescription,
    endpointURL: resource.endpointURL,
    securityClassification: resource.securityClassification,
    accessRights: resource.accessRights,
    version: resource.version
  };
   else {
    return undefined;
  }
}
