import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import passport from "passport";

router.get(
  "/",
  passport.authenticate("custom-sso"),
  (req: Request, res: Response, next: NextFunction) => {
    res.cookie("jwtToken", false, { httpOnly: true });
    next();
  },
);

export default router;
