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
  status: string;
  sections: Record<string, Section>;
  steps: Record<string, Step>;
}

export interface RequestBody {
  [key: string]: string | undefined;
}

// Add id's here. Should only be able to handle single value
type TextFieldStepID = "impact" | "data-subjects" | "data-required" | "disposal";
type RadioFieldStepID = "data-access" | "legal-review" | "role";

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
}

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
  something: GenericDecisions
}

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

type LawfulSpecialPublicInterestStep = {
  "statutory-government-purposes"?: LawfulBasis;
  "administration-justice-parliamentary-purposes"?: LawfulBasis;
  "equality-opportunity-or-treatment"?: LawfulBasis;
  "preventing-or-detecting-unlawful-acts"?: LawfulBasis;
  "protecting-the-public"?: LawfulBasis;
  "racial-ethnic-diversity-senior-levels"?: LawfulBasis;
  "regulatory-requirements"?: LawfulBasis;
  "journalism-academia-art-literature"?: LawfulBasis;
  "preventing-fraud"?: LawfulBasis;
  "suspicion-terrorist-financing-or-money-laundering"?: LawfulBasis;
  "support-particular-disability-or-mental-condition"?: LawfulBasis;
  "counselling"?: LawfulBasis;
  "safeguarding-children-individuals-risk"?: LawfulBasis;
  "safeguarding-economic-well-being"?: LawfulBasis;
  "insurance"?: LawfulBasis;
  "occupational-pensions"?: LawfulBasis;
  "political-parties"?: LawfulBasis;
  "elected-representatives-responding-requests"?: LawfulBasis;
  "disclosure-elected-representatives"?: LawfulBasis;
  "informing-elected-representatives-about-prisoners"?: LawfulBasis;
  "publication-legal-judgments"?: LawfulBasis;
  "anti-doping-sport"?: LawfulBasis;
  "standards-behaviour-sport"?: LawfulBasis;
};

export type StepValue =
  | string
  | DataTypeStep
  | ProjectAimStep
  | BenefitsStep
  | LegalPowerStep
  | LegalGatewayStep
  | DateStep
  | LawfulBasisPersonalStep
  | LawfulBasisSpecialStep
  | LawfulSpecialPublicInterestStep
  | DeliveryStep
  | FormatStep;

interface Step {
  id: TextFieldStepID | RadioFieldStepID | string;
  name: string;
  status: string;
  value: StepValue;
  nextStep?: string;
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
