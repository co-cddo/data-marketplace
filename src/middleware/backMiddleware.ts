import { NextFunction, Request, Response } from "express";

export function backLink(req: Request, res: Response, next: NextFunction) {
  const fromBack = req.query.fromBack === "true";
  req.session.pageHistory = req.session.pageHistory || [];
  const urlIndex = req.session.pageHistory.indexOf(req.url);

  if (
    req.method === "GET" &&
    !fromBack && //dont add the page you just went back to, otherwise you get a loop
    !req.session.pageHistory.includes(req.url)
  ) {
    req.session.pageHistory.push(req.url);
    const maxHistoryLength = 5;
    if (req.session.pageHistory.length > maxHistoryLength) {
      req.session.pageHistory.shift();
    }
  } else {
    req.session.pageHistory.splice(urlIndex, 1);
  }
  res.locals.pageHistory = req.session.pageHistory;
  next();
}
