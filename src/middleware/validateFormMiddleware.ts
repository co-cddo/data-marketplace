import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

function getDataTypeValidation() {
  console.log("Validation triggered");
  return [
    body("data-type")
      .exists()
      .withMessage("Select a data type or none of the above"),
  ];
}

function getProjectAimsValidation() {
  return [
    body("aims")
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage("Please provide the aims of your project."),

    body("explanation")
      .not()
      .isEmpty()
      .withMessage(
        "Please explain how the data will help achieve the project aims.",
      ),
  ];
}

function getDataRequiredValidation() {
  return [
    body("data-required")
      .not()
      .isEmpty()
      .withMessage("Enter description of data needed"),
  ];
}

function getDataSubjectValidation() {
  return [
    body("data-subjects")
      .not()
      .isEmpty()
      .withMessage("Enter description of data needed"),
  ];
}

function getDataAccessValidation() {
  return [body("data-access").exists().withMessage("Select No or Yes")];
}

function getOtherOrgsValidation() {
  return [
    body().custom((value, { req }) => {
      const organisationKeys = Object.keys(req.body).filter((key) =>
        key.startsWith("org-name-"),
      );

      if (!organisationKeys.length) {
        throw { text: "Please provide at least one organisation." };
      }

      const errorMessages: Record<string, string> = {};

      for (const orgKey of organisationKeys) {
        if (!req.body[orgKey] || req.body[orgKey].trim() === "") {
          errorMessages[orgKey] = "Organisation name cannot be empty.";
        }
      }

      if (Object.keys(errorMessages).length > 0) {
        req.session.formErrors = errorMessages;
        throw errorMessages;
      }

      return true;
    }),
  ];
}

function getImpactValidation() {
  return [
    body("impact")
      .not()
      .isEmpty()
      .withMessage(
        "Enter the impact of project if you do not receive the data",
      ),
  ];
}

function getDateValidation() {
  return [
    body("day")
      .isInt({ min: 1, max: 31 })
      .withMessage("Day is invalid")
      .escape(),
    body("month")
      .isInt({ min: 1, max: 12 })
      .withMessage("Month is invalid")
      .escape(),
    body("year")
      .isInt({
        min: new Date().getFullYear() - 200,
        max: new Date().getFullYear() + 10,
      })
      .withMessage("Year is invalid")
      .escape(),
  ];
}

function getBenefitsValidation() {
  return [
    body("benefits")
      .exists()
      .withMessage("Select one or more benefits")
      .custom((benefitsArray, { req }) => {
        if (!benefitsArray) {
          return true;
        }

        if (!Array.isArray(benefitsArray)) {
          benefitsArray = [benefitsArray];
        }

        const missingExplanations = [];

        for (const benefit of benefitsArray) {
          const explanation = req.body[benefit];
          console.log("Checked benefit:", benefit);
          console.log("Explanation:", explanation);
          if (!explanation || explanation.trim() === "") {
            missingExplanations.push(benefit);
          }
        }

        if (missingExplanations.length > 0) {
          throw new Error(
            "Enter how your project will provide the public benefit",
          );
        }

        return true;
      }),
  ];
}

function getLegalPowerValidation() {
  return [
    body("legal-power")
      .exists()
      .withMessage("Select Yes, No or we don’t know")
      .custom((value, { req }) => {
        if (value === "yes") {
          if (
            !req.body["legal-power-input"] ||
            req.body["legal-power-input"].trim() === ""
          ) {
            throw new Error("Enter the legal power");
          }
        }
        return true;
      }),
  ];
}

function getLegalGatewayValidation() {
  return [
    body("legal-gateway")
      .exists()
      .withMessage("Select Yes, No or we don’t know")
      .custom((value, { req }) => {
        if (
          value === "yes" &&
          (!req.body["yes"] || req.body["yes"].trim() === "")
        ) {
          throw new Error("Enter the legal gateway explanation");
        }
        if (
          value === "other" &&
          (!req.body["other"] || req.body["other"].trim() === "")
        ) {
          throw new Error("Enter the other legal grounds explanation");
        }
        return true;
      }),
  ];
}

function getLegalReviewValidation() {
  return [
    body("legal-review")
      .exists()
      .withMessage("Select Yes, No or we don’t know"),
  ];
}

function getLawfulPersonalValidation() {
  return [
    body("lawful-basis-personal")
      .exists()
      .withMessage("Select one or more options"),
  ];
}

function getLawfulSpecialValidation() {
  return [
    body("lawful-basis-special")
      .exists()
      .withMessage("Select one or more options"),
  ];
}

function getLawfulBasisSpecialPublicInterestValidation() {
  return [
    body("lawful-basis-special-public-interest")
      .exists()
      .withMessage("Select one or more options"),
  ];
}

function getDataTravelValidation() {
  return [body("data-travel").exists().withMessage("Select No or Yes")];
}

function getRoleValidation() {
  return [
    body("role")
      .exists()
      .withMessage(
        "Select ‘Controller’, ‘Joint Controller’, ‘Processor’ or ‘I don’t know",
      ),
  ];
}

function getProtectionReviewValidation() {
  return [
    body("protection-review").exists().withMessage("Please select an option."),
  ];
}

function getFormatValidation() {
  return [body("format").exists().withMessage("Please select an option.")];
}

function getDeliveryValidation() {
  return [body("delivery").exists().withMessage("Please select an option.")];
}

function getDisposalValidation() {
  return [
    body("disposal").exists().withMessage("Enter how will you dispose of data"),
  ];
}

function getSecurityReviewValidation() {
  return [body("security-review").exists().withMessage("Select Yes or No")];
}

function getValidationRules(step: string) {
  switch (step) {
    case "data-type":
      return getDataTypeValidation();
    case "data-subjects":
      return getDataSubjectValidation();
    case "project-aims":
      return getProjectAimsValidation();
    case "date":
      return getDateValidation();
    case "benefits":
      return getBenefitsValidation();
    case "data-access":
      return getDataAccessValidation();
    case "other-orgs":
      return getOtherOrgsValidation();
    case "impact":
      return getImpactValidation(); // Doesnt seem to work
    case "data-required":
      return getDataRequiredValidation();
    case "legal-power":
      return getLegalPowerValidation();
    case "legal-gateway":
      return getLegalGatewayValidation();
    case "legal-review":
      return getLegalReviewValidation();
    case "lawful-basis-personal":
      return getLawfulPersonalValidation();
    case "lawful-basis-special":
      return getLawfulSpecialValidation();
    case "lawful-basis-special-public-interest":
      return getLawfulBasisSpecialPublicInterestValidation();
    case "data-travel":
      return getDataTravelValidation();
    case "role":
      return getRoleValidation();
    case "protection-review":
      return getProtectionReviewValidation();
    case "delivery":
      return getDeliveryValidation();
    case "format":
      return getFormatValidation();
    case "disposal":
      return getDisposalValidation();
    case "security-review":
      return getSecurityReviewValidation();
    default:
      return [];
  }
}

export const validateFormMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const formStep = req.params.step;

  if (req.body.returnButton) {
    return next();
  }

  const validationRules = getValidationRules(formStep);
  if (validationRules.length > 0) {
    const runValidation = (index: number) => {
      if (index >= validationRules.length) {
        next();
        return;
      }
      validationRules[index](req, res, (err) => {
        if (err) {
          next(err);
        } else {
          runValidation(index + 1);
        }
      });
    };
    runValidation(0);
  } else {
    next();
  }
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors: any = validationResult(req).array();
  if (errors.length > 0) {
    const errorMessages: { [key: string]: { text: string } } = {};
    const { hasDateFields, pathsToCheck } = hasDateField(errors);

    if (hasDateFields) {
      console.log("CONTAINS", hasDateFields);
      const validMessages = errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => pathsToCheck.includes(item.path))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.msg);

      // Combine the 'msg' values into one message
      const combinedMessage = validMessages.join(", ");
      errorMessages["date"] = { text: combinedMessage };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors.forEach((error: any) => {
        errorMessages[error.path] = { text: error.msg };
      });
    }
    req.session.formErrors = errorMessages;
    console.log("Form errors", req.session.formErrors); //leaving this in for ease of debugging
    return res.redirect(req.originalUrl);
  }

  next();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasDateField(errors: any) {
  const pathsToCheck = ["day", "month", "year"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasDateFields = errors.some((item: any) =>
    pathsToCheck.includes(item.path),
  );
  return { hasDateFields, pathsToCheck };
}
