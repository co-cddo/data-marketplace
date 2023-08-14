import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json"
import { randomUUID } from "crypto";

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const generateFormTemplate = (req: Request, resourceID: string) => {
  const userInfo = req.user ? parseJwt(req.user.idToken) : null;
  const username = userInfo ? userInfo.email : 'anonymous';
  const template = JSON.parse(JSON.stringify(formTemplate));
  template.ownedBy = username;
  template.dataAsset = resourceID;
  template.requestId = randomUUID();
  return template;
}


router.get("/:resourceID/start", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;

  req.session.acquirerForms = req.session.acquirerForms || {};
  const formData = req.session.acquirerForms?.[resourceID] || generateFormTemplate(req, resourceID);
  try {
    const resource = await fetchResourceById(resourceID);
    if (!resource) {
      res.status(404).send("Resource not found");
      return;
    }
    req.session.acquirerForms[resourceID] = formData;
    res.render("../views/acquirer/start.njk", {
      route: req.params.page,
      heading: "Acquirer Start",
      backLink: backLink,
      resource: resource,
      resourceID: resourceID,
      formdata: formData
    });
  } catch (error) {
    console.error("An error occurred while fetching data from the API:", error);
    res.status(500).send("An error occurred while fetching data from the API");
  }
});

router.get("/:resourceID/:step", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const formStep = req.params.step

  if (!req.session.acquirerForms?.[resourceID]) {
    return res.redirect(`/share/${resourceID}/acquirer`)
  }

  const formdata = req.session.acquirerForms[resourceID]
  const stepData = formdata.steps[formStep]
  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    stepId: formStep,
    savedValue: stepData.value,
  })
});

router.post("/:resourceID/:step", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const formStep = req.params.step
  const formdata = req.session.acquirerForms[resourceID];
  const stepData = formdata.steps[formStep];

  // TODO Properly update the form data with the POST-ed values
  stepData.value = req.body['data-type'];
  stepData.status = "COMPLETED"

  return res.redirect(`/acquirer/${resourceID}/${formdata.steps[formStep].nextStep}`)
});

export default router;