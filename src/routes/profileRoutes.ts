import express, { NextFunction, Request, Response } from "express";
import { ApiUser } from "../models/apiUser";
const router = express.Router();
import axios from "axios";
import { Organisation } from "../models/dataModels";
import { sampleJobTitles } from "../mockData/jobTitles";
import { apiUser } from "../middleware/apiMiddleware";
const API = `${process.env.API_ENDPOINT}`;

router.get(
  "/",
  apiUser,
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/error");
    }
    let jobTitle = req.user.jobTitle;
    if (jobTitle) {
      jobTitle = sampleJobTitles[jobTitle].text;
    }
    res.render("profile.njk", {
      heading: "Authed",
      user: req.user,
      organisation: req.user.organisation?.title,
      jobTitle: jobTitle,
    });
  },
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === "UnauthorizedError") {
      res.render("error.njk", {
        messageBody: "Not authed",
      });
    } else {
      next(err);
    }
  },
);

router.get("/complete", apiUser, async (req: Request, res: Response) => {
  // If the authenticated user already has an organisation they can't set it again
  if (req.user.organisation) {
    return res.redirect("/profile");
  }

  const organisationsResponse = await axios.get(`${API}/organisations`);
  const organisations: Organisation[] = organisationsResponse.data;
  const templateOrgs = organisations.map((o) => ({
    value: o.slug,
    text: o.title,
  }));

  res.render("completeProfile.njk", {
    organisations: templateOrgs,
    jobTitles: Object.values(sampleJobTitles),
  });
});

router.post(
  "/complete",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await axios.put(
        `${API}/users/complete-profile`,
        { ...req.body },
        { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
      );
      const user: ApiUser = response.data;
      if (
        user.org?.slug === req.body.organisation &&
        user.jobTitle === req.body.jobTitle
      ) {
        return res.redirect("/profile");
      } else {
        throw new Error("Complete profile failed");
      }
    } catch (error) {
      console.error("Error completing user profile");
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data.detail);
      } else {
        console.error(error);
      }
      next(error);
    }
  },
);

export default router;
