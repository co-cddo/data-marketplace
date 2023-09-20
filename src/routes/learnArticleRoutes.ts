import express, { Request, Response } from "express";
const router = express.Router();


router.get("/glossary", async (req: Request, res: Response) => {
  res.render("../views/learn/glossary.njk");
});

router.get(
  "/data-sharing-arrangements",
  async (req: Request, res: Response) => {
    res.render("../views/learn/data-sharing-arrangements.njk");
  },
);

router.get("/data-sharing-questions", async (req: Request, res: Response) => {
  res.render("../views/learn/data-sharing-questions.njk");
});

router.get(
  "/publish-data-descriptions-questions",
  async (req: Request, res: Response) => {
    res.render("../views/learn/publish-data-descriptions-questions.njk");
  },
);

router.get(
  "/adding-a-single-data-asset",
  async (req: Request, res: Response) => {
    res.render("../views/learn/adding-a-single-data-asset.njk");
  },
);

router.get("/guidance-on-publish", async (req: Request, res: Response) => {
  res.render("../views/learn/guidance-on-publish.njk");
});

router.get("/metadata-model", async (req: Request, res: Response) => {
  res.render("../views/learn/metadata-model.njk");
});

router.get("/adding-a-CSV-file", async (req: Request, res: Response) => {
  res.render("../views/learn/adding-a-CSV-file.njk");
});

export default router;