import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

function getDataTypeValidation() {
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
      .withMessage("Enter aim of your project"),

    body("explanation")
      .not()
      .isEmpty()
      .withMessage("Enter how the data will help you achieve your aims"),
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
      .withMessage("Enter a description of the data subjects"),
  ];
}

function getDataAccessValidation() {
  return [body("data-access").exists().withMessage("Select No or Yes")];
}

function getOtherOrgsValidation(req: Request) {
  if (req.body.removeOrg) {
    const orgIndexToRemove = req.body.removeOrg;

    delete req.body["org-name-" + orgIndexToRemove];
  }

  const validations = [];
  for (const key in req.body) {
    if (key.startsWith("org-name")) {
      validations.push(
        body(key)
          .not()
          .isEmpty()
          .withMessage(
            `Enter the name of the other organisation that will need access to this data`,
          ),
      );
    }
  }
  return validations;
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
      .custom((value, { req }) => {
        if (value || req.body.month || req.body.year) {
          if (!value) {
            throw new Error("Day is required if month or year is provided");
          }
          if (value < 1 || value > 31) {
            throw new Error("Day is invalid");
          }
        }
        return true;
      })
      .optional()
      .escape(),
    body("month")
      .custom((value, { req }) => {
        if (value || req.body.day || req.body.year) {
          if (!value) {
            throw new Error("Month is required if day or year is provided");
          }
          if (value < 1 || value > 12) {
            throw new Error("Month is invalid");
          }
        }
        return true;
      })
      .optional()
      .escape(),
    body("year")
      .custom((value, { req }) => {
        if (value || req.body.day || req.body.month) {
          if (!value) {
            throw new Error("Year is required if day or month is provided");
          }
          const currentYear = new Date().getFullYear();
          if (value < currentYear || value > currentYear + 10) {
            throw new Error("Year must be in the future");
          }
        }
        return true;
      })
      .optional()
      .escape(),
  ];
}

function getBenefitsValidation(req: Request) {
  const errorText = "Enter how your project will provide this public benefit";
  const benefits = req.body.benefits;
  const benefitErrors = [
    body("benefits", "Please select at least one benefit")
      .exists()
      .withMessage("Select one or more benefits"),
  ];
  if (Array.isArray(benefits)) {
    benefits.forEach((benefit: string) => {
      benefitErrors.push(body(benefit).notEmpty().withMessage(`${errorText}`));
    });
  } else {
    benefitErrors.push(body(benefits).notEmpty().withMessage(`${errorText}`));
  }
  return benefitErrors;
}

function getLegalPowerValidation() {
  return [
    body("legal-power").exists().withMessage("Select Yes, No or we don’t know"),
    body("legal-power-input")
      .if(body("legal-power").contains("yes"))
      .notEmpty()
      .withMessage("Enter the legal power")
      .escape(),
  ];
}

function getLegalGatewayValidation() {
  return [
    body("legal-gateway")
      .exists()
      .withMessage("Select Yes, No or we don’t know"),
    body("yes")
      .if(body("legal-gateway").contains("yes"))
      .notEmpty()
      .withMessage("Enter the legal gateway for acquiring this data")
      .escape(),
    body("other")
      .if(body("legal-gateway").contains("other"))
      .notEmpty()
      .withMessage(
        "Enter the other legal grounds that you have for acquiring this data",
      )
      .escape(),
  ];
}

function getLegalReviewValidation() {
  return [body("legal-review").exists().withMessage("Select Yes or No")];
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

function getDataTravelLocationValidation(req: Request) {
  if (req.body.removeCountry) {
    const countryIndexToRemove = req.body.removeCountry;

    delete req.body["country-name-" + countryIndexToRemove];
  }

  const validations = [];
  for (const key in req.body) {
    if (key.startsWith("country-name")) {
      validations.push(
        body(key)
          .not()
          .isEmpty()
          .withMessage(`Enter the country the data will travel through`),
      );
    }
  }
  return validations;
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
  return [body("protection-review").exists().withMessage("Select Yes or No")];
}

function getDeliveryValidation() {
  return [
    body("delivery")
      .exists()
      .withMessage(
        "Select Through secure third-party software, Physical delivery or Something else",
      ),

    body("something-else")
      .if(body("delivery").contains("something"))
      .notEmpty()
      .withMessage("How would you like to receive the data")
      .escape(),
  ];
}

function getFormatValidation() {
  return [
    body("format").exists().withMessage("Select one option"),

    body("something-else")
      .if(body("format").contains("something"))
      .notEmpty()
      .withMessage("Enter preferred format of data")
      .escape(),
  ];
}

function getDisposalValidation() {
  return [
    body("disposal")
      .not()
      .isEmpty()
      .withMessage("Enter how will you dispose of data"),
  ];
}

function getSecurityReviewValidation() {
  return [body("security-review").exists().withMessage("Select Yes or No")];
}

function getValidationRules(req: Request, step: string) {
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
      return getBenefitsValidation(req);
    case "data-access":
      return getDataAccessValidation();
    case "other-orgs":
      return getOtherOrgsValidation(req);
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
    case "data-travel-location":
      return getDataTravelLocationValidation(req);
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

  const validationRules = getValidationRules(req, formStep);
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
      const validMessages = errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => pathsToCheck.includes(item.path))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.msg);

      // Combine the 'msg' values into one message
      const combinedMessage = Array.from(new Set(validMessages)).join(", ");
      errorMessages["dateCombined"] = { text: combinedMessage };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((error: any) => {
      errorMessages[error.path] = { text: error.msg };
    });
    req.session.formErrors = errorMessages;
    req.session.formValuesValidationError = req.body;
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
