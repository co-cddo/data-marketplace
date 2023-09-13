import { Request, Response, NextFunction } from "express";
import { CustomValidator, body, validationResult } from "express-validator";

const dateValidator: CustomValidator = (value, { req }) => {
  const day = req.body.day;
  const month = req.body.month;
  const year = req.body.year;
  const currentYear = new Date().getFullYear();

  if (year && year < currentYear) {
    throw new Error("Year cannot be in the past");
  }

  if (day && (!month || !year)) {
    throw new Error("Month and year are invalid.");
  }

  if (month && (!day || !year)) {
    throw new Error("Day and year are invalid.");
  }

  if (year && (!day || !month)) {
    throw new Error("Day and month are invalid");
  }

  if (day && month && !year) {
    throw new Error("Year is invalid");
  }

  if (day && year && !month) {
    throw new Error("Month is invalid");
  }

  if (year && month && !day) {
    throw new Error("Day is invalid");
  }

  return true;
};

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
      .trim() // Remove leading and trailing whitespace
      .not()
      .isEmpty({ ignore_whitespace: true }) // Allow empty strings with only whitespace
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

function getImpactValidation() {
  return [
    body("impact")
      .exists()
      .withMessage(
        "Enter the impact of project if you do not receive the data",
      ),
  ];
}

function getDateValidation() {
  return [
    body("day")
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 31 })
      .withMessage("Day is invalid")
      .custom(dateValidator)
      .escape(),
    body("month")
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 12 })
      .withMessage("Month is invalid")
      .custom(dateValidator)
      .escape(),
    body("year")
      .optional({ checkFalsy: true })
      .isInt({
        min: new Date().getFullYear() - 200,
        max: new Date().getFullYear() + 10,
      })
      .withMessage("Year is invalid")
      .custom(dateValidator)
      .escape(),
  ];
}

function getBenefitsValidation() {
  return [body("benefits").exists().withMessage("Please select an option.")];
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
      .withMessage("Please select an option."),
  ];
}

function getLawfulSpecialValidation() {
  return [
    body("lawful-basis-special")
      .exists()
      .withMessage("Please select an option."),
  ];
}

function getLawfulBasisSpecialPublicInterestValidation() {
  return [
    body("lawful-basis-special-public-interest")
      .exists()
      .withMessage("Please select an option."),
  ];
}

function getDataTravelValidation() {
  return [body("data-travel").exists().withMessage("Select No or Yes")];
}

function getRoleValidation() {
  return [body("role").exists().withMessage("Please select an option.")];
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
  return [body("disposal").exists().withMessage("Please select an option.")];
}

function getSecurityReviewValidation() {
  return [
    body("security-review").exists().withMessage("Please select an option."),
  ];
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
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    const errorMessages: { [key: string]: { text: string } } = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((error: any) => {
      errorMessages[error.path] = { text: error.msg };
    });
    req.session.formErrors = errorMessages;
    console.log("Form errors", req.session.formErrors); //leaving this in for ease of debugging
    return res.redirect(req.originalUrl);
  }

  next();
};
