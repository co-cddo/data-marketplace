/* eslint-disable  @typescript-eslint/no-unused-vars */
import { Request } from "express-serve-static-core";
import session from "express-session";

interface UserData {
  display_name: string;
  idToken: string;
}

interface FormData {
  requestId: string;
  assetTitle: string;
  dataAsset: string;
  ownedBy: string;
  completedSections: number;
  status: FormStatus;
  sections: Record<string, Section>;
  steps: Record<string, Step>;
  stepHistory?: string[];
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

type MoreOrganisationStep = string[];

type FormStatus =
  | "NOT STARTED"
  | "IN PROGRESS"
  | "CANNOT START YET"
  | "NOT REQUIRED"
  | "AWAITING REVIEW"
  | "RETURNED"
  | "IN REVIEW";

export type StepValue =
  | string
  | MoreOrganisationStep
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
  errorMessage?: string;
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
  }
}

declare module "express-session" {
  interface SessionData {
    acquirerForms?: Record<string, FormData>;
    backLink: string;
  }
}
