import { body } from "express-validator";

export const validateFormMiddleware = [
  body("day")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 31 })
    .withMessage("Day is invalid")
    .escape(),
  body("month")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 12 })
    .withMessage("Month is invalid")
    .escape(),
  body("year")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Year is invalid")
    .escape(),
];
