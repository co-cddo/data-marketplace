import axios from "axios";
import {
  DataService,
  Organisation,
  ApiResponse,
  Resource,
} from "../models/dataModels";

export async function fetchData(
  query?: string,
  organisationFilter?: string,
): Promise<{ resources: Resource[]; uniqueOrganisations: Organisation[] }> {
  // Get data from the api
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse[]>(apiUrl as string);

  // Flatten the array of data
  let resources = response.data.flatMap((apiResponse) => apiResponse.data);

  // Extract unique organisations
  const uniqueOrganisationsMap: Map<string, Organisation> = new Map();
  resources.forEach((dataService) => {
    uniqueOrganisationsMap.set(
      dataService.organisation.title,
      dataService.organisation,
    );
  });

  const uniqueOrganisations = Array.from(uniqueOrganisationsMap.values());

  if (organisationFilter) {
    const selectedOrganisations = organisationFilter.split(",");
    resources = resources.filter((dataService) =>
      selectedOrganisations.includes(dataService.organisation.id),
    );
  }

  console.log("Unique Organisations:", uniqueOrganisations);

  // Search the data if query is present
  if (query) {
    resources = resources.filter((dataService) => {
      return Object.values(dataService).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  }

  // console.log("JSON Data", resources)
  // Map the data to the new object shape
  const mappedResources = resources.map((item: DataService) => ({
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

  // console.log("mappedResources ", mappedResources);
  return { resources: mappedResources, uniqueOrganisations };
}
