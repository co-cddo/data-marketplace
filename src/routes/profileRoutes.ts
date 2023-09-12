import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import axios from "axios";

const URL = `${process.env.API_ENDPOINT}/login`;

router.get(
  "/",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/error");
    }

    let requestForms = {};
    try {
      const response = await axios.get(URL, { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } });
      requestForms = response.data["sharedata"] || {};
      req.session.acquirerForms = requestForms;
    } catch (error) {
      console.error("Error getting Share Data from backend:");
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data.detail);
      } else {
        console.error(error);
      }
    }
    res.render("profile.njk", {
      heading: "Authed",
      user: req.user,
      requestForms: requestForms,
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

export default router;
