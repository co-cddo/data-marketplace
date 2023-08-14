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

interface Step {
  id: string;
  name: string;
  status: string;
  value: string;
  nextStep?: string;
  blockedBy?: string[];
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
