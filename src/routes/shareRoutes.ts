import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();

router.get("/:resourceID/acquirer", async (req: Request, res: Response) => {
  const backLink = req.session.backLink || "/";
  req.session.backLink = req.originalUrl;
  const resourceID = req.params.resourceID;
  const resource = await fetchResourceById(resourceID);
  res.render("share.njk", {
    route: req.params.page,
    heading: "Share journey",
    backLink: backLink,
    resource: resource,
    resourceID: resourceID,
  });
});

export default router;
