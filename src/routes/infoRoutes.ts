import express, { Request, Response } from "express";
const router = express.Router();

router.get("/cookies", (req: Request, res: Response) => {
  res.render("cookies.njk", { route: "Cookies" });
});

router.get("/privacy", (req: Request, res: Response) => {
  res.render("privacy.njk", { route: "Privacy" });
});

export default router;
