import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();

router.get("/:resourceID/start", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;
  const resource = await fetchResourceById(resourceID);
  console.log("Acquirer route - Resource ID:", resourceID);

  res.render("../views/partials/aquirer/acquirerStart.njk", {
    route: req.params.page,
    heading: "Acquirer Start",
    backLink: backLink,
    resource: resource,
    resourceID: resourceID,
  });
});

export default router;
