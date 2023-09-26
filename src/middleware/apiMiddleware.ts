import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { ApiUser } from "../models/apiUser";
import { ShareRequestResponse } from "../types/express";
import { formatDate } from "../helperFunctions/stringHelpers";

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

export const shareRequestDetailMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.params.requestId;
  if (!requestId) {
    return res.render("error.njk", {
      messageTitle: "Express Error",
      messageBody:
        "shareRequestDetail middleware was called on a request without a requestID path parameter.",
    });
  }
  try {
    const shareRequestDetailResponse = await axios.get(
      `${API}/manage-shares/received-requests/${requestId}`,
      {
        headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
      },
    );
    const shareRequestDetail =
      shareRequestDetailResponse.data as ShareRequestResponse;
    shareRequestDetail.received = formatDate(shareRequestDetail.received);
    shareRequestDetail.neededBy = formatDate(shareRequestDetail.neededBy);
    shareRequestDetail.decisionDate = formatDate(
      shareRequestDetail.decisionDate,
    );
    req.shareRequest = shareRequestDetail;
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
