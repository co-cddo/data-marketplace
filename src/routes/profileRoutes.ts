import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import { authenticateJWT } from "../middleware/authMiddleware";
import axios from "axios";

const URL = `${process.env.API_ENDPOINT}/user`

router.get(
  "/",
  authenticateJWT,
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/error");
    }

    try {
      const response = await axios.put(URL, { token: req.cookies.jwtToken })
      console.log(response)
    } catch (error) {
      console.log("USER API ERROR")
      console.log(error)
    }
    res.render("profile.njk", {
      heading: "Authed",
      user: req.user,
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
