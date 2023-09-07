import { CustomValidator, body } from "express-validator";

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

export const validateFormMiddleware = [
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
