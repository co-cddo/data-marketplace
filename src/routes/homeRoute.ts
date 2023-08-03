import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  // console.log("AM I AUTHED?", await req.isAuthenticated);
  // console.log(req.session);
  res.render("home.njk", { route: "home" });
});

export default router;
