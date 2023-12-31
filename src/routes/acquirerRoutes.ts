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
import {
  FormData,
  GenericStringArray,
  ShareRequestResponse,
  UserData,
} from "../types/express";

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

const URL = `${process.env.API_ENDPOINT}/sharedata`;

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

    try {
      await axios.put(
        URL,
        { sharedata: req.session.acquirerForms[resourceID] },
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

router.get("/:resourceID/check", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;

  if (!req.session.acquirerForms?.[resourceID]) {
    return res.redirect(`/share/${resourceID}/acquirer`);
  }

  const formdata = req.session.acquirerForms[resourceID];

  let returnedNotes, returnedNotesTitle;
  try {
    const shareRequestDetailResponse = await axios.get(
      `${process.env.API_ENDPOINT}/manage-shares/received-requests/${formdata.requestId}`,
      {
        headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
      },
    );
    const shareRequestDetail =
      shareRequestDetailResponse.data as ShareRequestResponse;
    req.session.acquirerForms![shareRequestDetail.sharedata.dataAsset] =
      shareRequestDetail.sharedata;
    returnedNotes = shareRequestDetail.decisionNotes;
    returnedNotesTitle = `From ${shareRequestDetail.assetPublisher.title}`;

    res.render(`../views/acquirer/check.njk`, {
      requestId: formdata.requestId,
      data: checkAnswer(formdata),
      returnedNotes,
      returnedNotesTitle,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
      );
      console.error(error.response?.data.detail);
    } else {
      console.error(error);
    }
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

  if (
    stepData.status === "NOT REQUIRED" ||
    stepData.status === "CANNOT START YET"
  ) {
    return res.redirect(`/acquirer/${resourceID}/${stepData.nextStep}`);
  }

  // handle form errors
  if (req.session.formValuesValidationError) {
    stepData.value = extractFormData(
      stepData,
      req.session.formValuesValidationError,
    );
    delete req.session.formValuesValidationError;
  }

  res.render(`../views/acquirer/${formStep}.njk`, {
    requestId: formdata.requestId,
    assetId: formdata.dataAsset,
    assetTitle,
    contactPoint: contactPoint,
    stepId: formStep,
    savedValue: stepData.value,
    errorMessage: stepData.errorMessage,
  });
});

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

    if (formStep === "benefits") {
      const benefitsData = stepData.value;
      for (const value of Object.values(benefitsData)) {
        if (!value.checked) {
          value.explanation = "";
        }
      }
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

    updateStepsStatus(
      formStep,
      stepData.value,
      formdata,
      req.body.returnButton,
    );

    const nextStep = formdata.steps[formStep].nextStep;

    let redirectURL = `/acquirer/${resourceID}/start`;
    if (req.body.continueButton && nextStep) {
      redirectURL = `/acquirer/${resourceID}/${nextStep}`;
    }

    //reset errors at this point as API doesnt need them and validation has happened
    formdata.steps[formStep].errorMessage = "";

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
