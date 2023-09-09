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
        const returnTo = req.cookies.returnTo || "/profile";
        res.clearCookie("returnTo");

        res.cookie("jwtToken", req.user.idToken, { httpOnly: true });
        res.redirect(returnTo);
      });
    }
  },
);

export default router;
