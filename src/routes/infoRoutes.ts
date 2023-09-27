import express, { Request, Response } from "express";
const router = express.Router();

router.get("/cookies", (req: Request, res: Response) => {
    res.render("cookies.njk", { route: "Cookies" });
  })

  // add Accessibility and Privacy

  export default router;