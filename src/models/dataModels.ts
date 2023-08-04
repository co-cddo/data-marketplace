interface Organisation {
  title: string;
  id: string;
  acronym: string;
  homepage: string;
}

interface Creator {
  acronym: string;
  homepage: string;
  id: string;
  title: string;
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
  distributions: Distribution[];
  endpointDescription: string;
  endpointURL: string;
  identifier: string;
  issued: string;
  keyword: string[];
  licence: string;
  mediaType: string[];
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
  updateFrequency: string;
  version: string;
}

// ApiResponse is an interface that describes the structure of the entire API response. It has a data property that contains an array of CatalogueItems.
export interface ApiResponse {
  data: CatalogueItem[];
}

// Resource is the interface that holds the properties common between both types of resources. Includes optional properties.
export interface Resource {
  accessRights: string;
  catalogueCreated: string;
  catalogueModified: string;
  contactPoint: ContactPoint;
  creator: Creator[];
  description: string;
  distributions?: Distribution[];
  endpointDescription?: string;
  endpointURL?: string;
  identifier: string;
  issued: string;
  keyword: string[];
  licence: string;
  mediaType?: string[];
  modified: string | null;
  organisation: Organisation;
  relatedAssets: unknown[];
  securityClassification: string;
  servesData?: string[];
  serviceStatus?: string;
  serviceType?: string;
  summary: string | null;
  theme: string[];
  title: string;
  type: string;
  updateFrequency?: string;
  version: string;
}
// DataSetResource is the interface that extends BaseResource with the properties unique to DataSets.
export interface DataSetResource extends Resource {
  mediaType?: string[];
  distributions?: Distribution[];
  updateFrequency?: string;
}

// DataServiceResource is the interface that extends BaseResource with the properties unique to DataServices.
export interface DataServiceResource extends Resource {
  endpointDescription?: string;
  endpointURL?: string;
  servesData?: string[];
  serviceStatus?: string;
  serviceType?: string;
}
