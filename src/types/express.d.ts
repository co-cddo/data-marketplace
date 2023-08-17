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
  explanation?: string | undefined;
  checked?: boolean | undefined
}

type ProjectAimStep = { 
  aims?: string; 
  explanation?: string;
  'decision-making'?: Benefits | undefined;
  'service-delivery'?: Benefits | undefined;
  'benefit-people'?: Benefits | undefined;
  'allocate-and-evaluate-funding'?: Benefits | undefined;
  'social-economic-trends'?: Benefits | undefined;
  'needs-of-the-public'?: Benefits | undefined;
  'statistical-information'?: Benefits | undefined;
  'existing-research-or-statistics'?: Benefits | undefined;
  'something-else'?: Benefits | undefined;
}

type StepValue = string | ProjectAimStep;

interface Step {
  id: string;
  name: string;
  status: string;
  value: StepValue;
  nextStep?: string;
  blockedBy?: string[];
}

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
