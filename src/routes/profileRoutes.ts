import express, { NextFunction, Request, Response } from "express";
import { ApiUser } from "../models/apiUser";
import axios from "axios";
import { Organisation } from "../models/dataModels";
import { apiUser } from "../middleware/apiMiddleware";
import { ShareRequestTable } from "../types/express";

const router = express.Router();
const API = `${process.env.API_ENDPOINT}`;

router.get(
  "/",
  apiUser,
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/error");
    }

    const profileTableRows: ShareRequestTable = [
      [
        { text: "Name", classes: "govuk-!-width-one-quarter" },
        { text: req.user.display_name },
      ],
      [
        { text: "Email", classes: "govuk-!-width-one-quarter" },
        { text: req.user.email },
      ],
    ];

    if (req.user.organisation) {
      profileTableRows.push([
        { text: "Organisation", classes: "govuk-!-width-one-quarter" },
        { text: req.user.organisation.title },
      ]);
      profileTableRows.push([
        { text: "Primary skill", classes: "govuk-!-width-one-quarter" },
        { text: req.user.jobTitle! },
      ]);

      const permissions = req.user.permission.map(
        (p) => `<span class=govuk-tag>${p}</span>`,
      );
      const permissionsRow =
        permissions.length > 0 ? permissions.join(" ") : "None";
      profileTableRows.push([
        { text: "Permissions", classes: "govuk-!-width-one-quarter" },
        { html: permissionsRow },
      ]);
    }

    res.render("profile.njk", {
      profileTableRows,
      needsToComplete: !req.user.organisation,
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
    selected: req.session.profileData?.organisation === o.slug,
  }));

  templateOrgs.unshift({
    value: "please-select",
    text: "Please select",
    selected: !req.session.profileData?.organisation,
  });

  res.render("completeProfile.njk", {
    organisations: templateOrgs,
    selectedJob: req.session.profileData?.jobTitle,
    otherJobTitle: req.session.profileData?.otherJobTitle,
    errorMessage: req.session.profileErrors,
  });
});

router.post(
  "/complete",
  async (req: Request, res: Response, next: NextFunction) => {
    let jobTitle = req.body.jobTitle;
    let otherJobTitle = false;
    if (jobTitle === "other") {
      jobTitle = req.body.other;
      otherJobTitle = true;
    }

    const profileErrors: { [key: string]: { text: string } } = {};
    const formData: { jobTitle?: string; organisation?: string } = {};

    if (!jobTitle) {
      profileErrors["jobTitle"] = { text: "Please select a primary skill" };
    } else {
      formData["jobTitle"] = jobTitle;
    }

    if (req.body.organisation === "please-select") {
      profileErrors["organisation"] = { text: "Please select an organisation" };
    } else {
      formData["organisation"] = req.body.organisation;
    }

    if (Object.keys(profileErrors).length > 0) {
      req.session.profileErrors = profileErrors;
      req.session.profileData = { ...formData, otherJobTitle: otherJobTitle };
      return res.redirect("/profile/complete");
    }

    try {
      const response = await axios.put(
        `${API}/users/complete-profile`,
        {
          organisation: req.body.organisation,
          jobTitle,
        },
        { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
      );

      const user: ApiUser = response.data;

      if (
        user.org?.slug === req.body.organisation &&
        user.jobTitle === jobTitle
      ) {
        const returnTo = req.session.returnTo || "/profile";
        delete req.session.returnTo;
        return res.redirect(returnTo);
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
