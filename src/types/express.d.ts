/* eslint-disable  @typescript-eslint/no-unused-vars */
import { Request } from "express-serve-static-core";
import session from "express-session";
import { Organisation } from "../models/dataModels";

interface UserData {
  display_name: string;
  idToken: string;
  email: string;
  email_verified: boolean;
  nickname: string;
  name: string;
  // These are added by apiMiddleware.apiUser:
  user_id: string | null;
  organisation: Organisation | null;
  jobTitle: string | null;
  permission: string[];
}

interface FormData {
  requestId: string;
  assetTitle: string;
  dataAsset: string;
  contactPoint: ContactPoint;
  ownedBy: string;
  completedSections: number;
  status: FormStatus;
  overviewSections: Record<string, Section>;
  steps: Record<string, Step>;
}

interface ShareRequestResponse {
  requestId: string;
  assetTitle: string;
  requesterId: string;
  requesterEmail: string;
  requestingOrg: string;
  assetPublisher: Organisation;
  received: string;
  status: FormStatus;
  sharedata: FormData;
  neededBy: string | "UNREQUESTED";
  decisionNotes: string | null;
  decisionDate: string | null;
  reviewNotes: string | null;
}

export interface RequestBody {
  [key: string]: string | undefined;
}

// Add id's here. Should only be able to handle single value
type TextFieldStepID =
  | "impact"
  | "data-subjects"
  | "data-required"
  | "disposal";

type RadioFieldStepID =
  | "data-access"
  | "legal-review"
  | "role"
  | "security-review";

interface Benefits {
  explanation?: string;
  checked?: boolean;
}

type BenefitsStep = {
  "decision-making"?: Benefits;
  "service-delivery"?: Benefits;
  "benefit-people"?: Benefits;
  "allocate-and-evaluate-funding"?: Benefits;
  "social-economic-trends"?: Benefits;
  "needs-of-the-public"?: Benefits;
  "statistical-information"?: Benefits;
  "existing-research-or-statistics"?: Benefits;
  "something-else"?: Benefits;
};

type DataTypeStep = {
  personal: GenericDecisions;
  special: GenericDecisions;
  none: GenericDecisions;
};

type ProjectAimStep = {
  aims: string;
  explanation: string;
};

type GenericDecisions = {
  explanation?: string;
  checked: boolean;
};

type DeliveryStep = {
  "third-party": GenericDecisions;
  physical: GenericDecisions;
  something: GenericDecisions;
};

type FormatStep = {
  csv: GenericDecisions;
  sql: GenericDecisions;
  something: GenericDecisions;
};

type LegalPowerStep = {
  yes: GenericDecisions;
  no: GenericDecisions;
  "we-dont-know": GenericDecisions;
};

type LegalGatewayStep = {
  yes: GenericDecisions;
  other: GenericDecisions;
  "we-dont-know": GenericDecisions;
};

interface LawfulBasis {
  checked?: boolean;
}

type LawfulBasisPersonalStep = {
  "public-task"?: LawfulBasis;
  "legal-obligation"?: LawfulBasis;
  contract?: LawfulBasis;
  "legitimate-interests"?: LawfulBasis;
  consent?: LawfulBasis;
  "vital-interests"?: LawfulBasis;
  "law-enforcement"?: LawfulBasis;
};

type LawfulBasisSpecialStep = {
  "reasons-of-public-interest"?: LawfulBasis;
  "legal-claim-or-judicial-acts"?: LawfulBasis;
  "public-health"?: LawfulBasis;
  "health-or-social-care"?: LawfulBasis;
  "social-employment-security-and-protection"?: LawfulBasis;
  "vital-interests"?: LawfulBasis;
  "explicit-consent"?: LawfulBasis;
  "public-by-data-subject"?: LawfulBasis;
  "archiving-researching-statistics"?: LawfulBasis;
  "not-for-profit-bodies"?: LawfulBasis;
};

type LawfulBasisSpecialPublicInterestStep = {
  statutory?: LawfulBasis;
  administration?: LawfulBasis;
  equality?: LawfulBasis;
  "preventing-detecting"?: LawfulBasis;
  protecting?: LawfulBasis;
  "regulatory-requirements"?: LawfulBasis;
  journalism?: LawfulBasis;
  "preventing-fraud"?: LawfulBasis;
  suspicion?: LawfulBasis;
  support?: LawfulBasis;

  counselling?: LawfulBasis;
  "safeguarding-children"?: LawfulBasis;
  "safeguarding-economic"?: LawfulBasis;
  insurance?: LawfulBasis;
  "occupational-pensions"?: LawfulBasis;
  "political-parties"?: LawfulBasis;
  elected?: LawfulBasis;
  disclosure?: LawfulBasis;
  informing?: LawfulBasis;
  "legal-judgments"?: LawfulBasis;
  "anti-doping"?: LawfulBasis;
  standards?: LawfulBasis;
};

type GenericStringArray = string[];

type FormStatus =
  | "NOT STARTED"
  | "IN PROGRESS"
  | "AWAITING REVIEW"
  | "RETURNED"
  | "IN REVIEW"
  | "ACCEPTED"
  | "REJECTED";

export type StepValue =
  | string
  | GenericStringArray
  | DataTypeStep
  | ProjectAimStep
  | BenefitsStep
  | LegalPowerStep
  | LegalGatewayStep
  | DateStep
  | LawfulBasisPersonalStep
  | LawfulBasisSpecialStep
  | LawfulBasisSpecialPublicInterestStep
  | DeliveryStep
  | FormatStep;

interface Step {
  id: TextFieldStepID | RadioFieldStepID | string;
  name: string;
  status: string;
  value: StepValue;
  nextStep: string;
  blockedBy?: string[];
  errorMessage: { [key: string]: { text: string } } | string;
  skipped?: boolean;
}

type DateStep = {
  day?: number | null;
  month?: number | null;
  year?: number | null;
};

interface Section {
  name: string;
  steps: string[];
}

declare module "express-serve-static-core" {
  interface Request {
    user: UserData;
    apiKey: string;
    shareRequest: ShareRequestResponse | null;
  }
}

type NestedJSON = {
  [key: string]: NestedJSON | string | number | boolean | null;
};

export type UploadError = {
  scope: string;
  message: string;
  location: string;
  extras: { [key: string]: unknown };
  sub_errors: UploadError[] | null;
};

declare module "express-session" {
  interface SessionData {
    acquirerForms: Record<string, FormData>;
    backLink: string;
    formErrors: { [key: string]: { text: string } };
    uploadData: NestedJSON[];
    uploadErrors: UploadError[];
    uploadFilename: string;
    profileErrors: { [key: string]: { text: string } };
    profileData: {
      jobTitle?: string;
      otherJobTitle?: boolean;
      organisation?: string;
    };
    decisionErrors: { [key: string]: { text: string } };
    decision: { status: string; notes: string };
    formValuesValidationError: RequestBody;
    pageHistory: string[];
    returnTo: string;
  }
}

/**
 * Supplier Journey Types & Interfaces start
 */
export type ShareRequestTableColumn = {
  html?: string;
  text?: string;
  colspan?: number;
  classes?: string;
};

export type ShareRequestTableRow = ShareRequestTableColumn[];

export type ShareRequestTable = ShareRequestTableRow[];

interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
