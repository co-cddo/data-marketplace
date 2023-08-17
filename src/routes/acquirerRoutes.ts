import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json"
import { randomUUID } from "crypto";
import { Step } from "../types/express";

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
interface RequestBody {
  [key: string]: string | undefined;
}

const extractFormData = (stepData: Step, body: RequestBody ) => {
  // Return something that will get set in the 'value' key of the form step
  // Will need to something different depending on whether the input is a radio button
  //  or text field or checkbox etc.
  // All simple radio button-style forms:
  // (As long as the radio group has a name the same as the step id

  const radioFields = ['data-type', 'data-access'];
  if (radioFields.includes(stepData.id)) {
    return body[stepData.id]
  }

  const textFields = ['data-required']; // add step names here if using textarea

  if (stepData.id === 'project-aims') {
    return {
      aims: body['aims'] || '',
      explanation: body['explanation'] || ''
    };
  } else {
    if (textFields.includes(stepData.id)) {
      return body[stepData.id]
    } 
  }

  if (stepData.id === 'date') {
    return {
      day: body.day || null,
      month: body.month || null,
      year: body.year || null
    };
  }

  if(stepData.id === 'benefits') {
    return {
      'decision-making': {explanation: body['decision-making'], checked: body['benefits']?.includes('decision-making') },
      'service-delivery': {explanation: body['service-delivery'], checked: body['benefits']?.includes('service-delivery')},
      'benefit-people': {explanation: body['benefit-people'], checked: body['benefits']?.includes('benefit-people')},
      'allocate-and-evaluate-funding': {explanation: body['allocate-and-evaluate-funding'], checked: body['benefits']?.includes('allocate-and-evaluate-funding')},
      'social-economic-trends': {explanation: body['social-economic-trends'], checked: body['benefits']?.includes('social-economic-trends')},
      'needs-of-the-public': {explanation: body['needs-of-the-public'], checked: body['benefits']?.includes('needs-of-the-public')},
      'statistical-information': {explanation: body['statistical-information'], checked: body['benefits']?.includes('statistical-information')},
      'existing-research-or-statistics': {explanation: body['existing-research-or-statistics'], checked: body['benefits']?.includes('existing-research-or-statistics')},
      'something-else': {explanation: body['something-else'], checked: body['benefits']?.includes('something-else')},
    }
  }

  // Other input types can go here
  return
}

function isValidDate(day: string, month: string, year: string): boolean {
  // If all fields are empty, consider it valid since the date is optional
  if (!day && !month && !year) return true;

  // Ensure day, month, year are numbers
  if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) return false;

  const d = Number(day);
  const m = Number(month) - 1; // Month is 0-indexed (0 for January, 11 for December)
  const y = Number(year);
  // Use the Date object to create a date
  const date = new Date(y, m, d);

  // Validate if the created date matches the input values
  return date && date.getMonth() === m && date.getDate() === d && date.getFullYear() === y;
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

  const { day, month, year } = req.body;

    if(!isValidDate(day, month, year)) {
        res.render(`../views/acquirer/${formStep}.njk`, {
            errorMessage: "Please enter a valid date."
            // could add specific input field validation messages e.g: "Please enter valid Year"
        });
      return;
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
