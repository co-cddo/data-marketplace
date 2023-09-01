import express, { Request, Response } from "express";
import { DateStep } from "../types/express";
const router = express.Router();

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

router.get("/", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/manage-shares.njk", {
    backLink,
  });
});

router.get("/created-requests", async (req: Request, res: Response) => {
  const acquirerForms = req.session.acquirerForms || {};
  const backLink = req.headers.referer || "/";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const tableRows = [];

  for (const [key, formData] of Object.entries(acquirerForms)) {
    key === formData.requestId;
    let formattedDate = "Unrequested";
    const dateValue = formData.steps.date.value as DateStep;

    if (dateValue.day && dateValue.month && dateValue.year) {
      const monthIndex = dateValue.month - 1;
      const monthName = monthNames[monthIndex];
      formattedDate = `${dateValue.day} ${monthName} ${dateValue.year}`;
    }
    const row = [
      {
        html: `<a href="/acquirer/${formData.dataAsset}/start">${formData.requestId}</a>`,
      },
      { text: formData.assetTitle },
      { text: formData.ownedBy },
      { text: formattedDate },
      {
        html: `<span class="govuk-tag ${getStatusClass(formData.status)}">${
          formData.status
        }</span>`,
      },
    ];
    tableRows.push(row);
  }

  res.render("../views/supplier/created-requests.njk", {
    backLink,
    acquirerForms,
    getStatusClass,
    tableRows,
  });
});

router.get("/received-requests", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/received-requests.njk", {
    backLink,
  });
});

router.get("/review-request/", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const acquirerForms = req.session.acquirerForms || {};

  res.render("../views/supplier/review-request.njk", {
    backLink,
    acquirerForms,
  });
});

export default router;
