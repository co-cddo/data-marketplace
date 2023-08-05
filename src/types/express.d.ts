import { Request } from "express-serve-static-core";

interface UserData {
  display_name: string;
  idToken: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user: UserData;
  }
}
