import { NextFunction } from "connect";
import { Request, Response } from "express-serve-static-core";
import { CustomValidator, body} from "express-validator";

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

function getDataAccessValidation() {
  return [
    body("data-access")
      .exists()
      .withMessage("Please select an option.")
  ];
}

function getDataTravelValidation() {
  return [
    body("data-travel")
      .exists()
      .withMessage("Please select an option.")
  ];
}

function getRoleValidation() {
  return [
    body("role")
      .exists()
      .withMessage("Please select an option.")
  ];
}
function getFormatValidation() {
  return [
    body("format")
      .exists()
      .withMessage("Please select an option.")
  ];
}
function getDeliveryValidation() {
  return [
    body("delivery")
      .exists()
      .withMessage("Please select an option.")
  ];
}

function getSecurityReviewValidation() {
  return [
    body("security-review")
      .exists()
      .withMessage("Please select an option.")
  ];
}

function getValidationRules(step: string) {
  switch (step) {
    case "date":
      return getDateValidation();
    case "data-access":
      return getDataAccessValidation();
    case "data-travel":
      return getDataTravelValidation();
    case "role":
      return getRoleValidation();
    case "delivery":
      return getDeliveryValidation();
    case "format":
      return getFormatValidation();
    case "security-review":
      return getSecurityReviewValidation();
    default:
      return [];
  }
}

export const validateFormMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const formStep = req.params.step;
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

