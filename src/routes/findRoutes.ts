import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import {
  fetchResources,
  fetchResourceById,
  fetchOrganisations,
} from "../services/findService";
import { themes } from "../mockData/themes";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const backLink = req.session.backLink || "/";
  req.session.backLink = req.originalUrl;
  const query: string | undefined = (req.query.q as string)?.toLowerCase();
  const organisationFilters: string[] | undefined = req.query
    .organisationFilters as string[] | undefined;
  const themeFilters: string[] | undefined = req.query.themeFilters as
    | string[]
    | undefined;

  try {
    // Fetch the data from the API
    const { resources } = await fetchResources(
      query,
      organisationFilters,
      themeFilters,
    );
    const organisations = await fetchOrganisations();
    const themesList = themes;
    const filterOptions = [
      // Define the shape of "filterOptions", add more as needed
      {
        id: "organisationFilters",
        name: "organisationFilters",
        title: "Organisations",
        items: organisations.map((org) => ({
          value: org.slug,
          text: org.title,
          abbreviation: org.abbreviation,
          web_url: org.web_url,
          checked:
            (Array.isArray(organisationFilters) &&
              organisationFilters.includes(org.slug)) ||
            (typeof organisationFilters === "string" &&
              organisationFilters === org.slug)
              ? "checked"
              : "",
        })),
      },
      {
        id: "themeFilters",
        name: "themeFilters",
        title: "Themes",
        items: themesList.map((theme) => ({
          value: theme,
          text: theme,
          checked:
            (Array.isArray(themeFilters) && themeFilters.includes(theme)) ||
            (typeof themeFilters === "string" && themeFilters === theme)
              ? "checked"
              : "",
        })),
      },
      // more filters here
    ];

    // Create filterOptionTags based on the selected filters in organisationFilters and themeFilters
    const filterOptionTags = [
      {
        id: "organisationFilters",
        title: "Organisations",
        items: organisations
          .filter((org) => organisationFilters?.includes(org.slug))
          .map((org) => ({
            value: org.slug,
            text: org.title,
            checked: "checked",
          })),
      },
      {
        id: "themeFilters",
        title: "Themes",
        items: themesList
          .filter((theme) => themeFilters?.includes(theme))
          .map((theme) => ({
            value: theme,
            text: theme,
            checked: "checked",
          })),
      },
      // more filters here
    ];

    const hasFilters = filterOptionTags.some(
      (category) => category.items.length > 0,
    );

    res.render("find.njk", {
      route: req.params.page,
      backLink: backLink,
      resources: resources,
      query: query,
      filterOptions,
      filterOptionTags: filterOptionTags,
      hasFilters: hasFilters,
    });
  } catch (error) {
    // Catch errors if API call was unsuccessful and pass to error-handling middlewear
    next(error);
  }
});

router.get("/:resourceID", async (req: Request, res: Response) => {
  const backLink = req.session.backLink || "/";
  req.session.backLink = req.originalUrl;
  const resourceID = req.params.resourceID;
  const resource = await fetchResourceById(resourceID);
  res.render("resource.njk", {
    route: req.params.page,
    backLink: backLink,
    resource: resource,
  });
});

export default router;
