import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.render("resources.njk", { resourceID: "None" });
});

router.get("/:resourceID", (req: Request, res: Response) => {
  res.render("resources.njk", { resourceID: req.params.resourceID });
});
export default router;
