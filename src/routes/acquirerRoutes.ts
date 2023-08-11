import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();

const formdata = [
  {
    "section": [
      {
        "name": "Purpose of the data share section",
        "questions": [
          { "name": "Data type", "link": "030-what-type-data-cat", "descriptionId": "", "status": "Not started"},
          { "name": "Data subjects", "link": "030-data-subjects-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Project aims", "link": "030-aims-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Data required", "link": "030-what-data-no-cat", "descriptionId": "read-declaration-status", "status": "Not started" },
          { "name": "Benefits", "link": "030-what-public-benefit-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Data access", "link": "030-others-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Impact if data not given", "link": "030-how-impact-cat", "descriptionId": "eligibility-status", "status": "Not started" },
          { "name": "Date required", "link": "030-when-need-cat", "descriptionId": "read-declaration-status", "status": "Not started" },
        ]
        },
        { 
          "name": "Legal power and gateway",
          "questions": [
          { "name": "Legal power", "link": "030-have-legal-power-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Legal gateway", "link": "030-legal-gateway-belief", "descriptionId": "", "status": "Not started" },
          { "name": "Legal review", "link": "#", "descriptionId": "", "status": "Cannot start yet" },
        ]
      },
      { 
        "name": "Legal power and gateway",
        "questions": [
          { "name": "Lawful basis", "link": "", "descriptionId": "", "status": "Cannot start yet" },
          { "name": "Data travel outside UK", "link": "030-geography-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Role of organisation", "link": "030-role-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Data protection review", "link": "#", "descriptionId": "", "status": "Cannot start yet" },
        ]
      },
      { 
        "name": "Legal power and gateway",
        "questions": [
          { "name": "Data delivery", "link": "030-how-receive-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Data format", "link": "030-prefered-format-cat", "descriptionId": "", "status": "Not started" },
          { "name": "Disposal of data", "link": "030-how-dispose-cat.html", "descriptionId": "", "status": "Not started" },
          { "name": "Data security review", "link": "#", "descriptionId": "", "status": "Cannot start yet" },
        ]
      },
      {
      "name": "Legal power and gateway",
      "questions": [
          { "name": "Check answers", "link": "", "descriptionId": "submit-pay-status", "status": "Cannot start yet" }
      ]
      }
    ]
  }
]

router.get("/:resourceID/start", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;

  try {
    const resource = await fetchResourceById(resourceID);
    if (!resource) {
      res.status(404).send("Resource not found");
      return;
    }
    res.render("../views/partials/acquirer/acquirerStart.njk", {
      route: req.params.page,
      heading: "Acquirer Start",
      backLink: backLink,
      resource: resource,
      resourceID: resourceID,
      formdata: formdata
    });
  } catch (error) {
    console.error("An error occurred while fetching data from the API:", error);
    res.status(500).send("An error occurred while fetching data from the API");
  }
});

export default router;
