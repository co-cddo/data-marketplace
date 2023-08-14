import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json"
import { randomUUID } from "crypto";
import { Step } from "../types/express";

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
interface RequestBody {
  [key: string]: string | undefined;
}

const extractFormData = (stepData: Step, body: RequestBody ) => {
  // Return something that will get set in the 'value' key of the form step
  // Will need to something different depending on whether the input is a radio button
  //  or text field or checkbox etc.

  // All simple radio button-style forms:
  // (As long as the radio group has a name the same as the step id)
  const radioFields = ['data-type', 'data-access'];
  if (radioFields.includes(stepData.id)) {
    return body[stepData.id]
  }

  if (stepData.id === 'project-aims') {
    return {
      aims: body['aims'] || '',
      explanation: body['explanation'] || ''
    };
  }

  const textFields = ['project-aims'];
  if (textFields.includes(stepData.id)) {
      return body[stepData.id]
  }

  // Other input types can go here
  return
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

    // Generate a new set of form data if there wasn't one already in the session
    req.session.acquirerForms = req.session.acquirerForms || {};
    req.session.acquirerForms[resourceID] = req.session.acquirerForms?.[resourceID] || generateFormTemplate(req, resourceID);

    res.render("../views/acquirer/start.njk", {
      route: req.params.page,
      heading: "Acquirer Start",
      backLink: backLink,
      resource: resource,
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
  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    stepId: formStep,
    savedValue: stepData.value,
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

    if (!formdata || !formdata.steps[formStep]) {
      return res.status(400).send("Form data or step not found");
    }
  
    if (!stepData) {
      return res.status(400).send("Step data not found");
    }
  
    stepData.value = extractFormData(stepData, req.body) || "";
    stepData.status = "COMPLETED";
  
    console.log("Updated stepData:", stepData);
  
    if (formdata.steps[formStep].nextStep) {
      return res.redirect(`/acquirer/${resourceID}/${formdata.steps[formStep].nextStep}`);
    } else {
      // Handle case when nextStep is not defined
      return res.redirect(`/acquirer/${resourceID}/some-default-route`);
    }
  });

export default router;
