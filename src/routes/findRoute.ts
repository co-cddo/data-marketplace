import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const backLink = req.headers.referer || '/'; // Use the referrer as the backLink, defaulting to '/' if no referrer is set
  res.render("find.njk", { route: req.params.page, backLink: backLink });
});

export default router;
