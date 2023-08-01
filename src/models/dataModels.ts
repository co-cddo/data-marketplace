// Organisation is an interface that describes the structure of the organisation that has issued or owns the CatalogueItem.
interface Organisation {
  title: string;
  id: string;
  acronym: string;
  homepage: string;
}

// Creator is an interface that describes the structure of the entity that created the CatalogueItem.
interface Creator {
  acronym: string;
  homepage: string;
  id: string;
  title: string;
}

// ContactPoint is an interface that describes the structure of a point of contact associated with the CatalogueItem.
interface ContactPoint {
  contactName: string;
  email: string;
}

// Distribution is an interface that describes the structure of a specific distribution of a CatalogueItem.
interface Distribution {
  title: string;
  modified: string;
  mediaType: string;
}

// CatalogueItem is an interface that describes the structure of an item from the original API response.
export interface CatalogueItem {
  accessRights: string;
  catalogueCreated: string;
  catalogueModified: string;
  contactPoint: ContactPoint;
  creator: Creator[];
  description: string;
  distribution: Distribution[];
  endpointDescription: string;
  endpointURL: string;
  identifier: string;
  issued: string;
  keyword: string[];
  licence: string;
  modified: string;
  organisation: Organisation;
  relatedAssets: unknown[];
  securityClassification: string;
  servesData: string[];
  serviceStatus: string;
  serviceType: string;
  summary: string;
  theme: string[];
  title: string;
  type: string;
  version: string;

}

// ApiResponse is an interface that describes the structure of the entire API response. It has a data property that contains an array of CatalogueItems.
export interface ApiResponse {
  data: CatalogueItem[];
}

// This describes the structure of the final resources after processing the original data obtained from the API.
// This is useful to provide a simplified or restructured version of the API data that fits the needs of the application.
export interface Resource {
  slug: string;
  title: string;
  issuing_body_readable: string;
  distributions: unknown[];
  description: string;
  dateUpdated: string;
  type: string;
  organisation: Organisation;
  license: string;
  modified: string;
  contactPoint: ContactPoint;
  creator: Creator[];
  distribution: Distribution[];
  serviceType: string;
  serviceStatus: string;
  endpointDescription: string;
  endpointURL: string;
  securityClassification: string;
  accessRights: string;
  version: string;
}