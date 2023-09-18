import express, { Request, Response } from "express";
import { fetchResourceById } from "../services/findService";
import {
  validateFormMiddleware,
  handleValidationErrors,
} from "../middleware/validateFormMiddleware";
const router = express.Router();
import formTemplate from "../models/shareRequestTemplate.json";
import { randomUUID } from "crypto";
import {
  extractFormData,
  checkAnswer,
  updateStepsStatus,
} from "../helperFunctions/formHelper";
import axios from "axios";
import { FormData, GenericStringArray, UserData } from "../types/express";

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
  const userInfo: UserData = req.user;
  const template: FormData = JSON.parse(JSON.stringify(formTemplate));
  template.ownedBy = userInfo.email;
  template.dataAsset = resourceID;
  template.requestId = randomUUID();
  template.assetTitle = assetTitle;
  template.contactPoint = contactPoint;

  return template;
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

  stepData.errorMessage = "";
  if (req.session.formErrors) {
    stepData.errorMessage = req.session.formErrors;
  }
  delete req.session.formErrors;

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
    data: formStep === "check" ? checkAnswer(formdata) : [],
  });
});

const URL = `${process.env.API_ENDPOINT}/sharedata`;

router.post(
  "/:resourceID/:step",
  validateFormMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
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

    stepData.value = extractFormData(stepData, req.body) || "";

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

    updateStepsStatus(
      formStep,
      stepData.value,
      formdata,
      req.body.returnButton,
    );

    const nextStep = formdata.steps[formStep].nextStep;

    if (req.body.continueButton && nextStep) {
      redirectURL = `/acquirer/${resourceID}/${nextStep}`;
    }

    // Send the formdata to the backend if logged in
    if (req.isAuthenticated()) {
      try {
        await axios.put(
          URL,
          { sharedata: formdata },
          { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
        );
      } catch (error: unknown) {
        console.error("Error sending formdata to backend");
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data.detail);
        } else {
          console.error(error);
        }
      }
    }
    return res.redirect(redirectURL);
  },
);

export default router;
