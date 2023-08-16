import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import passport from "passport";
router.get(
  "/login",
  passport.authenticate("custom-sso"),
  (req: Request, res: Response, next: NextFunction) => {
    res.cookie("jwtToken", false, { httpOnly: true });
    next();
  },
);

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("jwtToken");
    res.redirect("/");
  });
});

export default router;
