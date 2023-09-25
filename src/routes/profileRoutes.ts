import express, { NextFunction, Request, Response } from "express";
import { ApiUser } from "../models/apiUser";
import axios from "axios";
import { Organisation } from "../models/dataModels";
import { apiUser } from "../middleware/apiMiddleware";

const router = express.Router();
const API = `${process.env.API_ENDPOINT}`;

router.get(
  "/",
  apiUser,
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/error");
    }
    let jobTitle = req.user.jobTitle;

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

router.get("/complete", apiUser, async (req: Request, res: Response, next: NextFunction) => {
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
    organisations: templateOrgs
  });
});

router.post(
  "/complete",
  async (req: Request, res: Response, next: NextFunction) => {

    let jobTitle = req.body.jobTitle;
    if (jobTitle === 'other') {
      jobTitle = req.body.other
    }

    try {
      const response = await axios.put(
        `${API}/users/complete-profile`,
        {
          organisation: req.body.organisation,
          jobTitle
        },
        { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
      );
      const user: ApiUser = response.data;
      if (
        user.org?.slug === req.body.organisation &&
        user.jobTitle === jobTitle
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
