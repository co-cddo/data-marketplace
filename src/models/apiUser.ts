import { Organisation } from "./dataModels";

export type ApiUser = {
  user_id: string;
  email: string;
  org: Organisation | null;
  role: string | null;
};
