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

interface Benefits {
  explanation?: string;
  checked?: boolean;
}

export interface RequestBody {
  [key: string]: string | undefined;
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

type LegalPowerStep = {
  decision: "yes" | "no" | "we don't know";
  explanation: string;
};

type StepValue = string | ProjectAimStep | BenefitsStep | LegalPowerStep;

interface Step {
  id: string;
  name: string;
  status: string;
  value: StepValue;
  nextStep?: string;
  blockedBy?: string[];
  errorMessage?: string;
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
  }
}
