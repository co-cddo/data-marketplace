import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { fetchData } from "../services/findService";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // Use the referer as the backLink, defaulting to '/' if no referer is set
  const backLink = req.headers.referer || "/";
  // Extract the 'q' query parameter from the request, convert it to a string,
  // change it to lowercase for case insensitive search, and assign it to the 'query' variable.
  // If 'q' doesn't exist, assign 'undefined' to the 'query' variable.
  const query: string | undefined = (req.query.q as string)?.toLowerCase();
  const organisationFilter: string | undefined = req.query.organisationFilter as string | undefined;

  try {
    // Fetch the data from the API
    const { resources, uniqueOrganisations } = await fetchData(query, organisationFilter);

  // Map the uniqueOrganisations to the format required bytemplate
    const organisationsForTemplate = uniqueOrganisations.map(function(uniqueOrganisation) {
      return {
        value: uniqueOrganisation.id,
        text: uniqueOrganisation.title,
        attributes: {
          "id": uniqueOrganisation.id
        }
      };
    });

    res.render("find.njk", {
      route: req.params.page,
      backLink: backLink,
      resources: resources,
      uniqueOrganisations: organisationsForTemplate,
      query: query,
    });
  } catch (error) {
    // Catch errors if API call was unsuccessful and pass to error-handling middlewear
    next(error);
  }
});

export default router;
