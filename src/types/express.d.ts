/* eslint-disable  @typescript-eslint/no-unused-vars */
import { Request } from "express-serve-static-core";
import session from "express-session";

interface UserData {
  display_name: string;
  idToken: string;
}

interface FormData {
  requestId: string;
  dataAsset: string;
  ownedBy: string;
  status: string;
  sections: Record<string, Section>;
  steps: Record<string, Step>;
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

type ProjectAimStep = { 
  aims: string; 
  explanation: string;
}

type StepValue = string | ProjectAimStep;

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
