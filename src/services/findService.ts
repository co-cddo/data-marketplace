import axios from "axios";
import { DataService, ApiResponse, Resource } from "../models/dataModels";

export async function fetchData(query?: string): Promise<Resource[]> {
  // Get data from the api
  const apiUrl = process.env.API_ENDPOINT;
  if (!apiUrl) {
    throw new Error(
      "API endpoint is undefined. Please set the API_ENDPOINT environment variable.",
    );
  }
  const response = await axios.get<ApiResponse>(apiUrl as string);

  // Flatten the array of data
  // let resources = response.data.flatMap((apiResponse) => apiResponse.data);
  let resources = response.data.data;

  // Search the data if query is present
  if (query) {
    resources = resources.filter((dataService) => {
      return Object.values(dataService).some(
        (value) => value?.toString().toLowerCase().includes(query),
      );
    });
  }

  // Map the data to the new object shape
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
