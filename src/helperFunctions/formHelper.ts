/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DataTypeStep,
  BenefitsStep,
  DateStep,
  FormatStep,
  LawfulBasisPersonalStep,
  LawfulBasisSpecialStep,
  LawfulBasisSpecialPublicInterestStep,
  LegalGatewayStep,
  LegalPowerStep,
  ProjectAimStep,
  RequestBody,
  Step,
  StepValue,
  RadioFieldStepID,
  TextFieldStepID,
  DeliveryStep,
  FormData,
  GenericStringArray,
} from "../types/express";
import { licences } from "../mockData/licences";
import { replace } from "./checkhelper";

export const updateStepsStatus = (
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
    formdata.steps[currentStep].status = "IN PROGRESS";
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
      if (Object.prototype.hasOwnProperty.call(formdata.steps, s)) {
        formdata.steps[s].status = "NOT REQUIRED";
      }
    }

    // Set everything that needs to be completed to NOT STARTED
    for (const s of notStartedSteps) {
      if (Object.prototype.hasOwnProperty.call(formdata.steps, s)) {
        const stepStatus = formdata.steps[s].status;
        if (!["COMPLETED", "IN PROGRESS"].includes(stepStatus)) {
          formdata.steps[s].status = "NOT STARTED";
        }
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
    if (Object.prototype.hasOwnProperty.call(formdata.steps, "legal-review")) {
      formdata.steps["legal-review"].status = "CANNOT START YET";
    }
    completedSections.delete("legal");
  }

  if (everyStepCompleted(dataProtectionSteps, formdata)) {
    if (formdata.steps["protection-review"].status === "COMPLETED") {
      completedSections.add("data-protection");
    } else {
      formdata.steps["protection-review"].status = "NOT STARTED";
    }
  } else {
    if (
      Object.prototype.hasOwnProperty.call(formdata.steps, "protection-review")
    ) {
      formdata.steps["protection-review"].status = "CANNOT START YET";
    }
    completedSections.delete("data-protection");
  }

  if (everyStepCompleted(securitySteps, formdata)) {
    if (formdata.steps["security-review"].status === "COMPLETED") {
      completedSections.add("security");
    } else {
      formdata.steps["security-review"].status = "NOT STARTED";
    }
  } else {
    if (
      Object.prototype.hasOwnProperty.call(formdata.steps, "security-review")
    ) {
      formdata.steps["security-review"].status = "CANNOT START YET";
    }
    completedSections.delete("security");
  }

  // If every other step is COMPLETED or NOT REQUIRED, set the
  //  check step to NOT STARTED.
  const allSteps = new Set(Object.keys(formdata.steps));
  ["check", "declaration", "confirmation"].forEach((s) => allSteps.delete(s));
  if (!["check", "declaration", "confirmation"].includes(currentStep)) {
    completedSections.delete("check");
    if (everyStepCompleted([...allSteps], formdata)) {
      formdata.steps["check"].status = "NOT STARTED";
    } else if (Object.prototype.hasOwnProperty.call(formdata.steps, "check")) {
      formdata.steps["check"].status = "CANNOT START YET";
    }
  } else {
    completedSections.add("check");
  }

  // Update the number of completed sections
  formdata.completedSections = completedSections.size;
};

const everyStepCompleted = (steps: string[], formdata: FormData) => {
  return steps.every(
    (step) =>
      Object.prototype.hasOwnProperty.call(formdata.steps, step) &&
      ["COMPLETED", "NOT REQUIRED"].includes(formdata.steps[step].status),
  );
};

function isRadioField(id: string): id is RadioFieldStepID {
  return [
    "data-access",
    "legal-review",
    "role",
    "data-travel",
    "protection-review",
    "security-review",
  ].includes(id);
}

function isTextField(id: string): id is TextFieldStepID {
  return ["impact", "data-subjects", "data-required", "disposal"].includes(id);
}

const extractFormData = (stepData: Step, body: RequestBody): StepValue => {
  // Return something that will get set in the 'value' key of the form step
  // Will need to something different depending on whether the input is a radio button
  //  or text field or checkbox etc.
  // All simple radio button-style forms:
  // (As long as the radio group has a name the same as the step id

  // Check for radio fields
  if (isRadioField(stepData.id)) {
    return body[stepData.id] as StepValue;
  }

  // Check for text fields
  if (isTextField(stepData.id)) {
    return body[stepData.id] as StepValue;
  }

  if (stepData.id === "other-orgs") {
    const orgValues = Object.keys(body)
      .filter((key) => key.startsWith("org-name-"))
      .map((key) => body[key]);

    return orgValues as GenericStringArray;
  }

  if (stepData.id === "data-travel-location") {
    const countryValues = Object.keys(body)
      .filter((key) => key.startsWith("country-name-"))
      .map((key) => body[key]);

    return countryValues as GenericStringArray;
  }

  if (stepData.id === "data-type") {
    return {
      personal: {
        checked: body["data-type"]?.includes("personal"),
      },
      special: {
        checked: body["data-type"]?.includes("special"),
      },
      none: {
        checked: body["data-type"]?.includes("none"),
      },
    } as DataTypeStep;
  }

  if (stepData.id === "project-aims") {
    return {
      aims: body["aims"] || "",
      explanation: body["explanation"] || "",
    } as ProjectAimStep;
  }

  if (stepData.id === "date") {
    return {
      day: body.day || null,
      month: body.month || null,
      year: body.year || null,
    } as DateStep;
  }

  if (stepData.id === "benefits") {
    return {
      "decision-making": {
        explanation: body["decision-making"],
        checked: body["benefits"]?.includes("decision-making"),
      },
      "service-delivery": {
        explanation: body["service-delivery"],
        checked: body["benefits"]?.includes("service-delivery"),
      },
      "benefit-people": {
        explanation: body["benefit-people"],
        checked: body["benefits"]?.includes("benefit-people"),
      },
      "allocate-and-evaluate-funding": {
        explanation: body["allocate-and-evaluate-funding"],
        checked: body["benefits"]?.includes("allocate-and-evaluate-funding"),
      },
      "social-economic-trends": {
        explanation: body["social-economic-trends"],
        checked: body["benefits"]?.includes("social-economic-trends"),
      },
      "needs-of-the-public": {
        explanation: body["needs-of-the-public"],
        checked: body["benefits"]?.includes("needs-of-the-public"),
      },
      "statistical-information": {
        explanation: body["statistical-information"],
        checked: body["benefits"]?.includes("statistical-information"),
      },
      "existing-research-or-statistics": {
        explanation: body["existing-research-or-statistics"],
        checked: body["benefits"]?.includes("existing-research-or-statistics"),
      },
      "something-else": {
        explanation: body["something-else"],
        checked: body["benefits"]?.includes("something-else"),
      },
    } as BenefitsStep;
  }

  if (stepData.id === "legal-power") {
    return {
      yes: {
        explanation: body["legal-power-textarea"] || "",
        checked: body["legal-power"] === "yes",
      },
      no: {
        checked: body["legal-power"] === "no",
      },
      "we-dont-know": {
        checked: body["legal-power"] === "we-dont-know",
      },
    } as LegalPowerStep;
  }

  if (stepData.id === "legal-gateway") {
    return {
      yes: {
        explanation: body["legal-gateway"] === "yes" ? body["yes"] : "",
        checked: body["legal-gateway"] === "yes",
      },
      other: {
        explanation: body["legal-gateway"] === "other" ? body["other"] : "",
        checked: body["legal-gateway"] === "other",
      },
      "we-dont-know": {
        explanation:
          body["legal-gateway"] === "we-dont-know" ? body["we-dont-know"] : "",
        checked: body["legal-gateway"] === "we-dont-know",
      },
    } as LegalGatewayStep;
  }

  if (stepData.id === "delivery") {
    return {
      "third-party": {
        checked: body["delivery"] === "third-party",
      },
      physical: {
        checked: body["delivery"] === "physical",
      },
      something: {
        checked: body["delivery"] === "something",
        explanation:
          body["delivery"] === "something" ? body["something-else"] : "",
      },
    } as DeliveryStep;
  }

  if (stepData.id === "format") {
    return {
      csv: {
        checked: body["format"] === "csv",
      },
      sql: {
        checked: body["format"] === "sql",
      },
      something: {
        checked: body["format"] === "something",
        explanation:
          body["format"] === "something" ? body["something-else"] : "",
      },
    } as FormatStep;
  }

  if (stepData.id === "lawful-basis-personal") {
    return {
      "public-task": {
        checked: body["lawful-basis-personal"]?.includes("public-task"),
      },
      "legal-obligation": {
        checked: body["lawful-basis-personal"]?.includes("legal-obligation"),
      },
      contract: {
        checked: body["lawful-basis-personal"]?.includes("contract"),
      },
      "legitimate-interests": {
        checked: body["lawful-basis-personal"]?.includes(
          "legitimate-interests",
        ),
      },
      consent: {
        checked: body["lawful-basis-personal"]?.includes("consent"),
      },
      "vital-interest": {
        checked: body["lawful-basis-personal"]?.includes("vital-interest"),
      },
      "law-enforcement": {
        checked: body["lawful-basis-personal"]?.includes("law-enforcement"),
      },
    } as LawfulBasisPersonalStep;
  }

  if (stepData.id === "lawful-basis-special") {
    return {
      "reasons-of-public-interest": {
        checked: body["lawful-basis-special"]?.includes(
          "reasons-of-public-interest",
        ),
      },
      "legal-claim-or-judicial-acts": {
        checked: body["lawful-basis-special"]?.includes(
          "legal-claim-or-judicial-acts",
        ),
      },
      "public-health": {
        checked: body["lawful-basis-special"]?.includes("public-health"),
      },
      "health-or-social-care": {
        checked: body["lawful-basis-special"]?.includes(
          "health-or-social-care",
        ),
      },
      "social-employment-security-and-protection": {
        checked: body["lawful-basis-special"]?.includes(
          "social-employment-security-and-protection",
        ),
      },
      "vital-interests": {
        checked: body["lawful-basis-special"]?.includes("vital-interests"),
      },
      "explicit-consent": {
        checked: body["lawful-basis-special"]?.includes("explicit-consent"),
      },
      "public-by-data-subject": {
        checked: body["lawful-basis-special"]?.includes(
          "public-by-data-subject",
        ),
      },
      "archiving-researching-statistics": {
        checked: body["lawful-basis-special"]?.includes(
          "archiving-researching-statistics",
        ),
      },
      "not-for-profit-bodies": {
        checked: body["lawful-basis-special"]?.includes(
          "not-for-profit-bodies",
        ),
      },
    } as LawfulBasisSpecialStep;
  }

  if (stepData.id === "lawful-basis-special-public-interest") {
    return {
      statutory: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("statutory"),
      },
      administration: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes(
            "administration",
          ),
      },
      equality: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("equality"),
      },
      "preventing-detecting": {
        checked: body["lawful-basis-special-public-interest"]?.includes(
          "preventing-detecting",
        ),
      },
      protecting: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("protecting"),
      },
      "regulatory-requirements": {
        checked: body["lawful-basis-special-public-interest"]?.includes(
          "regulatory-requirements",
        ),
      },
      journalism: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("journalism"),
      },
      "preventing-fraud": {
        checked:
          body["lawful-basis-special-public-interest"]?.includes(
            "preventing-fraud",
          ),
      },
      suspicion: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("suspicion"),
      },
      support: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("support"),
      },

      counselling: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("counselling"),
      },
      "safeguarding-children": {
        checked: body["lawful-basis-special-public-interest"]?.includes(
          "safeguarding-children",
        ),
      },
      "safeguarding-economic": {
        checked: body["lawful-basis-special-public-interest"]?.includes(
          "safeguarding-economic",
        ),
      },
      insurance: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("insurance"),
      },
      "occupational-pensions": {
        checked: body["lawful-basis-special-public-interest"]?.includes(
          "occupational-pensions",
        ),
      },
      "political-parties": {
        checked:
          body["lawful-basis-special-public-interest"]?.includes(
            "political-parties",
          ),
      },
      elected: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("elected"),
      },
      disclosure: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("disclosure"),
      },
      informing: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("informing"),
      },
      "legal-judgments": {
        checked:
          body["lawful-basis-special-public-interest"]?.includes(
            "legal-judgments",
          ),
      },
      "anti-doping": {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("anti-doping"),
      },
      standards: {
        checked:
          body["lawful-basis-special-public-interest"]?.includes("standards"),
      },
    } as LawfulBasisSpecialPublicInterestStep;
  }

  // Other input types can go here
  return "";
};

function getLicenceTitleFromURL(licenceURL: string): string {
  const licence = licences.find(
    (l) => normaliseURL(l.url) === normaliseURL(licenceURL),
  );
  return licence ? licence.title : licenceURL; // return the original URL if no match found
}

function normaliseURL(url: string): string {
  // Convert to lowercase
  let normalisedURL = url.toLowerCase();

  // Strip http:// or https://
  normalisedURL = normalisedURL.replace(/^https?:\/\//, "");

  // Remove trailing slash
  if (normalisedURL.endsWith("/")) {
    normalisedURL = normalisedURL.slice(0, -1);
  }

  return normalisedURL;
}

type CheckPageRow = {
  key: {
    text: string;
  };
  value: {
    html: string;
  };
  actions: {
    items: [
      {
        href: string;
        text: string;
        visuallyHiddenText: string;
      },
    ];
  };
};

type CheckPageSection = {
  name: string;
  rows: CheckPageRow[];
};

function checkAnswer(formdata: FormData) {
  const steps = formdata.steps;
  const rows: Record<string, CheckPageRow> = {};
  const dataObj: CheckPageSection[] = [];

  for (const [stepId, stepData] of Object.entries(steps)) {
    const dataTypeValue: string[] = [];
    if (stepData.status === "NOT REQUIRED") {
      dataTypeValue.push(`<span class="not-required">Not Required</span>`);
    } else {
      const type = replace[stepId]?.type;
      switch (type) {
        case "string":
          dataTypeValue.push(stepData.value as string);
          break;
        case "radio":
          dataTypeValue.push(replace[stepId].data[stepData.value as string]);
          break;
        case "object":
          const answerProject = stepData.value as ProjectAimStep;
          dataTypeValue.push(
            `<div>${answerProject.aims}</div><br/><div>${answerProject.explanation}</div>`,
          );
          break;
        case "date":
          const date = stepData.value as DateStep;
          if (date.year) {
            dataTypeValue.push(`${date.day}/${date.month}/${date.year}`);
          } else {
            dataTypeValue.push(`<span class="not-required">Unrequested</span>`);
          }
          break;
        case "checked":
          for (const [answerId, answerVal] of Object.entries(stepData.value)) {
            const explanation = answerVal.explanation || "";
            if (answerVal.checked) {
              dataTypeValue.push(`${replace[stepId].data[answerId]}<br/>`);
            }
            if (explanation) {
              dataTypeValue.push(
                `<p class="govuk-body-s caption-color">${explanation}</p>`,
              );
            }
            // Do something slightly different for the public interest answers
            if (answerId === "reasons-of-public-interest") {
              const publicInterestAnswers = steps[
                "lawful-basis-special-public-interest"
              ].value as LawfulBasisSpecialPublicInterestStep;
              dataTypeValue.push(
                `<ul class="govuk-list govuk-list--bullet govuk-body-s caption-color">`,
              );
              for (const [
                publicInterestKey,
                publicInterestAnswer,
              ] of Object.entries(publicInterestAnswers)) {
                if (publicInterestAnswer.checked) {
                  dataTypeValue.push(
                    `<li>${replace["lawful-basis-special-public-interest"].data[publicInterestKey]}</li>`,
                  );
                }
              }
              dataTypeValue.push("</ul>");
            }
          }
          break;
        case "list":
          const answer = replace[stepId].data[stepData.value as string];
          dataTypeValue.push(answer.res);
          let attachedStep = steps[answer.attach]?.value as GenericStringArray;
          if (attachedStep) {
            if (typeof attachedStep === "string") {
              attachedStep = [attachedStep];
            }
            dataTypeValue.push(
              `<p class="govuk-body-s caption-color">${answer?.title}</p>`,
            );
            dataTypeValue.push(
              `<ul class="govuk-list govuk-list--bullet govuk-body-s caption-color">`,
            );
            attachedStep.forEach((s) => dataTypeValue.push(`<li>${s}</li>`));
            dataTypeValue.push("</ul>");
          }
          break;
      }
    }

    rows[stepId] = {
      key: { text: stepData.name },
      value: { html: dataTypeValue.join("") },
      actions: {
        items: [
          {
            href: `/acquirer/${formdata.dataAsset}/${stepId}`,
            text: "Change",
            visuallyHiddenText: "name",
          },
        ],
      },
    };
  }

  // Split the rows up into the correct sections
  for (const [sectionName, sectionData] of Object.entries(
    formdata.overviewSections,
  )) {
    if (sectionName === "review") continue;
    const sectionRows: CheckPageRow[] = [];
    sectionData.steps.forEach((s) => sectionRows.push(rows[s]));
    dataObj.push({
      name: sectionData.name,
      rows: sectionRows,
    });
  }
  return dataObj;
}

export { extractFormData, getLicenceTitleFromURL, checkAnswer };
