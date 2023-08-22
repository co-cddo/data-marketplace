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
type TextFieldStepID = "impact" | "data-subjects" | "data-required";
type RadioFieldStepID = "data-type" | "data-access" | "legal-review";

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

type ProjectAimStep = {
  aims: string;
  explanation: string;
};

type LegalDecision = {
  explanation?: string;
  checked: boolean;
};

type FormatStep = {
  csv: LegalDecision;
  sql: LegalDecision;
  something: LegalDecision;
};

type LegalPowerStep = {
  yes: LegalDecision;
  no: LegalDecision;
  "we-dont-know": LegalDecision;
};

type LegalGatewayStep = {
  yes: LegalDecision;
  other: LegalDecision;
  "we-dont-know": LegalDecision;
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

export type StepValue =
  | string
  | ProjectAimStep
  | BenefitsStep
  | LegalPowerStep
  | LegalGatewayStep
  | DateStep
  | LawfulBasisPersonalStep
  | LawfulBasisSpecialStep
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
