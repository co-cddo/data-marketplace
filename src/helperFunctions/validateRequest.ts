import { body } from 'express-validator';

export const getValidationRules = (step: string) => {
  switch (step) {
    case 'date':
      console.log('Validation step rule: ', step)
      return dateValidationRules();
    default:
      return [];
  }
};

export const dateValidationRules = () => {
  const currentYear = new Date().getFullYear();
  const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  return [
    body('day')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 31 })
    .withMessage('Day is invalid')
      .custom((day, { req }) => {
        const month = req.body.month;
        const year = req.body.year;
        if (month === 2 && year) {
          if ((isLeapYear(year) && day > 29) || (!isLeapYear(year) && day > 28)) {
            throw new Error('Day is invalid for February.');
          }
        } else if ([4, 6, 9, 11].includes(month) && day > 30) {
          throw new Error('Day is invalid for this month.');
        }
        return true;
      }),
    body('month')
    .optional({ checkFalsy: true })
      .isInt({ min: 0, max: 12 })
      .withMessage('Month is invalid'),
    body('year')
      .optional({ checkFalsy: true })
      .isInt({ min: currentYear - 200, max: currentYear + 200 })
      .withMessage('Year is invalid')
      .custom((year) => {
        if (year && year < currentYear) {
          throw new Error('Year cannot be in the past.');
        }
        return true;
      })
  ];
};