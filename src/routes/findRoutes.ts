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
  const organisationFilters: string[] | undefined = req.query.organisationFilters as string[] | undefined;

  try {
    // Fetch the data from the API

    const { resources } = await fetchResources(
      query,
      organisationFilters,
    );

    console.log("QUERY", organisationFilters);
    // console.log("type query",typeFilters)

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
      // more filters here
    ];

     // Create filterOptionTags based on the selected filters in organisationFilters
     const filterOptionTags = [
      {
      id: "organisationFilters",
      title: "Organisations",
      items: organisations
        .filter((org) => organisationFilters?.includes(org.id))
        .map((org) => ({
          value: org.id,
          text: org.title,
          checked: "checked",
        })),
     }
     // more filters here
    ]


    console.log("checkboxFilterOptions", filterOptionTags);

    res.render("find.njk", {
      route: req.params.page,
      backLink: backLink,
      resources: resources,
      query: query,
      filterOptions,
      filterOptionTags: filterOptionTags
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
