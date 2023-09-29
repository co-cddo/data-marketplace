import { Organisation } from "./dataModels";

export type ApiUser = {
  user_id: string;
  email: string;
  org: Organisation | null;
  jobTitle: string | null;
  permission: string[];
};
