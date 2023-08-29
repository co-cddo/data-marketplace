import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/manage-shares.njk", {
    backLink,
  });
});

router.get("/created-requests", async (req: Request, res: Response) => {
  const acquirerForms = req.session.acquirerForms || {};
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/created-requests.njk", {
    backLink,
    acquirerForms,
    getStatusClass
  });
});

// Function to get the tag class based on the status value
function getStatusClass(status: string): string {
  switch (status) {
    case "NOT STARTED":
      return "govuk-tag--grey";
    case "IN PROGRESS":
      return "govuk-tag--blue";
    case "RETURNED":
      return "govuk-tag--red";
    default:
      return "govuk-tag--grey";
  }
}

export default router;
