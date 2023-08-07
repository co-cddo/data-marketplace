import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { fetchResources, fetchResourceById } from "../services/findService";
import { organisations } from "../mockData/organisations";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // Use the referer as the backLink, defaulting to '/' if no referer is set
  const backLink = req.headers.referer || "/";
  // Extract the 'q' query parameter from the request, convert it to a string,
  // change it to lowercase for case insensitive search, and assign it to the 'query' variable.
  // If 'q' doesn't exist, assign 'undefined' to the 'query' variable.
  const query: string | undefined = (req.query.q as string)?.toLowerCase();
  const organisationFilters: string[] | undefined = req.query
    .organisationFilters as string[] | undefined;

  const typeFilters: string[] | undefined = req.query.typeFilter
    ? (req.query.typeFilter as string).split(",")
    : undefined;

  try {
    // Fetch the data from the API
    console.log("QUERY", organisationFilters);
    const { resources, uniqueTypes } = await fetchResources(
      query,
      organisationFilters,
      typeFilters,
    );

    const filterOptions = [
      // Define the shape of "filterOptions", add more as needed
      {
        id: "organisationFilters",
        name: "organisationFilters",
        title: "Organisations",
        items: organisations.map((org) => ({
          value: org.id,
          text: org.title,
          acronym: org.acronym,
          homepage: org.homepage,
          checked:
            (Array.isArray(organisationFilters) &&
              organisationFilters.includes(org.id)) ||
            (typeof organisationFilters === "string" &&
              organisationFilters === org.id)
              ? "checked"
              : "",
        })),
      },
      {
        id: "typeFilters",
        name: "typeFilters",
        title: "Types",
        items: uniqueTypes.map((type) => ({
          value: type,
          text: type,
        })),
      },
    ];

    console.log("filterOptions", filterOptions);

    res.render("find.njk", {
      route: req.params.page,
      backLink: backLink,
      resources: resources,
      filterOptions, // filterOptions being passed here
      query: query,
    });
  } catch (error) {
    // Catch errors if API call was unsuccessful and pass to error-handling middlewear
    next(error);
  }
});

router.get("/:resourceID", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;
  const resource = await fetchResourceById(resourceID);
  res.render("resource.njk", {
    route: req.params.page,
    backLink: backLink,
    resource: resource,
  });
});

export default router;
