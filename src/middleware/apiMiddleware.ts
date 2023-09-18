import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { ApiUser } from "../models/apiUser";

const API = `${process.env.API_ENDPOINT}`;

export const apiUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiUserResponse = await axios.get(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
    });
    const apiUser: ApiUser = apiUserResponse.data;
    req.user.user_id = apiUser.user_id;
    req.user.organisation = apiUser.org;
    req.user.jobTitle = apiUser.jobTitle;
    next();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
      );
      console.error(error.response?.data.detail);
    } else {
      console.error(error);
    }
    next(error);
  }
};
