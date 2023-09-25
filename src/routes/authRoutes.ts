import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import passport from "passport";
import axios from "axios";
const apiLoginUrl = `${process.env.API_ENDPOINT}/login`;

router.get(
  "/callback",
  passport.authenticate("custom-sso", { session: false }),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.redirect("/");
    } else {
      req.logIn(req.user, async (loginErr) => {
        if (loginErr) {
          res.redirect("/");
        }
        const returnTo = req.cookies.returnTo || "/profile";
        res.clearCookie("returnTo");

        const jwt = req.user.idToken;
        res.cookie("jwtToken", jwt, { httpOnly: true });

        let response;
        try {
          response = await axios.get(apiLoginUrl, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const acquirerForms = response.data["sharedata"] || {};
          req.session.acquirerForms = acquirerForms;
        } catch (error) {
          console.error("Error logging into API");
          if (axios.isAxiosError(error)) {
            console.error(error.response?.data.detail);
          } else {
            console.error(error);
          }
          next(error);
        }

        if (response?.data.new_user) {
          req.session.returnTo = returnTo
          return res.redirect("/profile/complete");
        }

        res.redirect(returnTo);
      });
    }
  },
);

export default router;
