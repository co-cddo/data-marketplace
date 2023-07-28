import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.render("page.njk", { route: req.params.page, heading: "Share journey" });
});

router.get("/start", (req: Request, res: Response) => {
  res.render("page.njk", {
    route: req.params.page,
    heading: "Start share journey",
  });
});

export default router;
