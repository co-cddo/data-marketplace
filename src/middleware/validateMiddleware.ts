import { Request, Response, NextFunction } from 'express';
import { getValidationRules } from '../helperFunctions/validateRequest';

export const validateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const formStep = req.params.step;
  const validationRules = getValidationRules(formStep);

  if (validationRules.length > 0) {
    const runValidation = (index: number) => {
      if (index >= validationRules.length) {
        next();
        return;
      }
      validationRules[index](req, res, () => runValidation(index + 1));
    };
    runValidation(0);
  } else {
    next();
  }
};