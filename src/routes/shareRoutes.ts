import express, { Request, Response } from "express";
const router = express.Router();

router.get("/acquirer", (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("share.njk", {
    route: req.params.page,
    heading: "Share journey",
    backLink: backLink,
  });
});

router.get("/start", (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("page.njk", {
    route: req.params.page,
    heading: "Start share journey",
    backLink: backLink,
  });
});

export default router;
