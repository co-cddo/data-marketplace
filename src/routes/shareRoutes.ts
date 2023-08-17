import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();

router.get("/:resourceID/acquirer", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;
  const resource = await fetchResourceById(resourceID);
  console.log("Share route - Resource ID:", resourceID);
  res.render("share.njk", {
    route: req.params.page,
    heading: "Share journey",
    backLink: backLink,
    resource: resource,
    resourceID: resourceID,
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
