import { NextFunction, Request, Response } from "express";

export function handleCookies(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies.cookie_policy) {
    res.cookie("cookie_policy", "{essential: true}", { maxAge: 2592000000 });
  }

  const userInteracted = req.cookies.user_interacted === "true";
  res.locals.showCookieBanner = !userInteracted;

  next();
}
