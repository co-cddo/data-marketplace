interface Organisation {
  title: string;
  id: string;
  acronym: string;
  homepage: string;
}

interface Facet {
  title: string;
  id: string;
}

// DataService interface describes the structure of the data obtained from the API.
export interface DataService {
  id: string;
  organisation: Organisation;
  title: string;
  description: string;
  created: string;
  type: string;
  modified: string;
}

// ApiResponse interface describes the structure of the entire API response.
export interface ApiResponse {
  data: DataService[];
  facets: {
    topics: Facet[];
    organisations: Facet[];
    assetTypes: Facet[];
  };
}

// Resource interface describes the structure of the final resources after processing the original data obtained from the API.
export interface Resource {
  slug: string;
  title: string;
  issuing_body_readable: string;
  distributions: unknown[];
  description: string;
  dateUpdated: string;
}
