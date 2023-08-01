import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { fetchData, fetchResource } from "../services/findService";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // Use the referer as the backLink, defaulting to '/' if no referer is set
  const backLink = req.headers.referer || "/";
  // Extract the 'q' query parameter from the request, convert it to a string,
  // change it to lowercase for case insensitive search, and assign it to the 'query' variable.
  // If 'q' doesn't exist, assign 'undefined' to the 'query' variable.
  const query: string | undefined = (req.query.q as string)?.toLowerCase();

  try {
    // Fetch the data from the API
    const resources = await fetchData(query);
    res.render("find.njk", {
      route: req.params.page,
      backLink: backLink,
      resources: resources,
      query: query,
    });
  } catch (error) {
    // Catch errors if API call was unsuccessful and pass to error-handling middlewear
    next(error);
  }
});

router.get("/:resourceID", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const resource = await fetchResource(resourceID);
  res.render("resources.njk", { resource });
});

export default router;
