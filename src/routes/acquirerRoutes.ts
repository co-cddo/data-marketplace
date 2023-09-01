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
  GenericStringArray,
} from "../types/express";

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

const generateFormTemplate = (
  req: Request,
  resourceID: string,
  assetTitle: string,
  contactPoint: {
    contactName: string;
    email: string | null;
    address?: string | null;
  },
) => {
  const userInfo = req.user ? parseJwt(req.user.idToken) : null;
  const username = userInfo ? userInfo.email : "anonymous";
  const template = JSON.parse(JSON.stringify(formTemplate));
  template.ownedBy = username;
  template.dataAsset = resourceID;
  template.requestId = randomUUID();
  template.assetTitle = assetTitle;
  template.contactPoint = contactPoint;

  return template;
};

const everyStepCompleted = (steps: string[], formdata: FormData) => {
  return steps.every((step) =>
    ["COMPLETED", "NOT REQUIRED"].includes(formdata.steps[step].status),
  );
};

const updateStepsStatus = (
  currentStep: string,
  stepValue: StepValue,
  formdata: FormData,
  returnToStart: boolean,
) => {
  const completedSections = new Set();

  // Group up the steps so we can work out which sections have been completed later
  const purposeSteps = [
    "data-type",
    "data-subjects",
    "project-aims",
    "data-required",
    "benefits",
    "data-access",
    "other-orgs",
    "impact",
    "date",
  ];

  const legalSteps = [
    "legal-power",
    "legal-power-advice",
    "legal-gateway",
    "legal-gateway-advice",
  ];

  const dataProtectionSteps = [
    "lawful-basis-personal",
    "lawful-basis-special",
    "lawful-basis-special-public-interest",
    "data-travel",
    "data-travel-location",
    "role",
  ];

  const securitySteps = ["delivery", "format", "disposal"];

  // If "Save and return" was clicked, set to "IN PROGRESS" if needed and return
  if (returnToStart) {
    if (formdata.steps[currentStep].status !== "COMPLETED") {
      formdata.steps[currentStep].status = "IN PROGRESS";
    }
    return;
  } else {
    // If "Save and Continue" was clicked, set this step to "COMPLETED"
    formdata.steps[currentStep].status = "COMPLETED";
  }

  if (currentStep === "data-type") {
    const notRequiredSteps = new Set<string>();
    const notStartedSteps = new Set<string>();
    const val = stepValue as DataTypeStep;
    // If personal is not checked then lawful-basis-personal is not required
    if (!val.personal.checked) {
      notRequiredSteps.add("lawful-basis-personal");
    } else {
      notStartedSteps.add("data-subjects");
      notStartedSteps.add("lawful-basis-personal");
      notStartedSteps.add("role");
    }
    // If special is not checked then lawful-basis-special is not required
    if (!val.special.checked) {
      notRequiredSteps.add("lawful-basis-special");
      notRequiredSteps.add("lawful-basis-special-public-interest");
    } else {
      notStartedSteps.add("data-subjects");
      notStartedSteps.add("lawful-basis-special");
      notStartedSteps.add("role");
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

    // Set everything that's not required to NOT REQUIRED
    for (const s of notRequiredSteps) {
      formdata.steps[s].status = "NOT REQUIRED";
    }

    // Set everything that needs to be completed to NOT STARTED
    for (const s of notStartedSteps) {
      const stepStatus = formdata.steps[s].status;
      if (!["COMPLETED", "IN PROGRESS"].includes(stepStatus)) {
        formdata.steps[s].status = "NOT STARTED";
      }
    }
  }

  if (currentStep === "data-access") {
    if (!stepValue || stepValue === "no") {
      formdata.steps["other-orgs"].status = "NOT REQUIRED";
    } else {
      formdata.steps["other-orgs"].status = "NOT STARTED";
    }
  }

  if (currentStep === "legal-power") {
    if ((stepValue as LegalPowerStep).yes.checked) {
      formdata.steps["legal-power-advice"].status = "NOT REQUIRED";
    } else {
      formdata.steps["legal-power-advice"].status = "NOT STARTED";
      formdata.steps[currentStep].status = "IN PROGRESS";
    }
  }

  if (currentStep === "legal-gateway") {
    const legalGatewayStep = stepValue as LegalGatewayStep;
    if (legalGatewayStep.yes.checked || legalGatewayStep.other.checked) {
      formdata.steps["legal-gateway-advice"].status = "NOT REQUIRED";
    } else {
      formdata.steps["legal-gateway-advice"].status = "NOT STARTED";
      formdata.steps[currentStep].status = "IN PROGRESS";
    }
  }

  if (currentStep === "check") {
    formdata.steps["declaration"].status = "NOT STARTED";
  }

  if (currentStep === "declaration") {
    formdata.steps["confirmation"].status = "NOT STARTED";
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
    if (!stepValue || stepValue === "no") {
      formdata.steps["data-travel-location"].status = "NOT REQUIRED";
    } else {
      formdata.steps["data-travel-location"].status = "NOT STARTED";
      formdata.steps[currentStep].status = "IN PROGRESS";
    }
  }

  // Loop over all the steps in each section to check whether the
  //  section is complete and/or the 'check' step can be enabled

  if (everyStepCompleted(purposeSteps, formdata)) {
    completedSections.add("purpose");
  } else {
    completedSections.delete("purpose");
  }

  if (everyStepCompleted(legalSteps, formdata)) {
    // If all the legal steps AND the legal review is completed, legal is done.
    if (formdata.steps["legal-review"].status === "COMPLETED") {
      completedSections.add("legal");
    } else {
      formdata.steps["legal-review"].status = "NOT STARTED";
    }
  } else {
    // If not all of the legal steps are Completed, legal review cannot be started
    formdata.steps["legal-review"].status = "CANNOT START YET";
    completedSections.delete("legal");
  }

  if (everyStepCompleted(dataProtectionSteps, formdata)) {
    if (formdata.steps["protection-review"].status === "COMPLETED") {
      completedSections.add("data-protection");
    } else {
      formdata.steps["protection-review"].status = "NOT STARTED";
    }
  } else {
    formdata.steps["protection-review"].status = "CANNOT START YET";
    completedSections.delete("data-protection");
  }

  if (everyStepCompleted(securitySteps, formdata)) {
    if (formdata.steps["security-review"].status === "COMPLETED") {
      completedSections.add("security");
    } else {
      formdata.steps["security-review"].status = "NOT STARTED";
    }
  } else {
    formdata.steps["security-review"].status = "CANNOT START YET";
    completedSections.delete("security");
  }

  // If every other step is COMPLETED or NOT REQUIRED, set the
  //  check step to NOT STARTED.
  const allSteps = new Set(Object.keys(formdata.steps));
  ["check", "declaration", "confirmation"].forEach((s) => allSteps.delete(s));
  if (everyStepCompleted([...allSteps], formdata)) {
    formdata.steps["check"].status = "NOT STARTED";
  } else {
    formdata.steps["check"].status = "CANNOT START YET";
  }

  // Update the number of completed sections
  formdata.completedSections = completedSections.size;
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
    const contactPoint = resource.contactPoint;

    if (!contactPoint) {
      res.status(404).send("Contact point not found");
      return;
    }

    // Generate a new set of form data if there wasn't one already in the session
    req.session.acquirerForms = req.session.acquirerForms || {};
    req.session.acquirerForms[resourceID] =
      req.session.acquirerForms?.[resourceID] ||
      generateFormTemplate(req, resourceID, assetTitle, contactPoint);

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
  const contactPoint = formdata.contactPoint;

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

  if (formdata.stepHistory && formdata.stepHistory.length > 0) {
    // Otherwise, set it to the previous step from stepHistory
    backLink = `/acquirer/${resourceID}/${
      formdata.stepHistory[formdata.stepHistory.length - 1]
    }?action=back`;
  } else {
    backLink = `/acquirer/${resourceID}/start`;
  }
  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    assetTitle,
    contactPoint: contactPoint,
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

  if (req.body.addCountry) {
    if (Array.isArray(formdata.steps["data-travel-location"].value)) {
      formdata.steps["data-travel-location"].value.push(""); // Add a new empty string.
    } else {
      // handle error or other logic if value isn't an array
      console.error(
        "Expected 'data-travel-location' value to be an array but it wasn't.",
      );
    }
    return res.redirect(`/acquirer/${resourceID}/data-travel-location`);
  }

  if (req.body.removeCountry !== undefined) {
    const countryIndexToRemove = parseInt(req.body.removeCountry, 10) - 1;
    if (
      formdata.steps["data-travel-location"] &&
      Array.isArray(formdata.steps["data-travel-location"].value)
    ) {
      const country = formdata.steps["data-travel-location"]
        .value as GenericStringArray;

      if (
        Number.isInteger(countryIndexToRemove) &&
        countryIndexToRemove >= 0 &&
        countryIndexToRemove < country.length
      ) {
        country.splice(countryIndexToRemove, 1);
      }
    }
    return res.redirect(`/acquirer/${resourceID}/data-travel-location`);
  }

  if (req.body.addMoreOrgs) {
    // If "Add another organisation" is clicked.
    if (Array.isArray(formdata.steps["other-orgs"].value)) {
      formdata.steps["other-orgs"].value.push(""); // Add a new empty string.
    } else {
      // handle error or other logic if value isn't an array
      console.error(
        "Expected 'other-orgs' value to be an array but it wasn't.",
      );
    }
    return res.redirect(`/acquirer/${resourceID}/other-orgs`); // Refresh the current page.
  }

  if (req.body.removeOrg !== undefined) {
    const orgIndexToRemove = parseInt(req.body.removeOrg, 10) - 1;
    if (
      formdata.steps["other-orgs"] &&
      Array.isArray(formdata.steps["other-orgs"].value)
    ) {
      const orgs = formdata.steps["other-orgs"].value as GenericStringArray;

      if (
        Number.isInteger(orgIndexToRemove) &&
        orgIndexToRemove >= 0 &&
        orgIndexToRemove < orgs.length
      ) {
        orgs.splice(orgIndexToRemove, 1);
      }
    }
    return res.redirect(`/acquirer/${resourceID}/other-orgs`);
  }

  if (req.body.continueButton && formStep === "declaration") {
    formdata.status = "AWAITING REVIEW";
  }

  // Check which button was clicked "Save and continue || Save and return"
  let redirectURL = `/acquirer/${resourceID}/start`;
  if (req.body.returnButton) {
    // If save and return was clicked, clear the step history
    formdata.stepHistory = [];
  } else {
    // Otherwise add the current step to the history if it's not already there
    if (formdata.stepHistory.indexOf(formStep) === -1) {
      formdata.stepHistory.push(formStep);
    }
  }

  if (req.body.continueButton && formStep === "confirmation") {
    return res.redirect(`/manage-shares/created-requests`);
  }

  updateStepsStatus(formStep, stepData.value, formdata, req.body.returnButton);

  const nextStep = formdata.steps[formStep].nextStep;

  if (req.body.continueButton && nextStep) {
    redirectURL = `/acquirer/${resourceID}/${nextStep}`;
  }

  return res.redirect(redirectURL);
});

export default router;
