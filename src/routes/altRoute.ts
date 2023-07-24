import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.render("page.njk", { route: req.params.page });
});
export default router;
