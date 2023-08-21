export interface Organisation {
  id: string;
  title: string;
  abbreviation: string;
  slug: string;
  format: string;
  web_url: string;
}

interface Creator {
  id: string;
  title: string;
  abbreviation: string;
  slug: string;
  format: string;
  web_url: string;
}

interface ContactPoint {
  contactName: string;
  email: string;
}

interface Distribution {
  title: string;
  modified: string;
  mediaType: string;
}

// CatalogueItem interface describes the structure of the data obtained from the API.
export interface CatalogueItem {
  accessRights: string;
  catalogueCreated: string;
  catalogueModified: string;
  contactPoint: ContactPoint;
  creator: Creator[];
  description: string;
  distributions?: Distribution[] | null;
  endpointDescription?: string | null;
  endpointURL?: string | null;
  identifier: string;
  issued: string;
  keyword: string[];
  licence: string;
  mediaType?: string[] | null;
  modified: string | null;
  organisation: Organisation;
  relatedAssets: unknown[];
  securityClassification: string;
  servesData?: string[] | null;
  serviceStatus?: string | null;
  serviceType?: string | null;
  summary: string | null;
  theme: string[];
  title: string;
  type: string;
  updateFrequency?: string | null;
  version: string;
}

// ApiResponse is an interface that describes the structure of the entire API response. It has a data property that contains an array of CatalogueItems.
export interface ApiResponse {
  data: CatalogueItem[];
}

export interface SingleApiResponse {
  asset: CatalogueItem; // Not an array
}
