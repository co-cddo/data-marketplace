import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json";
import { randomUUID } from "crypto";
import {
  extractFormData,
  validateRequestBody,
} from "../helperFunctions/helperFunctions";
import {
  DataTypeStep,
  FormData,
  LawfulBasisSpecialStep,
  LegalGatewayStep,
  LegalPowerStep,
  StepValue,
} from "../types/express";

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

const generateFormTemplate = (
  req: Request,
  resourceID: string,
  assetTitle: string,
) => {
  const userInfo = req.user ? parseJwt(req.user.idToken) : null;
  const username = userInfo ? userInfo.email : "anonymous";
  const template = JSON.parse(JSON.stringify(formTemplate));
  template.ownedBy = username;
  template.dataAsset = resourceID;
  template.requestId = randomUUID();
  template.assetTitle = assetTitle;
  return template;
};

const allStepsCompleted = (steps: string[], formdata: FormData) => {
  return steps.every((step) =>
    ["COMPLETED", "NOT REQUIRED"].includes(formdata.steps[step].status),
  )
}

const updateStepsStatus = (
  currentStep: string,
  stepValue: StepValue,
  formdata: FormData,
) => {
  const dataProtectionSteps = [
    "lawful-basis-personal",
    "lawful-basis-special",
    "lawful-basis-special-public-interest",
    "data-travel",
    "data-travel-location",
    "role",
  ];

  const securitySteps = ["delivery", "format", "disposal"];

  // Assume that if we're at this point then then current step has been
  //  completed successfully.
  // Any validation should happen before this function is called.
  formdata.steps[currentStep].status = "COMPLETED";

  if (currentStep === "data-type") {
    // Grab all of the step names so we can set (most of) them to "Not Started".
    const allSteps = new Set(Object.keys(formdata.steps));
    allSteps.delete("data-type");

    // The following steps need to stay at their default status until other steps have been completed:
    [
      "legal-review",
      "lawful-basis-special-public-interest",
      "protection-review",
      "security-review",
      "check",
    ].forEach((s) => allSteps.delete(s));

    // Figure out which steps need to be set to "Not Required"
    let notRequiredSteps = new Set<string>();
    const val = stepValue as DataTypeStep;
    // If personal is not checked then lawful-basis-personal is not required
    if (!val.personal.checked) {
      notRequiredSteps.add("lawful-basis-personal");
    }
    // If special is not checked then lawful-basis-special is not required
    if (!val.special.checked) {
      notRequiredSteps.add("lawful-basis-special");
      notRequiredSteps.add("lawful-basis-special-public-interest");
    }
    // If none is checked, a few other steps are not required
    if (val.none.checked) {
      [
        "data-subjects",
        "lawful-basis-personal",
        "lawful-basis-special",
        "lawful-basis-special-public-interest",
        "role",
      ].forEach((s) => notRequiredSteps.add(s));
    }

    // Remove the "not required" steps from the full list of steps
    //  to get the ones that need to be set to "not started"
    const notStartedSteps = new Set(
      [...allSteps].filter((x) => !notRequiredSteps.has(x)),
    );

    for (const s of notRequiredSteps) {
      formdata.steps[s].status = "NOT REQUIRED";
    }

    for (const s of notStartedSteps) {
      const stepStatus = formdata.steps[s].status;
      if (stepStatus === "COMPLETED" || stepStatus === "IN PROGRESS") {
        continue;
      }
      formdata.steps[s].status = "NOT STARTED";
    }
  }

  if (currentStep === "data-access") {
    if (stepValue === "no") {
      formdata.steps["other-orgs"].status = "NOT REQUIRED";
    }
  }

  if (currentStep === "legal-power") {
    if ((stepValue as LegalPowerStep).yes.checked) {
      formdata.steps["legal-power-advice"].status = "NOT REQUIRED";
    }
    // If legal gateway has already been completed, set legal-review to NOT STARTED
    if (formdata.steps["legal-gateway"].status === "COMPLETED") {
      formdata.steps["legal-review"].status = "NOT STARTED";
    }
  }

  if (currentStep === "legal-gateway") {
    const legalGatewayStep = stepValue as LegalGatewayStep;
    if (legalGatewayStep.yes.checked || legalGatewayStep.other.checked) {
      formdata.steps["legal-gateway-advice"].status = "NOT REQUIRED";
    }
    // If legal power has already been completed, set legal-review to NOT STARTED
    if (formdata.steps["legal-power"].status === "COMPLETED") {
      formdata.steps["legal-review"].status = "NOT STARTED";
    }
  }

  if (currentStep === "lawful-basis-special") {
    if (
      (stepValue as LawfulBasisSpecialStep)["reasons-of-public-interest"]
        ?.checked
    ) {
      formdata.steps["lawful-basis-special-public-interest"].status =
        "NOT STARTED";
    } else {
      formdata.steps["lawful-basis-special-public-interest"].status =
        "NOT REQUIRED";
    }
  }

  if (currentStep === "data-travel-location") {
    formdata.steps["data-travel"].status = "COMPLETED";
  }

  if (currentStep === "data-travel") {
    if (stepValue === "no") {
      formdata.steps["data-travel-location"].status = "NOT REQUIRED";
    } else {
      formdata.steps["data-travel-location"].status = "NOT STARTED";
      formdata.steps[currentStep].status = "IN PROGRESS";
    }
  }

  if (dataProtectionSteps.includes(currentStep)) {
    if (allStepsCompleted(dataProtectionSteps, formdata)) {
      formdata.steps["protection-review"].status = "NOT STARTED";
    } else {
      formdata.steps["protection-review"].status = "CANNOT START YET";
    }
  }

  if (securitySteps.includes(currentStep)) {
    if (allStepsCompleted(securitySteps, formdata)) {
      formdata.steps["security-review"].status = "NOT STARTED";
    } else {
      formdata.steps["security-review"].status = "CANNOT START YET";
    }
  }

  // If every other step is COMPLETED or NOT REQUIRED, set the
  //  check step to NOT STARTED.
  const allSteps = new Set(Object.keys(formdata.steps))
  allSteps.delete("check")
  if (allStepsCompleted([...allSteps], formdata)) {
    formdata.steps["check"].status = "NOT STARTED"
  }
};

const skipThisStep = (step: string, formdata: FormData) => {
  // Decide whether to skip the current step based on answers in previous steps
  // Returns false (doesn't skip any steps) by default, so only hidden steps or
  // ones that might need to be skipped in some circumstances need to be added to
  // switch/case statement.

  switch (step) {
    case "data-subjects": {
      // Skip data-subjects if the data-type is "none" i.e. anonymised
      const DataTypeStep = formdata.steps["data-type"].value as DataTypeStep;
      return DataTypeStep.none.checked;
    }
    case "other-orgs": {
      // Skip other-orgs if the answer to data-access was "no"
      return formdata.steps["data-access"].value === "no";
    }
    case "legal-power-advice": {
      // Skip legal-power-advice if the answer to legal-power was "Yes"
      const legalPowerStep = formdata.steps["legal-power"]
        .value as LegalPowerStep;
      return legalPowerStep.yes.checked;
    }
    case "legal-gateway-advice": {
      // Skip legal-gateway-advice if the answer to legal-gateway was "yes" or "other"
      const legalGatewayStep = formdata.steps["legal-gateway"]
        .value as LegalGatewayStep;
      return legalGatewayStep.yes.checked || legalGatewayStep.other.checked;
    }
    case "role": {
      const data = formdata.steps["data-type"].value as DataTypeStep;
      return (
        data.none.checked ||
        (data.personal.checked === undefined &&
          data.special.checked === undefined)
      );
    }
    case "lawful-basis-personal": {
      const data = formdata.steps["data-type"].value as DataTypeStep;
      return (
        data.personal.checked === false || data.personal.checked === undefined
      );
    }
    case "lawful-basis-special": {
      const data = formdata.steps["data-type"].value as DataTypeStep;
      return (
        data.special.checked === false || data.special.checked === undefined
      );
    }
    case "lawful-basis-special-public-interest": {
      const data = formdata.steps["lawful-basis-special"]
        .value as LawfulBasisSpecialStep;
      return (
        data["reasons-of-public-interest"]?.checked === false ||
        data["reasons-of-public-interest"]?.checked === undefined
      );
    }
    case "data-travel-location": {
      return (
        formdata.steps["data-travel"].value === "no" ||
        formdata.steps["data-travel"].value === ""
      );
    }
    default: {
      return false;
    }
  }
};

router.get("/:resourceID/start", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const backLink = req.headers.referer || `/share/${resourceID}/acquirer`;

  try {
    const resource = await fetchResourceById(resourceID);

    if (!resource) {
      res.status(404).send("Resource not found");
      return;
    }
    const assetTitle = resource.title;
    // Generate a new set of form data if there wasn't one already in the session
    req.session.acquirerForms = req.session.acquirerForms || {};
    req.session.acquirerForms[resourceID] =
      req.session.acquirerForms?.[resourceID] ||
      generateFormTemplate(req, resourceID, assetTitle);

    res.render("../views/acquirer/start.njk", {
      route: req.params.page,
      heading: "Acquirer Start",
      backLink: backLink,
      resource: resource,
      assetTitle,
      resourceID: resourceID,
      formdata: req.session.acquirerForms[resourceID],
    });
  } catch (error) {
    console.error("An error occurred while fetching data from the API:", error);
    res.status(500).send("An error occurred while fetching data from the API");
  }
});

router.get("/:resourceID/:step", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const formStep = req.params.step;

  if (!req.session.acquirerForms?.[resourceID]) {
    return res.redirect(`/share/${resourceID}/acquirer`);
  }

  const formdata = req.session.acquirerForms[resourceID];
  const stepData = formdata.steps[formStep];
  const assetTitle = formdata.assetTitle;

  if (req.query.action === "back" && formdata.stepHistory) {
    formdata.stepHistory.pop();
  }

  if (
    stepData.status === "NOT REQUIRED" ||
    stepData.status === "CANNOT START YET"
  ) {
    return res.redirect(`/acquirer/${resourceID}/${stepData.nextStep}`);
  }

  let backLink = null;

  if (!formdata.stepHistory) {
    formdata.stepHistory = [];
  }

  if (formStep === "data-type") {
    // If current step is 'data-type', set the back link to start page ->
    // in preperation for Maddies current work before Annual leave data-type being the only page to start from
    backLink = `/acquirer/${resourceID}/start`;
  } else if (formdata.stepHistory && formdata.stepHistory.length > 0) {
    // Otherwise, set it to the previous step from stepHistory
    backLink = `/acquirer/${resourceID}/${formdata.stepHistory[formdata.stepHistory.length - 1]
      }?action=back`;
  } else {
    backLink = `/acquirer/${resourceID}/start`;
  }

  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    assetTitle,
    backLink,
    stepId: formStep,
    savedValue: stepData.value,
    errorMessage: stepData.errorMessage,
  });
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

  if (!formdata || !formdata.steps[formStep]) {
    return res.status(400).send("Form data or step not found");
  }

  if (!stepData) {
    return res.status(400).send("Step data not found");
  }

  stepData.errorMessage = errorMessage;
  stepData.value = extractFormData(stepData, req.body) || "";

  if (errorMessage) {
    return res.redirect(`/acquirer/${resourceID}/${formStep}`);
  }
  if (!formdata.stepHistory) {
    formdata.stepHistory = [];
  }

  // Check which button was clicked "Save and continue || Save and return"
  if (req.body.returnButton) {
    stepData.status = "IN PROGRESS";
    // Clear the stepHistory array if "Save and return" is clicked
    formdata.stepHistory = [];
    return res.redirect(`/acquirer/${resourceID}/start`);
  } else {
    // Add the current step to the history if it's not already there
    if (formdata.stepHistory.indexOf(formStep) === -1) {
      formdata.stepHistory.push(formStep);
    }
  }

  updateStepsStatus(formStep, stepData.value, formdata);
  // stepData.status = "COMPLETED";

  // Set the status of the next step to "NOT STARTED"
  const nextStep = formdata.steps[formStep].nextStep;

  if (nextStep) {
    return res.redirect(`/acquirer/${resourceID}/${nextStep}`);
  } else {
    // Handle case when nextStep is not defined
    return res.redirect(`/acquirer/${resourceID}/start`);
  }
});

export default router;
