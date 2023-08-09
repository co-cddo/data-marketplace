import express, { Request, Response } from "express";
const router = express.Router();
import passport from "passport";

router.get(
  "/callback",
  passport.authenticate("custom-sso", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.redirect("/");
    } else {
      req.logIn(req.user, (loginErr) => {
        if (loginErr) {
          res.redirect("/");
        }

        res.cookie("jwtToken", req.user.idToken, { httpOnly: true });

        res.redirect("/profile");
      });
    }
  },
);

export default router;
