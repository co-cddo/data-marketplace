import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json"
import { randomUUID } from "crypto";
import { extractFormData, validateRequestBody } from "../helperFunctions/helperFunctions";
function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const generateFormTemplate = (req: Request, resourceID: string, assetTitle: string) => {
  const userInfo = req.user ? parseJwt(req.user.idToken) : null;
  const username = userInfo ? userInfo.email : 'anonymous';
  const template = JSON.parse(JSON.stringify(formTemplate));
  template.ownedBy = username;
  template.dataAsset = resourceID;
  template.requestId = randomUUID();
  template.assetTitle = assetTitle;
  return template;
}

router.get("/:resourceID/start", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceID = req.params.resourceID;

  try {
    const resource = await fetchResourceById(resourceID);
   
    if (!resource) {
      res.status(404).send("Resource not found");
      return;
    }
    const assetTitle = resource.title;
    // Generate a new set of form data if there wasn't one already in the session
    req.session.acquirerForms = req.session.acquirerForms || {};
    req.session.acquirerForms[resourceID] = req.session.acquirerForms?.[resourceID] || generateFormTemplate(req, resourceID, assetTitle);

    res.render("../views/acquirer/start.njk", {
      route: req.params.page,
      heading: "Acquirer Start",
      backLink: backLink,
      resource: resource,
      assetTitle,
      resourceID: resourceID,
      formdata: req.session.acquirerForms[resourceID]
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
  const assetTitle = formdata.assetTitle

  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    assetTitle,
    stepId: formStep,
    savedValue: stepData.value,
    errorMessage: stepData.errorMessage
  })

});

router.post("/:resourceID/:step", async (req: Request, res: Response) => {
  if (!req.session.acquirerForms) {
    return res.status(400).send("Acquirer forms not found in session");
  }

  const resourceID = req.params.resourceID;
  const formStep = req.params.step;
  const formdata = req.session.acquirerForms[resourceID];
  const stepData = formdata.steps[formStep];
  const errorMessage = validateRequestBody(formStep, req.body);
  stepData.errorMessage = errorMessage;

  if (!formdata || !formdata.steps[formStep]) {
    return res.status(400).send("Form data or step not found");
  }

  if (!stepData) {
    return res.status(400).send("Step data not found");
  }

  if (errorMessage) {
    return res.redirect(`/acquirer/${resourceID}/${formStep}`)
  }

  // Check which button was clicked "Save and continue || Save and return"
  if (req.body.returnButton) {
    stepData.value = extractFormData(stepData, req.body) || "";
    stepData.status = "IN PROGRESS";
    return res.redirect(`/acquirer/${resourceID}/start`);
  }

  stepData.value = extractFormData(stepData, req.body) || "";
  stepData.status = "COMPLETED";

  if (formdata.steps[formStep].nextStep) {
    return res.redirect(`/acquirer/${resourceID}/${formdata.steps[formStep].nextStep}`);
  } else {
    // Handle case when nextStep is not defined
    return res.redirect(`/acquirer/${resourceID}/start`);
  }
});

export default router;
