import { NextFunction, Request, Response } from "express";

export function backLink(req: Request, res: Response, next: NextFunction) {
  const fromBack = req.query.fromBack === "true";
  req.session.pageHistory = req.session.pageHistory || ["/"];
  req.session.previousUrl = req.session.previousUrl || "";

  // If we end up back on the home page, clear the history
  if (["/", "/?fromBack=true"].includes(req.url)) {
    req.session.pageHistory = ["/"];
    req.session.previousUrl = "/";
    return next();
  }

  // If we're on the same page as previously (I.e. refresh or redirect back):
  // don't change the history
  if (req.session.previousUrl && req.session.previousUrl === req.url) {
    res.locals.pageHistory = req.session.pageHistory;
    return next();
  }

  // If we've pressed the back link, remove the last element from the history
  if (fromBack) {
    req.session.previousUrl = req.session.pageHistory.pop();
    res.locals.pageHistory = req.session.pageHistory;
    return next();
  }

  if (req.method === "GET" && !fromBack && req.session.previousUrl) {
    req.session.pageHistory.push(req.session.previousUrl);
  }
  req.session.previousUrl = req.url;
  res.locals.pageHistory = req.session.pageHistory;
  next();
}
